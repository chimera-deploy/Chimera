const {
  ECSClient,
  RegisterTaskDefinitionCommand,
  DescribeTaskDefinitionCommand,
  ListTasksCommand,
  DeregisterTaskDefinitionCommand
} = require("@aws-sdk/client-ecs");

const register = async (appImageURL, appContainerName, virtualNodeName, envoyContainerName, originalTaskName, taskName, meshName, region, account) => {
  const client = new ECSClient();
  const taskDefinition = await describe(originalTaskName);
  taskDefinition.family = taskName;

  const appContainerDef = taskDefinition.containerDefinitions.find(def => {
    return def.name === appContainerName;
  });
  appContainerDef.image = appImageURL;

  const envoyContainerDef = taskDefinition.containerDefinitions.find(def => {
    return def.name === envoyContainerName;
  });

  envoyContainerDef.dockerLabels = {
    "ECS_PROMETHEUS_METRICS_PATH": "/stats/prometheus",
    "ECS_PROMETHEUS_EXPORTER_PORT": "9901"
  };

  envoyContainerDef.environment = envoyContainerDef.environment.map(env => {
    if (env.name !== "APPMESH_VIRTUAL_NODE_NAME" && env.name !== "APPMESH_RESOURCE_ARN") {
      return env;
    } else {
      return {
        name: "APPMESH_RESOURCE_ARN",
        value: `arn:aws:appmesh:${region}:${account}:mesh/${meshName}/virtualNode/${virtualNodeName}`
      }
    }
  });

  const registerTaskDefinitionCommand = new RegisterTaskDefinitionCommand(taskDefinition);

  const response = await client.send(registerTaskDefinitionCommand);
  return response.taskDefinition;
};

const createCW = async (awsAccountID, metricNamespace, cwTaskRole, cwExecutionRole) => {
  const client = new ECSClient();
  let input = {
    containerDefinitions: [
      {
        name: "cwagent",
        image: "public.ecr.aws/cloudwatch-agent/cloudwatch-agent:latest",
        essential: true,
        environment: [
          {
            name: "PROMETHEUS_CONFIG_CONTENT",
            value: JSON.stringify({
              "global": {
                "scrape_interval": "1m",
                "scrape_timeout": "10s"
              },
              "scrape_configs": [
                {
                  "job_name": "cwagent-ecs-file-sd-config",
                  "sample_limit": 10000,
                  "file_sd_configs": [
                    {
                      "files": [
                        "/tmp/cwagent_ecs_auto_sd.yaml"
                      ]
                    }
                  ]
                }
              ]
            })
          },
          {
            name: "CW_CONFIG_CONTENT",
            value: JSON.stringify({
              "logs": {
                "force_flush_interval": 5,
                "metrics_collected": {
                  "prometheus": {
                    "prometheus_config_path": "env:PROMETHEUS_CONFIG_CONTENT",
                    "ecs_service_discovery": {
                      "sd_frequency": "1m",
                      "docker_label": {},
                      "sd_result_file": "/tmp/cwagent_ecs_auto_sd.yaml"
                    },
                    "emf_processor": {
                      "metric_namespace": `${metricNamespace}`,
                      "metric_declaration_dedup": true,
                      "metric_declaration": [
                        {
                          "source_labels": ["container_name"],
                          "label_matcher": "^envoy$",
                          "dimensions": [["ClusterName","TaskDefinitionFamily","envoy_http_conn_manager_prefix","envoy_response_code_class"]],
                          "metric_selectors": [
                            "^envoy_http_downstream_rq_.+$"
                          ]
                        }
                      ]
                    }
                  }
                }
              }
            })
          }
        ]
      }
    ],
    cpu: "512",
    executionRoleArn: `arn:aws:iam::${awsAccountID}:role/${cwExecutionRole.RoleName}`,
    family: "cwagent",
    memory: "1024",
    networkMode: "awsvpc",
    requiresCompatibilities: [ "FARGATE" ],
    taskRoleArn: `arn:aws:iam::${awsAccountID}:role/${cwTaskRole.RoleName}`
  };

  const command = new RegisterTaskDefinitionCommand(input);
  const response = await client.send(command);
  return response.taskDefinition;
};

const describe = async (taskDefinition) => {
  const input = {
    taskDefinition,
  };
  const client = new ECSClient();
  const command = new DescribeTaskDefinitionCommand(input);
  const response = await client.send(command);
  return response.taskDefinition;
};

const listTasks = async (clusterName, taskFamily) => {
  const input = {
    cluster: clusterName,
    family: taskFamily,
  };
  const client = new ECSClient();
  const command = new ListTasksCommand(input);
  const response = await client.send(command);
  return response.taskArns;
};

const deregister = async (taskDefinitionName) => {
  const client = new ECSClient();
  const deregisterTaskDefinitionCommandInput = {
    taskDefinition: taskDefinitionName,
  };

  const command = new DeregisterTaskDefinitionCommand(deregisterTaskDefinitionCommandInput);
  const response = await client.send(command);
  return response;
};

module.exports = {
  createCW,
  register,
  describe,
  deregister,
  listTasks,
};
