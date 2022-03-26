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
      <InputLabel message={"Enter a new name for the updated ECS Service"} name={"newECSServiceName"}/>
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
      <dl>
        <InputLabel message={`Enter a new task definition family name (the current one is ${ecsDetails.originalTaskDefinition})`} name={"newTaskDefinitionName"} />
        <SelectorLabel
          message={"Choose the service discovery id the new task should use"}
          array={ecsDetails.serviceRegistryIds}
          condition={true}
          alternative={""}
          changeHandler={() => undefined}
        />
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
        <InputLabel message={"Enter the URL of the new image for the app container"} name={"imageURL"} />
        <SelectorLabel
          message={"Pick the corresponding virtual node to replace:"}
          array={meshDetails.nodes}
          condition={true}
          alternative={""}
          changeHandler={() => undefined}
        />
        <InputLabel message={"Enter a name for your new virtual node"} name={"newNodeName"} />
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
        <InputLabel message={"Enter the minutes of each canary interval"} name={"routeUpdateInterval"} />
        <InputLabel message={"Enter the percentage of traffic to shift toward the canary for each interval"} name={"shiftWeight"} />
        <InputLabel message={"How many 500 responses from the canary is tolerable?"} name={"maxFailures"} />
      </dl>
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
    originalECSServiceName,
    meshName,
  } = useSelector(state => state.deploy);
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
  const { deploy } = useSelector(state => state);
  const [ events, setEvents ] = useState([]);
  const [ listening, setListening ] = useState(false);

  useEffect(() => {
    axios.post('http://localhost:5000/deploy', deploy);
  }, []);

  useEffect(() => {
    if (!listening) {
      const eventListener = new EventSource('http://localhost:5000/events');
      eventListener.onmessage = (event) => {
        console.log(event);

        const parsedEvent = JSON.parse(event.data);
        setEvents(parsedEvent);
      };

      setListening(true);
    }
  }, [listening, events]);

  return (
    <div>
      <p>Deploying!</p>
      <ul>
        {events.map(event => <li key={event}>{event}</li>)}
      </ul>
    </div>
  );
};

const Deploy = () => {
  const { deployInfoEntered, ecsServices } = useSelector(state => state.logic);
  const { clusterName } = useSelector(state => state.deploy);
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
