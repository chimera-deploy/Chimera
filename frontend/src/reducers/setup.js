const init = {
  awsAccountID: "",
  region: "",
  metricNamespace: "",
  vpcID: "",
  cwECSPrimarySubnets: [],
  clusterName: ""
};

const setup = (state = init, action) => {
  switch (action.type) {
    case "BASE_INFO_SUBMITTED": {
      const awsAccountID = action.payload[0].value;
      const region = action.payload[1].value;
      const meshName = action.payload[2].value;
      const clusterName = action.payload[3].value;
      return {
        ...state,
        awsAccountID,
        region,
        clusterName
      };
    }
    default: {
      return state;
    }
  };
};

export default setup;
