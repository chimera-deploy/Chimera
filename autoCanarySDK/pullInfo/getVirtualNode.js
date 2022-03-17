const { AppMeshClient, DescribeVirtualNodeCommand } = require("@aws-sdk/client-app-mesh");

const getVirtualNode = async (meshName, virtualNodeName) => {
  const client = new AppMeshClient();

  const describeNodeInput = {
    meshName,
    virtualNodeName
  }

  const command = new DescribeVirtualNodeCommand(describeNodeInput)
  const response = await client.send(command);
  return response.virtualNode;
}

module.exports = getVirtualNode;