const { CloudWatchClient, GetMetricDataCommand } = require("@aws-sdk/client-cloudwatch"); // CommonJS import

const getMetricData = async (StartTime, EndTime, metricNamespace, clusterName, taskName) => {
  const client = new CloudWatchClient();
  const MetricDataQueries = [
    {
      Id: "id1",
      MetricStat: {
        Metric: {
          Namespace: `${metricNamespace}`,
          MetricName: "envoy_http_downstream_rq_xx",
          Dimensions: [
            {
              Name: "TaskDefinitionFamily",
              Value: taskName
            },
            {
              Name: "envoy_http_conn_manager_prefix",
              Value: "ingress"
            },
            {
              Name: "envoy_response_code_class",
              Value: "5"
            },
            {
              Name: "ClusterName",
              Value: clusterName
            }
          ]
        },
        Period: 60,
        Stat: "Sum"
      },
      ReturnData: true
    }
  ];
  const input = {
    StartTime,
    EndTime,
    MetricDataQueries,
    ScanBy: "TimestampDescending"
  };
  const command = new GetMetricDataCommand(input);
  return await client.send(command);
};

const getHealthCheck = async (failureThresholdTime, metricNamespace, clusterName, taskName, maxFailures) => {
  console.log(taskName)
  const millisecondsNow = Date.now();
  const now = new Date(millisecondsNow);
  const start = new Date(millisecondsNow - (failureThresholdTime * 2));
  const response = await getMetricData(start, now, metricNamespace, clusterName, taskName);
  const values = response.MetricDataResults[0].Values;
  console.log("values downstream/ingress 500:", values);
  if (values.reduce((a, v) => a + v, 0) > maxFailures) { // hard coded for testing
    throw new Error("the canary is not healthy");
  }
};

module.exports = {
  getHealthCheck,
};
