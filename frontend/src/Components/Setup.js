import { useSelector, useDispatch } from "react-redux";

const SetupInfoForm = () => {
  const dispatch = useDispatch();

  return (
    <>
      <p>Please enter some additional information.</p>
      <form
        onSubmit={
          e => {
            e.preventDefault();
            dispatch({ type: "SETUP_INFO_SUBMITTED", payload: e.target })
            e.target.reset();
          }
        }
      >
        <label>
          What would you like the metric namespace associated with the CloudWatch agent to be?:
          <input type="text" name="metricNamespace" />
        </label>
        <label>
          What is the ID of your system's VPC?:
          <input type="text" name="vpcID" />
        </label>
        <label>
          Please enter at least one subnet within which the CloudWatch agent may be deployed:
          <input type="text" name="subnet1" />
          <input type="text" name="subnet2" />
          <input type="text" name="subnet3" />
          <input type="text" name="subnet4" />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </>
  );
};

// S'pose we'll dispatch a thunky action creator in this function
// it'll send a message to the backend to do its thing and track the progress
const SetupDispatchAndTrackProgress = () => {
  return (
    <div>
      <p>Sorry, cloudwatch is out to lunch!</p>
    </div>
  );
};

const Setup = () => {
  const { setupInfoEntered } = useSelector(state => state.logic);
  const dispatch = useDispatch();

  return (
    <div>
      <h2>Here you will deploy a prometheus-configured cloudwatch agent!</h2>
      <button onClick={() => dispatch({ type: "TO_WELCOME" })}>
        Take me back!
      </button>
      {
        !setupInfoEntered
          ? <SetupInfoForm />
          : <SetupDispatchAndTrackProgress />
      }
    </div>
  );
};

export default Setup;
