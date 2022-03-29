import { combineReducers } from 'redux';
import setup from "./setup";
import deploy from "./deploy";
import logic from "./logic";
import image from "./image";

export default combineReducers({
  setup,
  deploy,
  logic,
  image
});
