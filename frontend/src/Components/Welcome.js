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
