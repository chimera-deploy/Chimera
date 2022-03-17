const { AppMeshClient, DescribeVirtualGatewayCommand } = require("@aws-sdk/client-app-mesh")

const describeVirtualGateway = async (clientConfig, meshName, virtualGatewayName) => {
  const client = new AppMeshClient(clientConfig);
  const input = {
    meshName,
    virtualGatewayName
  }

  const command = new DescribeVirtualGatewayCommand(input);
  
  try {
    const response = await client.send(command);
    console.log(`Success describing Virtual Gatway named ${virtualGatewayName}`)
    return response.virtualGateway
  } catch(err) {
    console.log(`ERROR describing Virtual Gateway named ${virtualGatewayName}`)
  }
}

// const clientConfig = { region: 'us-west-2' }
// const meshName = 'apps'
// const virtualGatewayName = 'apps-gateway'

// describeVirtualGateway(clientConfig, meshName, virtualGatewayName).then(res => console.log(res.virtualGateway))


module.exports = { describeVirtualGateway }