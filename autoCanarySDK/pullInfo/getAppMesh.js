const { AppMeshClient, DescribeMeshCommand } = require("@aws-sdk/client-app-mesh");

const getAppMesh = async (meshName) => {
  const client = new AppMeshClient();

  const describeMeshInput = {
    meshName,
  }

  const command = new DescribeMeshCommand(describeMeshInput);
  const response = await client.send(command);
  return response.mesh;
}

exports.module = {
  getAppMesh,
}
