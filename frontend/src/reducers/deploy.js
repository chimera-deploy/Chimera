const init = {
  routing: {
    meshName: "",
    originalNodeName: "",
    newNodeName: "",
    routerName: "",
    routeName: "",
    routeUpdateInterval: "",
    shiftWeight: "",
    maxFailures: ""
  },
  containers: {
    clusterName: "",
    serviceDiscoveryID: "",
    originalECSServiceName: "",
    originalTaskDefinition: "",
    newECSServiceName: "",
    newTaskDefinitionName: "",
    imageURL: "",
    containerName: "",
    envoyContainerName: "",
  }
};

const deploy = (state = init, action) => {
  switch (action.type) {
    case "BASE_INFO_SUBMITTED": {
      const meshName = action.payload[2].value;
      const clusterName = action.payload[3].value;
      return {
        ...state,
        routing: {
          ...state.routing,
          meshName
        },
        containers: {
          ...state.containers,
          clusterName
        }
      };
    }
    case "GENERAL_OPTIONS_SELECTED": {
      const originalECSServiceName = action.payload[0].value;
      const newECSServiceName = action.payload[1].value;
      return {
        ...state,
        containers: {
          ...state.containers,
          originalECSServiceName,
          newECSServiceName,
        }
      }
    }
    case "GET_ADDITIONAL_USER_OPTIONS_SUCCESS": {
      return {
        ...state,
        containers: {
          ...state.containers,
          originalTaskDefinition: action.payload.ecsResponse.originalTaskDefinition
        }
      }
    }
    case "DEPLOY_INFO_SUBMITTED": {
      const newTaskDefinitionName = action.payload[0].value;
      const serviceDiscoveryID = action.payload[1].value;
      const envoyContainerName = action.payload[2].value;
      const containerName = action.payload[3].value;
      const imageURL = action.payload[4].value;
      const originalNodeName = action.payload[5].value;
      const newNodeName = action.payload[6].value;
      const routerName = action.payload[7].value;
      const routeName = action.payload[8].value;
      const routeUpdateInterval = action.payload[9].value;
      const shiftWeight = action.payload[10].value;
      const maxFailures = action.payload[11].value;
      return {
        ...state,
        containers: {
          ...state.containers,
          newTaskDefinitionName,
          serviceDiscoveryID,
          envoyContainerName,
          containerName,
          imageURL,
        },
        routing: {
          ...state.routing,
          originalNodeName,
          newNodeName,
          routerName,
          routeName,
          routeUpdateInterval,
          shiftWeight,
          maxFailures,
        }
      }
    }
    default: {
      return state;
    }
  }
};

export default deploy;
