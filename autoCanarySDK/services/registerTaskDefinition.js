const { ECSClient, RegisterTaskDefinitionCommand } = require("@aws-sdk/client-ecs");

const registerTaskDefinition = async (chimeraConfig, taskName, virtualNodeName) => {
  const client = new ECSClient();

  const executionIAMRole = 'chimera-base-TaskExecutionIAMRole-O2S5Y8J5XWU5';
  const taskIAMRole = 'chimera-base-TaskIAMRole-1O0KKQBI4I33G';

  const backends = chimeraConfig.backends.map(backend => `${backend.virtualServiceName}:${backend.port}`);

  const registerTaskDefinitionInput = {
    family: taskName,
    containerDefinitions: [
      {
        name: chimeraConfig.containerName,
        dependsOn: [
          {
            condition: 'START',
            containerName: 'envoy'
          },
        ],
        image: chimeraConfig.imageURL,
        portMappings: [
          {
            containerPort: Number(chimeraConfig.containerPort),
            protocol: chimeraConfig.containerProtocol
          },
        ],
        environment: [
          {
            name: 'PORT',
            value: chimeraConfig.containerPort,
          },
          {
            name: 'BACKENDS',
            value: JSON.stringify(backends),
          },
        ],
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
            value: `mesh/${chimeraConfig.meshName}/virtualNode/${virtualNodeName}`,
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
      },
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
        },
      ],
    },
  };

  const registerTaskDefinitionCommand = new RegisterTaskDefinitionCommand(registerTaskDefinitionInput);

  try {
    const response = await client.send(registerTaskDefinitionCommand);
    console.log(`Success registering new Task Definition named ${taskName}`);
    return response;
  } catch(err) {
    console.log(`ERROR registering new Task Definition named ${taskName}`);
    console.log(err);
    return err;
  }
}

module.exports = registerTaskDefinition;