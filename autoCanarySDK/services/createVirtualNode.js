const { AppMeshClient, CreateVirtualNodeCommand } = require("@aws-sdk/client-app-mesh")

const createVirtualNode = async (chimeraConfig) => {
  const appMeshClient = new AppMeshClient();

  const virtualNodeName = `${chimeraConfig.serviceName}-${chimeraConfig.newVersionNumber}`
  const serviceDiscoveryName = `${chimeraConfig.serviceName}.${chimeraConfig.domain}`;

  const backends = chimeraConfig.backends.map(backend => {
    return {
      virtualService: {
        virtualServiceName: backend,
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
        { dns: 
          {
            hostname: serviceDiscoveryName,
            name: virtualNodeName,
          }
      },
    },
    virtualNodeName,
  };
  
  const createVirtualNode = new CreateVirtualNodeCommand(virtualNodeInput)
  
  try {
    const response = await appMeshClient.send(createVirtualNode)
    console.log(`Success creating Virtual Node named ${virtualNodeName}`)
    console.log(response)
    return response
  } catch(err) {
    console.log(`ERROR creating Virtual Node named ${virtualNodeName}`)
    console.log(err)
    return err
  }
}

module.exports = createVirtualNode;