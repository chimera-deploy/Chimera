import axios from "axios";

const BASEURL = "http://localhost";
const PORT1 = "5000";
const PORT2 = "5000"

const getECSServices = async (clusterName, region) => {
  const response = await axios.post(`${BASEURL}:${PORT1}/awsinfo/ecs-services`, { clusterName, region });
  return response.data;
};

const getECSDetails = async (clusterName, originalECSServiceName, region) => {
  const response = await axios.post(`${BASEURL}:${PORT2}/awsinfo/ecs-details`, { clusterName, originalECSServiceName, region });
  return response.data;
};

const ecs = {
  getECSServices,
  getECSDetails,
};

export default ecs;
