import axios from "axios";

const BASEURL = "http://localhost";
const PORT = "5000";

const getCWMetricNamespace = async (clusterName) => {
  const response = await axios.post(`${BASEURL}:${PORT}/cw-metric-namespace`, { clusterName });
  return response.data;
};

const cloudwatch = {
  getCWMetricNamespace
};

export default cloudwatch;
