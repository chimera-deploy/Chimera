import { useSelector, useDispatch } from "react-redux";
import InputLabel from "./InputLabel";

const BaseInfoForm = () => {
  const dispatch = useDispatch();

  return (
    <>
      <p>Please enter some information about your current AWS infrastructure.</p>
      <form
        onSubmit={
          e => {
            e.preventDefault();
            dispatch({ type: "BASE_INFO_SUBMITTED", payload: e.target })
            e.target.reset();
          }
        }
      >
        <dl>
          <InputLabel message={"AWS Account ID:"} name={"awsAccountID"} />
          <InputLabel message={"AWS Region:"} name={"region"} />
          <InputLabel message={"App Mesh Name:"} name={"meshName"} />
          <InputLabel message={"ECS Cluster Name:"} name={"clusterName"} />
        </dl>
        <input type="submit" value="Submit" />
      </form>
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
