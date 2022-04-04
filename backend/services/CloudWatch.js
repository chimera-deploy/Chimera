const { CloudWatchClient, GetMetricDataCommand, GetMetricWidgetImageCommand } = require("@aws-sdk/client-cloudwatch");

const getMetricWidgetImage = async (metricInput, clientRegion) => {
  const client = new CloudWatchClient(clientRegion);
  const command = new GetMetricWidgetImageCommand(metricInput);
  const response = await client.send(command);
  return response.MetricWidgetImage;
};

const getMetricData = async (StartTime, EndTime, metricNamespace, clusterName, taskName, meshName, openTelemetryNamespace, callers, virtualService, target, clientRegion) => {
  const client = new CloudWatchClient(clientRegion);
  const MetricDataQueries = [
    {
      Id: "id0",
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
    },
    ...callers.map((caller, idx) =>
      ({
        Id: `id${idx+1}`,
        MetricStat: {
          Metric: {
            Namespace: openTelemetryNamespace,
            MetricName: "envoy.appmesh.TargetResponseTime",
            Dimensions: [
              {
                Name: "Mesh",
                Value: meshName
              },
              {
                Name: caller.type === "gateway" ? "VirtualGateway": "VirtualNode",
                Value: caller.name
              },
              {
                Name: "TargetVirtualService",
                Value: virtualService
              },
              {
                Name: "TargetVirtualNode",
                Value: target
              }
            ]
          },
          Period: 60,
          Stat: "Average"
        },
        ReturnData: true
      })
    )
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

const getHealthCheck = async (failureThresholdTime, metricNamespace, clusterName, taskName, meshName, openTelemetryNamespace, arrOfCallers, virtualService, target, maxFailures, maxResponseTime, clientRegion) => {
  const millisecondsNow = Date.now();
  const now = new Date(millisecondsNow);
  const start = new Date(millisecondsNow - failureThresholdTime);
  const callers = arrOfCallers || [];
  const response = await getMetricData(start, now, metricNamespace, clusterName, taskName, meshName, openTelemetryNamespace, callers, virtualService, target, clientRegion);
  const serviceErrors = response.MetricDataResults[0].Values;
  console.log("downstream/ingress 5xxs:", serviceErrors);
  const responseTimes =
    response.MetricDataResults
      .slice(1)
      .flatMap(result => result.Values);
  console.log("response times:", responseTimes);
  if (serviceErrors.reduce((a, v) => a + v, 0) > maxFailures || (responseTimes.reduce((a, v) => a + v, 0) / responseTimes.length) > maxResponseTime) {
    throw new Error("the canary is not healthy");
  }
};

module.exports = {
  getHealthCheck,
  getMetricWidgetImage,
};
