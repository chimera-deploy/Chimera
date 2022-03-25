import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { readGeneralOptions, readSpecificOptions } from "../reducers/logic";
import InputLabel from "./InputLabel";
import SelectorLabel from "./SelectorLabel";

const SelectGeneralOptions = ({ ecsServices }) => {
  const dispatch = useDispatch();

  return (
    <form
      onSubmit={
        e => {
          e.preventDefault();
          dispatch({ type: "GENERAL_OPTIONS_SELECTED", payload: e.target })
          e.target.reset();
        }
      }
    >
      <SelectorLabel
        message={"Pick the ECS Service to update:"}
        array={ecsServices.ECSServiceNames}
        condition={true}
        alternative={""}
        changeHandler={() => undefined}
      />
      <InputLabel message={"Enter a new name for the updated ECS Service"} />
      <input type="submit" value="Submit" />
    </form>
  );
};

const SelectSpecificOptions = ({ ecsDetails, meshDetails }) => {
  let [ router, setRouter ] = useState("");
  const dispatch = useDispatch();

  return (
    <form
      onSubmit={
        e => {
          e.preventDefault();
          dispatch({ type: "DEPLOY_INFO_SUBMITTED", payload: e.target })
          e.target.reset();
        }
      }
    >
      <InputLabel message={`Enter a new task definition family name (the current one is ${ecsDetails.originalTaskDefinition})`} />
      <InputLabel message={"Enter the service discovery entry ID the new task should fall under"} />
      <SelectorLabel
        message={"Pick the name of the envoy container:"}
        array={ecsDetails.containerNames}
        condition={true}
        alternative={""}
        changeHandler={() => undefined}
      />
      <SelectorLabel
        message={"Pick the name of the app container:"}
        array={ecsDetails.containerNames}
        condition={true}
        alternative={""}
        changeHandler={() => undefined}
      />
      <InputLabel message={"Enter the URL of the new image for the app container"} />
      <SelectorLabel
        message={"Pick the corresponding virtual node to replace:"}
        array={meshDetails.nodes}
        condition={true}
        alternative={""}
        changeHandler={() => undefined}
      />
      <InputLabel message={"Enter a name for your new virtual node"} />
      <SelectorLabel
        message={"Pick a virtual router:"}
        array={meshDetails.routers}
        condition={true}
        alternative={""}
        changeHandler={e => setRouter(e.target.value)}
      />
      <SelectorLabel
        message={"Pick a virtual route:"}
        array={meshDetails.routes[router]}
        condition={router}
        alternative={"Select a router first"}
        changeHandler={() => undefined}
      />
      <InputLabel message={"Enter the minutes of each canary interval"} />
      <InputLabel message={"Enter the percentage of traffic to shift toward the canary for each interval"} />
      <InputLabel message={"How many 500 responses from the canary is tolerable?"} />
      <input type="submit" value="Submit" />
    </form>
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
    originalECSServiceName
  } = useSelector(state => state.deploy.containers);
  const { meshName } = useSelector(state => state.deploy.routing);
  const dispatch = useDispatch();

  useEffect(() => {
    if (ecsServiceSelected) {
      dispatch(readSpecificOptions(clusterName, originalECSServiceName, meshName));
    }
  }, [dispatch, ecsServiceSelected, clusterName, originalECSServiceName, meshName]);

  return (
    <>
      <p>Please input some additional information.</p>
      {
        !ecsServiceSelected
          ? <SelectGeneralOptions ecsServices={ecsServices} />
          : ecsDetails && meshDetails
              ? <SelectSpecificOptions ecsDetails={ecsDetails} meshDetails={meshDetails} />
              : <>Please Wait</>
      }
    </>
  );
};

// S'pose we'll dispatch a thunky action creator in this function
// it'll send a message to the backend to do its thing and track the progress
const DeployDispatchAndTrackProgress = () => {
  const state = useSelector(state => state);
  console.log(state);
  axios.post('http://localhost:5000/deploy', {...state.deploy.containers, ...state.deploy.routing });
  return (
    <div>
      <p>Deploying!</p>
    </div>
  );
};

const Deploy = () => {
  const { deployInfoEntered, ecsServices } = useSelector(state => state.logic);
  const { clusterName } = useSelector(state => state.deploy.containers);
  console.log(clusterName);
  const dispatch = useDispatch();
  useEffect(() => dispatch(readGeneralOptions(clusterName)), [dispatch, clusterName]);

  return (
    <div>
      <h2>Here you will deploy a canary! Good luck little guy!</h2>
      <button onClick={() => dispatch({ type: "TO_WELCOME" })}>
        Take me back!
      </button>
      {
        !deployInfoEntered
          ? ecsServices
              ? <DeployInfo ecsServices={ecsServices} />
              : <>Please wait</>
          : <DeployDispatchAndTrackProgress />
      }
    </div>
  );
};

export default Deploy;
