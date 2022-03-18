const { ECSClient, ListTasksCommand, DescribeTaskDefinitionCommand } = require("@aws-sdk/client-ecs"); // CommonJS import

const describeTaskDefinition = async (taskDefinition) => {
  const input = {
    taskDefinition,
  };
  let response;
  try {
    const client = new ECSClient();
    const command = new DescribeTaskDefinitionCommand(input);
    response = await client.send(command);
  } catch (err) {
    return err
  }
  return response.taskDefinition;
};

const listTasks = async (clusterName, taskFamily) => {
  const input = {
    cluster: clusterName,
    family: taskFamily,
  };
  try {
    const client = new ECSClient();
    const command = new ListTasksCommand(input);
    const response = await client.send(command);
    return response.taskArns;
  } catch (err) {
    console.log(err);
    return err
  }
};

module.exports = {
  describeTaskDefinition,
  listTasks,
};