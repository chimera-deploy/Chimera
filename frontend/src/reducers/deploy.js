const init = {
  meshName: "",
  originalNodeName: "",
  newNodeName: "",
  routerName: "",
  routeName: "",
  routeUpdateInterval: "",
  shiftWeight: "",
  maxFailures: "",
  clusterName: "",
  serviceDiscoveryID: "",
  originalECSServiceName: "",
  originalTaskDefinition: "",
  newECSServiceName: "",
  newTaskDefinitionName: "",
  imageURL: "",
  containerName: "",
  envoyContainerName: "",
  awsAccountID: "",
  region: "",
  metricNamespace: "",
  awslogsStreamPrefix: "",
};

const deploy = (state = init, action) => {
  switch (action.type) {
    case "BASE_INFO_SUBMITTED": {
      const awsAccountID = action.payload[0].value;
      const region = action.payload[1].value;
      const meshName = action.payload[2].value;
      const clusterName = action.payload[3].value;
      return {
        ...state,
        meshName,
        clusterName,
        awsAccountID,
        region,
      };
    }
    case "GENERAL_OPTIONS_SELECTED": {
      const originalECSServiceName = action.payload[0].value;
      const newECSServiceName = action.payload[1].value;
      return {
        ...state,
        originalECSServiceName,
        newECSServiceName,
      }
    }
    case "GET_ADDITIONAL_USER_OPTIONS_SUCCESS": {
      return {
        ...state,
        originalTaskDefinition: action.payload.ecsResponse.originalTaskDefinition,
        metricNamespace: action.payload.cwResponse.metricNamespace,
      }
    }
    case "DEPLOY_INFO_SUBMITTED": {
      const newTaskDefinitionName = action.payload[0].value;
      const awslogsStreamPrefix = action.payload[1].value;
      const serviceDiscoveryID = action.payload[2].value;
      const envoyContainerName = action.payload[3].value;
      const containerName = action.payload[4].value;
      const imageURL = action.payload[5].value;
      const originalNodeName = action.payload[6].value;
      const newNodeName = action.payload[7].value;
      const routerName = action.payload[8].value;
      const routeName = action.payload[9].value;
      const routeUpdateInterval = action.payload[10].value;
      const shiftWeight = action.payload[11].value;
      const maxFailures = action.payload[12].value;
      return {
        ...state,
        newTaskDefinitionName,
        awslogsStreamPrefix,
        serviceDiscoveryID,
        envoyContainerName,
        containerName,
        imageURL,
        originalNodeName,
        newNodeName,
        routerName,
        routeName,
        routeUpdateInterval,
        shiftWeight,
        maxFailures,
      }
    }
    case "SETUP_INFO_SUBMITTED": {
      const metricNamespace = action.payload[0].value;
      return {
        ...state,
        metricNamespace,
      };
    }
    case "RESET_ALL_FORMS": {
      return init;
    }
    default: {
      return state;
    }
  }
};

export default deploy;
