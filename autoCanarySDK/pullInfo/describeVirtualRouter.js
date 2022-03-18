const { AppMeshClient, DescribeVirtualRouterCommand } = require("@aws-sdk/client-app-mesh")

const describeVirtualRouter = async (clientConfig, meshName, virtualRouterName) => {
  const client = new AppMeshClient(clientConfig)
  const input = {
    meshName,
    virtualRouterName
  }

  const command = new DescribeVirtualRouterCommand(input)
  
  try {
    const response = await client.send(command)
    console.log(`Success describing Virtual Router named ${virtualRouterName}`)
    return response.virtualRouter
  } catch(err) {
    console.log(`ERROR describing Virtual Router named ${virtualRouterName}`)
  }
}

// const clientConfig = { region: 'us-west-2' }
// const meshName = 'apps'
// const virtualRouterName = 'servicea'

// describeVirtualRouter(clientConfig, meshName, virtualRouterName).then(resp => console.log(resp))

module.exports = describeVirtualRouter