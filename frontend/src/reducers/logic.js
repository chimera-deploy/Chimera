import ecs from "../services/ecs";
import mesh from "../services/mesh";
import cloudwatch from "../services/cloudwatch";

const init = {
  ecsServices: null,
  ecsDetails: null,
  meshDetails: null,
  cwDetails: null,
  page: "welcome",
  baseInfoEntered: false,
  setupInfoEntered: false,
  deployInfoEntered: false,
  ecsServiceSelected: false,
};

const logic = (state = init, action) => {
  switch (action.type) {
    case "BASE_INFO_SUBMITTED": {
      return {
        ...state,
        baseInfoEntered: true
      }
    }
    case "SETUP_INFO_SUBMITTED": {
      return {
        ...state,
        setupInfoEntered: true
      }
    }
    case "DEPLOY_INFO_SUBMITTED": {
      return {
        ...state,
        deployInfoEntered: true
      }
    }
    case "GENERAL_OPTIONS_SELECTED": {
      return {
        ...state,
        ecsServiceSelected: true
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
    case "TO_WELCOME": {
      return {
        ...state,
        page: "welcome",
        deployInfoEntered: false,
        ecsServiceSelected: false,
      }
    }
    case "GET_INITIAL_USER_OPTIONS_SUCCESS": {
      return {
        ...state,
        ecsServices: action.payload,
      }
    }
    case "GET_ADDITIONAL_USER_OPTIONS_SUCCESS": {
      return {
        ...state,
        ecsDetails: action.payload.ecsResponse,
        meshDetails: action.payload.meshResponse,
        cwDetails: action.payload.cwResponse,
      }
    }
    default: {
      return state;
    }
  };
};

export const readGeneralOptions = clusterName => {
  return async dispatch => {
    const ecsResponse = await ecs.getECSServices(clusterName);
    dispatch({ type: "GET_INITIAL_USER_OPTIONS_SUCCESS", payload: ecsResponse });
  };
};

export const readSpecificOptions = (clusterName, originalECSServiceName, meshName) => {
  return async dispatch => {
    const ecsResponse = await ecs.getECSDetails(clusterName, originalECSServiceName);
    const meshResponse = await mesh.getMeshDetails(meshName);
    const cwResponse = await cloudwatch.getCWMetricNamespace(clusterName);
    dispatch({ type: "GET_ADDITIONAL_USER_OPTIONS_SUCCESS", payload: { ecsResponse, meshResponse, cwResponse } });
  };
};

export default logic;
