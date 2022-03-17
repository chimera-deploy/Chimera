const { ECSClient, ListTasksCommand,  ListTaskDefinitionsCommand, DescribeTasksCommand, DescribeTaskDefinitionCommand } = require("@aws-sdk/client-ecs"); // CommonJS import

const describeTaskDefinition = async () => {
  const input = {
    taskDefinition: "chimera-movieselector-1:12"
  };
  let response;
  try {
    const client = new ECSClient();
    const command = new DescribeTaskDefinitionCommand(input);
    response = await client.send(command);
  } catch (err) {
    console.log(`received error:`, err);
    return
  }
  console.log(`received response`);
  return response.taskDefinition;
};

describeTaskDefinition();

const describeTasks = async () => {
  const input = {
    tasks: [
      "arn:aws:ecs:us-east-1:339936612855:task/chimera/0ab9aaf590f64ab882330e0d8b3b7d11"
    ]
  };
  let response;
  try {
    const client = new ECSClient();
    const command = new DescribeTasksCommand(input);
    response = await client.send(command);
    console.log(response);
  } catch (err) {
    console.log(`received error:`, err);
    return
  }
  console.log(`received response`);
  return response;
};

// describeTasks();

const listTaskDefinitions = async () => {
  const input = {

  };
  let response;
  try {
    const client = new ECSClient();
    const command = new ListTaskDefinitionsCommand(input);
    response = await client.send(command);
  } catch (err) {
    console.log(`received error:`, err);
    return
  }
  console.log(`received response`);
  return response;
};

const listTasks = async () => {
  const input = {
    cluster: "chimera"
  };
  let response;
  try {
    const client = new ECSClient();
    const command = new ListTasksCommand(input);
    response = await client.send(command);
  } catch (err) {
    console.log(`received error:`, err);
    return
  }
  console.log(`received response`);
  return response;
};

// (async () => {
//   const data = await listTaskDefinitions();
//   console.log(data);
// })();

module.exports = {
  describeTaskDefinition,
};