import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { readGeneralOptions, readSpecificOptions } from "../reducers/logic";

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
      <label>
        Pick the ECS Service you would like to update:
        <select>
          {
            ecsServices.ECSServiceNames
              .map(ecsService =>
                <option key={ecsService} value={ecsService}>{ecsService}</option>
              )
          }
        </select>
      </label>
      <label>
        Enter a new name for the updated ECS Service:
        <input type="text" name="newECSServiceName" />
      </label>
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
      <label>
        Enter a new task definition family name (the current one is {ecsDetails.originalTaskDefinition}):
        <input type="text" name="newTaskDefinitionFamily" />
      </label>
      <label>
        Enter the service discovery entry ID your new task should fall under:
        <input type="text" name="serviceDiscoveryID" />
      </label>
      <label>
        Pick the name of the envoy container:
        <select>
          {
            ecsDetails.containerNames
              .map(containerName =>
                <option key={containerName} value={containerName}>{containerName}</option>
              )
          }
        </select>
      </label>
      <label>
        Pick the name of the app container:
        <select>
          {
            ecsDetails.containerNames
              .map(containerName =>
                <option key={containerName} value={containerName}>{containerName}</option>
              )
          }
        </select>
      </label>
      <label>
        Enter the URL of the new image for the app container:
        <input type="text" name="newAppImageURL" />
      </label>
      <label>
        Pick the corresponding virtual node to replace:
        <select>
          {
            meshDetails.nodes
              .map(node =>
                <option key={node} value={node}>{node}</option>
              )
          }
        </select>
      </label>
      <label>
        Enter a new name for your new virtual node:
        <input type="text" name="newNodeName" />
      </label>
      <label>
        Pick a virtual router:
        <select onChange={e => setRouter(e.target.value)}>
          {
            meshDetails.routers
              .map(router =>
                <option key={router} value={router}>{router}</option>
              )
          }
        </select>
      </label>
      <label>
        Pick a virtual route:
        <select>
          {
            router
              ? meshDetails.routes[router]
                .map(route =>
                  <option key={route} value={route}>{route}</option>
                )
              : <option>Select a router first</option>
          }
        </select>
      </label>
      <label>
        Enter the number of minutes for each canary interval
        <input type="text" />
      </label>
      <label>
        Enter the percentage of traffic to shift toward the canary for each interval
        <input type="text" />
      </label>
      <label>
        How many 500 responses from the canary is tolerable?
        <input type="text" />
      </label>
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
  return (
    <div>
      <p>Sorry, chimere is out to lunch!</p>
    </div>
  );
};

const Deploy = () => {
  const { deployInfoEntered, ecsServices } = useSelector(state => state.logic);
  const { clusterName } = useSelector(state => state.deploy.containers);
  const dispatch = useDispatch();
  useEffect(() => dispatch(readGeneralOptions(clusterName)), [dispatch, clusterName]);

  return (
    <div>
      <h2>Here you will deploy a canary! Good luck little guy!</h2>
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
