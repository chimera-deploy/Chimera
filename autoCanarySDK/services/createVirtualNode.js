const { AppMeshClient, CreateVirtualNodeCommand } = require("@aws-sdk/client-app-mesh")
const { getVirtualNode } = require('../pullInfo/getVirtualNode');

const createVirtualNode = async (meshName, virtualNodeName, originalNodeName, taskName) => {
  const appMeshClient = new AppMeshClient();
  const originalNode = await getVirtualNode(meshName, originalNodeName);
  originalNode.virtualNodeName = virtualNodeName;
  if (originalNode.spec.serviceDiscovery.awsCloudMap) {
    const newAttributes = originalNode.spec.serviceDiscovery.awsCloudMap.attributes.map(attr => {
      if (attr.key !== 'ECS_TASK_DEFINITION_FAMILY') {
        return attr;
      } else {
        return { key: 'ECS_TASK_DEFINITION_FAMILY', value: taskName };
      }
    });
    originalNode.spec.serviceDiscovery.awsCloudMap.attributes = newAttributes;
  }

  const createVirtualNode = new CreateVirtualNodeCommand(originalNode);
  const response = await appMeshClient.send(createVirtualNode);
  return response;
};

module.exports = createVirtualNode;