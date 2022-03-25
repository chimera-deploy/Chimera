const init = {
  routing: {
    meshName: "",
    routerName: "",
    routeName: "",
    originalNodeName: "",
    newNodeName: "",
    routeUpdateInterval: "",
    shiftWeight: "",
    maxFailures: ""
  },
  containers: {
    clusterName: "",
    serviceDiscoveryID: "",
    originalECSServiceName: "",
    originalTaskDefinitionFamilyWithRevision: "",
    newECSServiceName: "",
    newTaskDefinitionFamily: "",
    appImageURL: "",
    appContainerName: "",
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
    default: {
      return state;
    }
  }
};

export default deploy;
