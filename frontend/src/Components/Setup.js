import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import InputLabel from "./InputLabel";
import SubmitButton from "./SubmitButton";

const SetupInfoForm = () => {
  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "SETUP_INFO_SUBMITTED", payload: e.target })
    e.target.reset();
  }

  return (
    <>
      <h1>Setup Prometheus-configured CloudWatch Agent</h1>
      <div className="form-box">
        <p>Please enter some additional information.</p>
        <form onSubmit={handleSubmit} >
          <dl>
            <InputLabel message={"Enter some text for the metric namespace associated with the CloudWatch agent"} name={"metricNamespace"} />
            <InputLabel message={"Enter the ID of VPC"} name={"vpcID"} />
            <div className="input-line">
              <dt>Enter at least one subnet within which the CloudWatch agent may be deployed:</dt>
              <div className="subnet-inputs">
                <dd><input type="text" name="subnet1" /></dd>
                <dd><input type="text" name="subnet2" /></dd>
                <dd><input type="text" name="subnet3" /></dd>
                <dd><input type="text" name="subnet4" /></dd>
              </div>
            </div>
            <SubmitButton value={"Submit"} />
          </dl>

        </form>
      </div>
    </>
  );
};

// S'pose we'll dispatch a thunky action creator in this function
// it'll send a message to the backend to do its thing and track the progress
const SetupDispatchAndTrackProgress = () => {
  const { setup } = useSelector(state => state);
  axios.post('http://localhost:5000/setup', setup)
  return (
    <div>
      <p>Setting up cloudwatch agent!</p>
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
