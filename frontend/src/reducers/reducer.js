import { combineReducers } from 'redux';
import setup from "./setup";
import deploy from "./deploy";
import logic from "./logic";

export default combineReducers({
  setup,
  deploy,
  logic,
});
