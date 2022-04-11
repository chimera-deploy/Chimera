import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { readGeneralOptions, readSpecificOptions } from "../reducers/logic";
import DeployProgressPanel from "./DeployProgressPanel";
import InputLabel from "./InputLabel";
import SelectorLabel from "./SelectorLabel";
import SubmitButton from "./SubmitButton";

const SelectGeneralOptions = ({ ecsServices }) => {
  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "GENERAL_OPTIONS_SELECTED", payload: e.target })
    e.target.reset();
  }

  return (
    <div className="row">
      <div className="col-50">
        <h1>Service Selection</h1>
        <div className="form-box">
          <form onSubmit={handleSubmit}>
            <dl>
              <SelectorLabel
                message={"ECS Service to update:"}
                array={ecsServices.ECSServiceNames}
                condition={true}
                alternative={""}
                changeHandler={() => undefined}
              />
              <InputLabel
                message={"New ECS Service Name"}
                name={"newECSServiceName"}
                required={true}
              />
              <SubmitButton value={"Submit"} />
            </dl>
          </form>
        </div>
      </div>
      <div className="col-50 no-border"></div>
    </div>
  );
};

const SelectSpecificOptions = ({ ecsDetails, meshDetails }) => {
  let [ router, setRouter ] = useState("");
  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "DEPLOY_INFO_SUBMITTED", payload: e.target })
    e.target.reset();
  }

  return (
    <div className="row">
      <div className="col-100">
        <h1>Configure New Service</h1>
        <form onSubmit={handleSubmit}>
          <div className="deploy-config-container">
            <dl>
              <InputLabel
                message={'New Task Definition Name'}
                name={"newTaskDefinitionName"}
                required={true}
              />
              <InputLabel
                message={'AWS Log Stream Prefix (optional)'}
                name={"awslogsStreamPrefix"}
                required={false}
              />
              <SelectorLabel
                message={"Service Discovery ID"}
                array={ecsDetails.serviceRegistryIds}
                condition={true}
                alternative={""}
                changeHandler={() => undefined}
              />
              <SelectorLabel
                message={"Envoy Container Name"}
                array={ecsDetails.containerNames}
                condition={true}
                alternative={""}
                changeHandler={() => undefined}
              />
              <SelectorLabel
                message={"App Container Name"}
                array={ecsDetails.containerNames}
                condition={true}
                alternative={""}
                changeHandler={() => undefined}
              />
              <InputLabel
                message={"New Container Image URI"}
                name={"imageURL"}
                required={true}
              />
              <SelectorLabel
                message={"Virtual Node to Replace"}
                array={meshDetails.nodes}
                condition={true}
                alternative={""}
                changeHandler={() => undefined}
              />
              <InputLabel
                message={"New Virtual Node Name"}
                name={"newNodeName"}
                required={true}
              />
              <SelectorLabel
                message={"Select Virtual Router"}
                array={meshDetails.routers}
                condition={true}
                alternative={""}
                changeHandler={e => setRouter(e.target.value)}
              />
              <SelectorLabel
                message={"Select Route to Update"}
                array={meshDetails.routes[router]}
                condition={router}
                alternative={"Select a router first"}
                changeHandler={() => undefined}
              />
            </dl>
          </div>
          <h2>Deployment Options</h2>
          <dl>
            <InputLabel
              message={"Canary Interval Duration (in minutes)"}
              name={"routeUpdateInterval"}
              required={true}
            />
            <InputLabel
              message={"Shift % per Interval"}
              name={"shiftWeight"}
              required={true}
            />
            <InputLabel
              message={"Maximum Error per Minute Threshold"}
              name={"maxFailures"}
              required={true}
            />
            <SubmitButton value={"Begin Deployment"} />
          </dl>
        </form>
      </div>
    </div>
  );
};

const DeployInfo = ({ ecsServices }) => {
  const {
    ecsServiceSelected,
    ecsDetails,
    meshDetails
  } = useSelector(state => state.logic);

  const {
    clusterName,
    originalECSServiceName,
    meshName,
    region
  } = useSelector(state => state.deploy);

  const dispatch = useDispatch();

  useEffect(() => {
    if (ecsServiceSelected) {
      dispatch(readSpecificOptions(clusterName, originalECSServiceName, meshName, region));
    }
  }, [dispatch, ecsServiceSelected, clusterName, originalECSServiceName, meshName, region]);

  return (
    <>
      {
        !ecsServiceSelected
          ? <SelectGeneralOptions ecsServices={ecsServices} />
          : ecsDetails && meshDetails
              ? <SelectSpecificOptions ecsDetails={ecsDetails} meshDetails={meshDetails} />
              : <div className="row">
                  <div className="col-100">
                    <img src="../../loading-circle.gif" width="200" style={{margin: "0 auto"}} alt="loading"></img>
                  </div>
                </div>
      }
    </>
  );
};

const DeployDispatchAndTrackProgress = () => {
  const { deploy } = useSelector(state => state);
  useEffect(() => {
    axios.post('http://localhost:5000/deploy', deploy);
  }, [deploy]);

  return (
    <DeployProgressPanel />
  );
};

const Deploy = () => {
  const { deployInfoEntered, ecsServices } = useSelector(state => state.logic);
  const { clusterName, region } = useSelector(state => state.deploy);
  const dispatch = useDispatch();
  useEffect(() => dispatch(readGeneralOptions(clusterName, region)), [dispatch, clusterName, region]);

  return (
    <>
      {
        !deployInfoEntered
          ? ecsServices
              ? <DeployInfo ecsServices={ecsServices} />
              : <div className="row">
                  <div className="col-50">
                    <img src="../../loading-circle.gif" width="200" alt="loading" style={{margin: "0 auto"}}></img>
                  </div>
                  <div className="col-50 no-border"></div>
                </div>
          : <DeployDispatchAndTrackProgress />
      }
    </>
  );
};

export default Deploy;
