const { CloudWatchClient, GetMetricDataCommand } = require("@aws-sdk/client-cloudwatch"); // CommonJS import

const getMetricData = async (StartTime, EndTime, metricNamespace, virtualNodeName) => {
  const client = new CloudWatchClient();
  const MetricDataQueries = [
    {
      Id: "id1",
      MetricStat: {
        Metric: {
          Namespace: `${metricNamespace}`,
          MetricName: "envoy_appmesh_HTTPCode_Target_5XX_Count",
          Dimensions: [
            {
              Name: "Mesh",
              Value: "chimera" // hard coded for testing
            },
            {
              Name: "TargetVirtualNode",
              Value: `${virtualNodeName}`
            }
          ]
        },
        Period: 60,
        Stat: "Average"
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

const getHealthCheck = async (failureThresholdTime, metricNamespace, virtualNodeName) => {
  const millisecondsNow = Date.now();
  const now = new Date(millisecondsNow);
  const start = new Date(millisecondsNow - failureThresholdTime);
  const response = await getMetricData(start, now, metricNamespace, virtualNodeName);
  console.log("response:", response);
  const values = response.MetricDataResults[0].Values;
  console.log("values:", values);
  if (values.reduce((a, v) => a + v, 0) > 0) { // hard coded for testing
    throw new Error("the canary is not healthy");
  }
};

module.exports = {
  getHealthCheck,
};
