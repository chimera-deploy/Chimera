const { AppMeshClient, CreateVirtualNodeCommand } = require("@aws-sdk/client-app-mesh")

const createVirtualNode = async (chimeraConfig, virtualNodeName, taskName) => {
  const appMeshClient = new AppMeshClient();

  const backends = chimeraConfig.backends.map(backend => {
    return {
      virtualService: {
        virtualServiceName: backend.virtualServiceName,
      },
    };
  });

  const virtualNodeInput = {
    meshName: chimeraConfig.meshName,
    spec: {
      backends,
      listeners: [ 
        {
          portMapping: {
            port: Number(chimeraConfig.containerPort),
            protocol: chimeraConfig.containerProtocol,
          }
        }
      ],
      serviceDiscovery: 
      /*
        TODO: We will need to generalize this so that the user can specify whether dns or cloudmap should
        be used. For now we are assuming cloudmap service discovery. We may also be able to use one option either way.
        We will have to look into this.
      */
        { awsCloudMap: 
          {
            attributes: [{ key: 'ECS_TASK_DEFINITION_FAMILY', value: taskName }],
            namespaceName: chimeraConfig.domain,
            serviceName: chimeraConfig.serviceName,
          }
      },
    },
    virtualNodeName,
  };
  
  const createVirtualNode = new CreateVirtualNodeCommand(virtualNodeInput)
  
  try {
    const response = await appMeshClient.send(createVirtualNode)
    console.log(`Success creating Virtual Node named ${virtualNodeName}`)
    return response
  } catch(err) {
    console.log(`ERROR creating Virtual Node named ${virtualNodeName}`)
    console.log(err)
    return err
  }
}

module.exports = createVirtualNode;