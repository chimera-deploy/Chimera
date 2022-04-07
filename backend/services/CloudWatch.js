const { CloudWatchClient, GetMetricDataCommand, GetMetricWidgetImageCommand } = require("@aws-sdk/client-cloudwatch");

const getMetricWidgetImage = async (config) => {
  const metricInput = {
    MetricWidget: JSON.stringify({
      width: 1200,
      height: 600,
      title: "canary health",
      start: `-PT${(100 / Number(config.shiftWeight)) * Number(config.routeUpdateInterval)}M`,
      metrics: [
        [
          config.metricNamespace,
          "envoy_http_downstream_rq_xx",
          "TaskDefinitionFamily",
          config.newTaskDefinitionName,
          "envoy_http_conn_manager_prefix",
          "ingress",
          "envoy_response_code_class",
          "5",
          "ClusterName",
          config.clusterName,
          {
            id: "m1",
            stat: "Sum",
            label: `5xx responses from ${config.newTaskDefinitionName}`,
            period: 60
          }
        ],
        [
          config.metricNamespace,
          "envoy_http_downstream_rq_xx",
          "TaskDefinitionFamily",
          config.newTaskDefinitionName,
          "envoy_http_conn_manager_prefix",
          "ingress",
          "envoy_response_code_class",
          "2",
          "ClusterName",
          config.clusterName,
          {
            id: "m2",
            stat: "Sum",
            label: `2xx responses from ${config.newTaskDefinitionName}`,
            period: 60
          }
        ]
      ]
    })
  };
  const client = new CloudWatchClient(config.clientRegion);
  const command = new GetMetricWidgetImageCommand(metricInput);
  const response = await client.send(command);
  const u8 = new Uint8Array(response.MetricWidgetImage);
  const b64 = Buffer.from(u8).toString('base64');
  return b64;
};

const getMetricData = async (StartTime, EndTime, metricNamespace, clusterName, taskName, clientRegion) => {
  const client = new CloudWatchClient(clientRegion);
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

const getHealthCheck = async (failureThresholdTime, metricNamespace, clusterName, taskName, maxFailures, clientRegion) => {
  const millisecondsNow = Date.now();
  const now = new Date(millisecondsNow);
  const start = new Date(millisecondsNow - (failureThresholdTime * 1));
  const response = await getMetricData(start, now, metricNamespace, clusterName, taskName, clientRegion);
  const values = response.MetricDataResults[0].Values;
  console.log("values downstream/ingress 500:", values);
  if (values.reduce((a, v) => a + v, 0) > maxFailures) {
    throw new Error("the canary is not healthy");
  }
};

module.exports = {
  getHealthCheck,
  getMetricWidgetImage,
};
