import axios from "axios";

const BASEURL = "http://localhost";
const PORT = "5000";

const getECSServices = async (clusterName, region) => {
  const response = await axios.post(`${BASEURL}:${PORT}/awsinfo/ecs-services`, { clusterName, region });
  return response.data;
};

const getECSDetails = async (clusterName, originalECSServiceName, region) => {
  const response = await axios.post(`${BASEURL}:${PORT}/awsinfo/ecs-details`, { clusterName, originalECSServiceName, region });
  return response.data;
};

const ecs = {
  getECSServices,
  getECSDetails,
};

export default ecs;
