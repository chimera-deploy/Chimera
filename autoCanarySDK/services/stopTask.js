const { ECSClient, StopTaskCommand } = require("@aws-sdk/client-ecs")

const stopTask = async (clientConfig, cluster, reason, task) => {
  const client = new ECSClient(clientConfig);
  const stopTaskCommandInput = {
    cluster,
    reason,
    task,
  }
  const command = new StopTaskCommand(stopTaskCommandInput);

  try {
    const response = await client.send(command)
    console.log(`Success stopping task ID# ${task}`)
    console.log(response)
    return response
  } catch(err) {
    console.log(`ERROR stopping task ID# ${task}`)
    console.log(err)
    return err
  } 
}

// const cluster = 'app'
// const reason = 'Stopping Task for service deletion'
// const task = '91690a292c1e443eb603d3980d1231fe'
// stopTask({ region: 'us-west-2' }, cluster, reason, task)

module.exports = stopTask