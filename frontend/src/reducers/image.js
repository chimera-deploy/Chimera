import cloudwatch from "../services/cloudwatch";

const init = {
  metricWidget: "",
};

const image = (state = init, action) => {
  switch (action.type) {
    case "GET_METRIC_WIDGET_SUCCESS": {
      return {
        ...state,
        metricWidget: action.payload.metricWidget.b64
      };
    }
    default: {
      return state;
    }
  };
};

export const readMetricWidget = (shiftWeight, routeUpdateInterval, metricNamespace, newTaskDefinitionName, clusterName, region) => {
  return async dispatch => {
    const metricInput = {
      MetricWidget: JSON.stringify({
        width: 1200,
        height: 600,
        title: "canary health",
        start: `-PT${(100 / Number(shiftWeight)) * Number(routeUpdateInterval)}M`,
        metrics: [
          [
            metricNamespace,
            "envoy_http_downstream_rq_xx",
            "TaskDefinitionFamily",
            newTaskDefinitionName,
            "envoy_http_conn_manager_prefix",
            "ingress",
            "envoy_response_code_class",
            "5",
            "ClusterName",
            clusterName,
            {
              id: "m1",
              stat: "Sum",
              label: `5xx responses from ${newTaskDefinitionName}`,
              period: 60
            }
          ],
          [
            metricNamespace,
            "envoy_http_downstream_rq_xx",
            "TaskDefinitionFamily",
            newTaskDefinitionName,
            "envoy_http_conn_manager_prefix",
            "ingress",
            "envoy_response_code_class",
            "2",
            "ClusterName",
            clusterName,
            {
              id: "m2",
              stat: "Sum",
              label: `2xx responses from ${newTaskDefinitionName}`,
              period: 60
            }
          ]
        ]
      })
    };
    const metricWidget = await cloudwatch.getCWMetricWidget(metricInput, region);
    dispatch({ type: "GET_METRIC_WIDGET_SUCCESS", payload: { metricWidget } });
  };
};

export default image;
