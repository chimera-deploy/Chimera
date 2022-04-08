import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import InputLabel from "./InputLabel";
import SubmitButton from "./SubmitButton";

const SetupInfoForm = () => {
  const dispatch = useDispatch();
  const { setupInfoEntered } = useSelector(state => state.logic);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "SETUP_INFO_SUBMITTED", payload: e.target })
    e.target.reset();
  }

  return (
    <div className="row">
      <div className="col-50">
        <h1>Prepare ECS Cluster</h1>
        <form onSubmit={handleSubmit}>
          <dl>
            <InputLabel
              message={"New Metric Namespace"}
              name={"metricNamespace"}
              required={true}
            />
            <InputLabel
              message={"VPC ID"}
              name={"vpcID"}
              required={true}
            />
            <div className="input-line">
              <dt>VPC Subnet IDs</dt>
              <div className="subnet-inputs">
                <dd><input type="text" name="subnet1" required={true} /></dd>
                <dd><input type="text" name="subnet2" required={false} /></dd>
                <dd><input type="text" name="subnet3" required={false} /></dd>
                <dd><input type="text" name="subnet4" required={false} /></dd>
              </div>
            </div>
            <SubmitButton value={"Prepare Cluster"} />
          </dl>
        </form>
      </div>
      <div className="col-50 no-border">
        { setupInfoEntered ? <SetupDispatchAndTrackProgress /> : null}
      </div>
    </div>
  );
};

const SetupDispatchAndTrackProgress = () => {
  const { setup } = useSelector(state => state);
  axios.post('http://localhost:5000/setup', setup)
  return (
    <div>
      <p>Setting up cloudwatch agent!</p>
    </div>
  );
};

export default SetupInfoForm;
