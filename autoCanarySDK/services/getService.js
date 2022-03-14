const { ServiceDiscoveryClient, GetServiceCommand, CreatePublicDnsNamespaceRequest, ServiceTypeOption } = require("@aws-sdk/client-servicediscovery");

const getService = async (serviceId, clientConfig) => {
  const serviceInput = {
    Id: serviceId
  }
  const serviceClient = new ServiceDiscoveryClient(clientConfig);
  const serviceCommand = new GetServiceCommand(serviceInput)
  
  try {
    const serviceResponse = await serviceClient.send(serviceCommand)
    console.log(`Success retrieving service details for ID ${serviceId}`)
    console.log(serviceResponse)
    return serviceResponse
  } catch(err) {
    console.log(`ERROR retrieving service details for ID ${serviceId}`)
    console.log(err)
    return err
  }
}

module.exports = getService
getService('srv-mesgbyykdafdewbm', {region: 'us-west-2'})
