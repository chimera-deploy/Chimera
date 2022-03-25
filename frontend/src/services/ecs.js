import axios from "axios";

const BASEURL = "http://localhost";
const PORT1 = "5000";
const PORT2 = "5000"

const getECSServices = async clusterName => {
  const response = await axios.post(`${BASEURL}:${PORT1}/ecs-services`, { clusterName });
  return response.data;
};

const getECSDetails = async (clusterName, originalECSServiceName) => {
  const response = await axios.post(`${BASEURL}:${PORT2}/ecs-details`, { clusterName, originalECSServiceName });
  return response.data;
};

const ecs = {
  getECSServices,
  getECSDetails,
};

export default ecs;