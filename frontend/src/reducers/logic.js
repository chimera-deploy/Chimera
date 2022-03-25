const init = {
  meshDetails: {
    nodes: [],
    routers: [],
    routes: null
  },
  ecsServices: {
    ECSServiceNames: []
  },
  ecsDetails: {
    originalTaskDefinition: "",
    containerNames: []
  },
  page: "welcome",
  baseInfoEntered: false
};

const logic = (state = init, action) => {
  switch (action.type) {
    case "BASE_INFO_SUBMITTED": {
      return {
        ...state,
        baseInfoEntered: true
      }
    }
    case "TO_SETUP": {
      return {
        ...state,
        page: "setup"
      }
    }
    case "TO_DEPLOY": {
      return {
        ...state,
        page: "deploy"
      }
    }
    default: {
      return state;
    }
  };
};

export default logic;
