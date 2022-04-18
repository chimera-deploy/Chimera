import axios from "axios";

const getCWMetricNamespace = async (clusterName, region) => {
  const response = await axios.post(`/api/awsinfo/cw-metric-namespace`, { clusterName, region });
  return response.data;
};

const cloudwatch = {
  getCWMetricNamespace,
};

export default cloudwatch;
