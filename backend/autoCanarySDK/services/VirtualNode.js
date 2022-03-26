const { AppMeshClient, CreateVirtualNodeCommand, DeleteVirtualNodeCommand, DescribeVirtualNodeCommand } = require("@aws-sdk/client-app-mesh")
const region = {region: 'us-west-2'}

const create = async (meshName, virtualNodeName, originalNodeName, taskName) => {
  const appMeshClient = new AppMeshClient(region);
  const originalNode = await describe(meshName, originalNodeName);
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

const destroy = async (meshName, virtualNodeName) => {
  const client = new AppMeshClient(region);
  const input = {
    meshName: meshName,
    virtualNodeName: virtualNodeName,
  };

  const command = new DeleteVirtualNodeCommand(input);

  const response = await client.send(command);
  return response;
};

const describe = async (meshName, virtualNodeName) => {
  const client = new AppMeshClient(region);

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