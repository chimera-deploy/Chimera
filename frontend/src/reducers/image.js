import cloudwatch from "../services/cloudwatch";

const init = {
  metricGraph: "",
};

const image = (state = init, action) => {
  switch (action.type) {
    case "GET_METRIC_WIDGET_SUCCESS": {
      return {
        ...state,
        metricGraph: action.payload.metricWidgetImage,
      }
    }
    default: {
      return state;
    }
  };
};

export const readMetricWidget = (metricInput, cwConfig) => {
  return async dispatch => {
    const metricWidgetImage = await cloudwatch.getMetricWidget(metricInput, cwConfig);
    dispatch({ type: "GET_METRIC_WIDGET_SUCCESS", payload: { metricWidgetImage } });
  };
};

export default image;
