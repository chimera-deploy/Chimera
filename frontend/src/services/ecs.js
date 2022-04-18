import axios from "axios";

const getECSServices = async (clusterName, region) => {
  const response = await axios.post(`/api/awsinfo/ecs-services`, { clusterName, region });
  return response.data;
};

const getECSDetails = async (clusterName, originalECSServiceName, region) => {
  const response = await axios.post(`/api/awsinfo/ecs-details`, { clusterName, originalECSServiceName, region });
  return response.data;
};

const ecs = {
  getECSServices,
  getECSDetails,
};

export default ecs;
