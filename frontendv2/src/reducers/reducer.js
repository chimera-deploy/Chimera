import { combineReducers } from 'redux';
import base from './base';
import setup from "./setup";
import deploy from "./deploy";
import logic from "./logic";

export default combineReducers({
  base,
  setup,
  deploy,
  logic,
});