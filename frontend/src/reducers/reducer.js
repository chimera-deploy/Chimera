import { combineReducers } from 'redux';
import setup from "./setup";
import deploy from "./deploy";
import logic from "./logic";
import events from "./events";

export default combineReducers({
  setup,
  deploy,
  logic,
  events,
});
