import axios from "axios";

const getMeshDetails = async (meshName, region) => {
  const response = await axios.post(`/api/awsinfo/mesh-details`, { meshName, region });
  return response.data;
};

const mesh = {
  getMeshDetails,
};

export default mesh;
