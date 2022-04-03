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

export const readMetricWidget = () => {
  return async dispatch => {
    console.log("requesting image")
    const metricWidget = await cloudwatch.getCWMetricWidget();
    dispatch({ type: "GET_METRIC_WIDGET_SUCCESS", payload: { metricWidget } });
  };
};

export default image;
