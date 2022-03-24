//import axios from 'axios';

//const baseURL = "";

const init = {
  "meshName": "",
  "routeName": "",
  "routerName": "",
  "originalNodeName": "",
  "originalECSServiceName": "",
  "originalTaskDefinitionWithRevision": "",
  "newNodeName": "",
  "newECSServiceName": "",
  "newTaskDefinitionName": "",
  "clusterName": "",
  "containerName": "",
  "imageURL": '',
  "envoyContainerName": "",
  "serviceDiscoveryID": "",
  "routeUpdateInterval": "",
  "shiftWeight": "",
  "maxFailures": "",
  "region": "",
  "awsAccountID": "",
  "metricNamespace": "",
  "vpcID": "",
  "cwECSPrimarySubnets": []
};

const reducer = (state = init, action) => {
  switch (action.type) {
    default: {
      return state;
    }
  };
};

/* a thunk action creator
export doSomething = async (args) => {
  return async dispatch => {
    const response = axios.method(`${baseURL}`);
    dispatch({ type: "TYPE", payload: response.data });
  };
};
*/

export default reducer;
