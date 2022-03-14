const { ECSClient, RegisterTaskDefinitionCommand } = require("@aws-sdk/client-ecs")

const registerTaskDefinition = async (chimeraConfig) => {
  const client = new ECSClient();
  const taskName = `${chimeraConfig.meshName}-${chimeraConfig.serviceName}-${chimeraConfig.newVersionNumber}`;

  const executionIAMRole = 'chimera-base-TaskExecutionIAMRole-WMD65MW6ITDB';
  const taskIAMRole = 'chimera-base-TaskIAMRole-YYP4E9K0WEKZ';

  const registerTaskDefinitionInput = {
    family: taskName,
    containerDefinitions: [
      {
        name: chimeraConfig.containerName,
        dependsOn: [
          {
            condition: 'START',
            containerName: 'envoy'
          }
        ],
        image: chimeraConfig.imageURL,
        portMappings: [
          {
            containerPort: Number(chimeraConfig.containerPort),
            protocol: chimeraConfig.containerProtocol
          }
        ],
        environment: [
          {
            name: 'PORT',
            value: chimeraConfig.containerPort,
          },
          {
            name: 'BACKENDS',
            value: JSON.stringify(chimeraConfig.backends),
          }
        ]
      },
      {
        portMappings: [
          {
            containerPort: 9901,
            protocol: 'tcp',
          },
          {
            containerPort: 15000,
            protocol: 'tcp',
          },
          {
            containerPort: 15001,
            protocol: 'tcp',
          },
        ],
        environment: [
          {
            name: "APPMESH_VIRTUAL_NODE_NAME",
            value: `mesh/${chimeraConfig.meshName}/virtualNode/${chimeraConfig.serviceName}-${chimeraConfig.newVersionNumber}`,
          },
        ],
        memory: 500,
        image: "840364872350.dkr.ecr.us-west-2.amazonaws.com/aws-appmesh-envoy:v1.21.1.0-prod",
        healthCheck: {
          retries: 3,
          command: [
            "CMD-SHELL",
            "curl -s http://localhost:9901/server_info | grep state | grep -q LIVE"
          ],
          timeout: 2,
          interval: 5,
          startPeriod: 10
        },
        essential: true,
        user: "1337",
        name: "envoy"
      }
    ],
    cpu: '256',
    memory: '512',
    executionRoleArn: executionIAMRole,
    taskRoleArn: taskIAMRole,
    networkMode: 'awsvpc',
    proxyConfiguration: {
      type: "APPMESH",
      containerName: "envoy",
      properties: [
        {
          name: "ProxyIngressPort",
          value: "15000"
        },
        {
          name: "AppPorts",
          value: chimeraConfig.containerPort,
        },
        {
          name: "EgressIgnoredIPs",
          value: "169.254.170.2,169.254.169.254"
        },
        {
          name: "IgnoredGID",
          value: ""
        },
        {
          name: "EgressIgnoredPorts",
          value: ""
        },
        {
          name: "IgnoredUID",
          value: "1337"
        },
        {
          name: "ProxyEgressPort",
          value: "15001"
        }
      ]
    },
  }

  const registerTaskDefinitionCommand = new RegisterTaskDefinitionCommand(registerTaskDefinitionInput);

  try {
    const response = await client.send(registerTaskDefinitionCommand)
    console.log(`Success registering new Task Definition named ${taskName}`)
    console.log(response)
    return response
  } catch(err) {
    console.log(`ERROR registering new Task Definition named ${taskName}`)
    console.log(err)
    return err
  }
}

module.exports = registerTaskDefinition