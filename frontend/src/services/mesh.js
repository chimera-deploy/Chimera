import axios from "axios";

const BASEURL = "http://localhost";
const PORT3 = "5000";

const getMeshDetails = async (meshName, region) => {
  const response = await axios.post(`${BASEURL}:${PORT3}/awsinfo/mesh-details`, { meshName, region });
  return response.data;
};

const mesh = {
  getMeshDetails,
};

export default mesh;
