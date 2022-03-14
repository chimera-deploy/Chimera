const { ServiceDiscoveryClient,CreateServiceCommand } = require("@aws-sdk/client-servicediscovery")

const createServiceName = async (clientConfiguration, serviceName, namespaceId) => {
  const serviceDiscoveryClient = new ServiceDiscoveryClient(clientConfiguration)
  const newServiceName = serviceName
  const newServiceNamespaceID = namespaceId

  const createServiceInput = {
    Name: newServiceName,
    DnsConfig: {
      DnsRecords: [
        {
          TTL: 5,
          Type: 'A'
        }
      ],
      NamespaceId: newServiceNamespaceID,
    },    
  }

  const createServiceCommand = new CreateServiceCommand(createServiceInput)
  try {
    const response = await serviceDiscoveryClient.send(createServiceCommand)
    console.log(`New Service Discovery named ${newServiceName} created`)
    console.log(response)
    return response
  } catch(err) {
    console.log(`ERROR creating New Service Discovery named ${newServiceName}`)
    console.log(err)
    return err
  }
}

module.exports = createServiceName

