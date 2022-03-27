import axios from "axios";
import { CloudWatchClient, GetMetricWidgetImageCommand } from "@aws-sdk/client-cloudwatch"; // ES Modules import

const BASEURL = "http://localhost";
const PORT = "5000";

const getMetricWidget = async (input, config) => {
  config.credentials = {
    accessKeyId: '',
    secretAccessKey: ''
  };
  const client = new CloudWatchClient(config);
  const command = new GetMetricWidgetImageCommand(input);
  const response = await client.send(command);
  return btoa(String.fromCharCode(...new Uint8Array(response.MetricWidgetImage)));
};

const getCWMetricNamespace = async clusterName => {
  const response = await axios.post(`${BASEURL}:${PORT}/cw-metric-namespace`, { clusterName });
  return response.data;
};

const cloudwatch = {
  getCWMetricNamespace,
  getMetricWidget,
};

export default cloudwatch;
