const { AppMeshClient, ListVirtualNodesCommand } = require("@aws-sdk/client-app-mesh");
const { builtinModules } = require("module");

const AppMesh = {
  async nodeNames(meshName) {
    const input = {
      meshName,
    };

    const command = new ListVirtualNodesCommand(input);
    const client = new AppMeshClient();

    const response = await client.send(command);
    const nodes = response.virtualNodes;
    return nodes.map(node => node.virtualNodeName);
  }
}

module.exports = AppMesh;