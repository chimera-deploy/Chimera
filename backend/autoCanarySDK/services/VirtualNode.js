const { AppMeshClient, CreateVirtualNodeCommand, DeleteVirtualNodeCommand, DescribeVirtualNodeCommand } = require("@aws-sdk/client-app-mesh")

const create = async (meshName, virtualNodeName, originalNodeName, taskName, clientRegion) => {
  const appMeshClient = new AppMeshClient(clientRegion);
  const originalNode = await describe(meshName, originalNodeName, clientRegion);
  originalNode.virtualNodeName = virtualNodeName;
  if (originalNode.spec.serviceDiscovery.awsCloudMap) {
    let needToAdd = true;
    const newAttributes = originalNode.spec.serviceDiscovery.awsCloudMap.attributes.map(attr => {
      if (attr.key !== 'ECS_TASK_DEFINITION_FAMILY') {
        return attr;
      } else {
        needToAdd = false
        return { key: 'ECS_TASK_DEFINITION_FAMILY', value: taskName };
      }
    });

    if (needToAdd) {
      newAttributes.push({ key: "ECS_TASK_DEFINITION_FAMILY", value: taskName })
    }

    originalNode.spec.serviceDiscovery.awsCloudMap.attributes = newAttributes;
  }

  const createVirtualNode = new CreateVirtualNodeCommand(originalNode);
  const response = await appMeshClient.send(createVirtualNode);
  return response.virtualNode;
};

const destroy = async (meshName, virtualNodeName, clientRegion) => {
  const client = new AppMeshClient(clientRegion);
  const input = {
    meshName: meshName,
    virtualNodeName: virtualNodeName,
  };

  const command = new DeleteVirtualNodeCommand(input);

  const response = await client.send(command);
  return response;
};

const describe = async (meshName, virtualNodeName, clientRegion) => {
  const client = new AppMeshClient(clientRegion);

  const describeNodeInput = {
    meshName,
    virtualNodeName,
  };

  const command = new DescribeVirtualNodeCommand(describeNodeInput);
  const response = await client.send(command);
  return response.virtualNode;
};

module.exports = {
  create,
  destroy,
  describe,
};