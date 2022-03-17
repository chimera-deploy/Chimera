const { AppMeshClient, DescribeVirtualNodeCommand, ListVirtualNodesCommand } = require("@aws-sdk/client-app-mesh");

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

const listVirtualNodes = async (meshName) => {
  const client = new AppMeshClient();

  const listNodesInput = {
    meshName,
  }

  const command = new ListVirtualNodesCommand(listNodesInput);
  const response = await client.send(command);
  return response.virtualNodes;
}

module.exports = {
  getVirtualNode,
  listVirtualNodes,
}