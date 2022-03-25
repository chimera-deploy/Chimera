import axios from "axios";

const BASEURL = "http://localhost";
const PORT3 = "3003";

const getMeshDetails = async meshName => {
  const response = await axios.get(`${BASEURL}:${PORT3}/mesh-details`, { meshName });
  return response.data;
};

const mesh = {
  getMeshDetails,
};

export default mesh;
