import { useSelector, useDispatch } from "react-redux";
import InputLabel from "./InputLabel";
import SubmitButton from "./SubmitButton";

const BaseInfoForm = () => {
  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "BASE_INFO_SUBMITTED", payload: e.target })
    e.target.reset();
  }

  return (
    <>
      <h1>AWS Base Infrastructure Information</h1>
      <div className="form-box">
        <p>Please enter some information about your current AWS infrastructure.</p>
        <form onSubmit={handleSubmit}>
          <dl>
            <InputLabel
              message={"AWS Account ID:"}
              name={"awsAccountID"}
              required={true}
            />
            <InputLabel
              message={"AWS Region:"}
              name={"region"}
              required={true}
            />
            <InputLabel
              message={"App Mesh Name:"}
              name={"meshName"}
              required={true}
            />
            <InputLabel
              message={"ECS Cluster Name:"}
              name={"clusterName"}
              required={true}
            />
          </dl>
          <SubmitButton value={"Submit"} />
        </form>
      </div>
    </>
  );
};

const Buttons = () => {
  const dispatch = useDispatch();

  return (
    <div>
      <button onClick={() => dispatch({ type: "TO_SETUP" })}>
        Setup Prometheus-Configured CloudWatch Agent
      </button>
      <button onClick={() => dispatch({ type: "TO_DEPLOY" })}>
        I'm Feeling Lucky!
      </button>
    </div>
  );
};

const Welcome = () => {
  const { baseInfoEntered } = useSelector(state => state.logic);

  return (
    <div>
      {
        !baseInfoEntered
          ? <BaseInfoForm />
          : <Buttons />
      }
    </div>
  );
};

export default Welcome;
