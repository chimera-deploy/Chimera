import axios from "axios";

const BASEURL = "http://localhost";
const PORT3 = "5000";

const getMeshDetails = async meshName => {
  const response = await axios.post(`${BASEURL}:${PORT3}/mesh-details`, { meshName });
  return response.data;
};

const mesh = {
  getMeshDetails,
};

export default mesh;
