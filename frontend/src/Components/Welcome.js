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
        <InputLabel message={"AWS Account ID:"} />
        <InputLabel message={"AWS Region:"} />
        <InputLabel message={"App Mesh Name:"} />
        <InputLabel message={"ECS Cluster Name:"} />
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
      <h1>Welcome to Chimera!</h1>
      {
        !baseInfoEntered
          ? <BaseInfoForm />
          : <Buttons />
      }
    </div>
  );
};

export default Welcome;
