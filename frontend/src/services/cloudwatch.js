import axios from "axios";

const BASEURL = "http://localhost";
const PORT = "5000";

const getCWMetricNamespace = async (clusterName, region) => {
  const response = await axios.post(`${BASEURL}:${PORT}/awsinfo/cw-metric-namespace`, { clusterName, region });
  return response.data;
};

const cloudwatch = {
  getCWMetricNamespace,
};

export default cloudwatch;
