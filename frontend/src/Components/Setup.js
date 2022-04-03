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
      <div className="form-box half-width">
        <h1>Prepare Cluster for Chimera</h1>
        <form onSubmit={handleSubmit}>
          <dl>
            <InputLabel
              message={"New metric namespace name:"}
              name={"metricNamespace"}
              required={true}
            />
            <InputLabel
              message={"VPC ID:"}
              name={"vpcID"}
              required={true}
            />
            <div className="input-line">
              <dt>Enter subnet(s) for the CloudWatch agent:</dt>
              <div className="subnet-inputs">
                <dd><input type="text" name="subnet1" required={true} /></dd>
                <dd><input type="text" name="subnet2" required={false} /></dd>
                <dd><input type="text" name="subnet3" required={false} /></dd>
                <dd><input type="text" name="subnet4" required={false} /></dd>
              </div>
            </div>
            <SubmitButton value={"Submit"} />
          </dl>
        </form>
      </div>
    </>
  );
};

const SetupDispatchAndTrackProgress = () => {
  const { setup } = useSelector(state => state);
  axios.post('http://localhost:5000/setup', setup)
  return (
    <div className="form-box">
      <h1 className="no-border">CloudWatch Agent configured. Ready for deployment.</h1>
    </div>
  );
};

const Setup = () => {
  const { setupInfoEntered } = useSelector(state => state.logic);
  const dispatch = useDispatch();

  return (
    <div className="main-row">
      {
        !setupInfoEntered
          ? <SetupInfoForm />
          : <SetupDispatchAndTrackProgress />
      }
    </div>
  );
};

export default Setup;
