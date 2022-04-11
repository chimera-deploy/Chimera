const init = {
  events: [],
  metrics: '',
};

const events = (state = init, action) => {
  switch (action.type) {
    case "EVENT_RECEIVED": {
      return {
        ...state,
        events: action.payload,
      }
    }
    case "METRICS_RECEIVED": {
      return {
        ...state,
        metrics: action.payload,
      }
    }
    case "RESET_ALL_FORMS": {
      return init;
    }
    default: {
      return state;
    }
  };
};

export default events;
