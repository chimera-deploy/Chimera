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
    case "TO_WELCOME": {
      return {
        ...state,
        metricWidget: ""
      };
    }
    default: {
      return state;
    }
  };
};

export const readMetricWidget = (shiftWeight, routeUpdateInterval, metricNamespace, newTaskDefinitionName, clusterName, region) => {
  return async dispatch => {

    const metricWidget = await cloudwatch.getCWMetricWidget(metricInput, region);
    dispatch({ type: "GET_METRIC_WIDGET_SUCCESS", payload: { metricWidget } });
  };
};

export default image;
