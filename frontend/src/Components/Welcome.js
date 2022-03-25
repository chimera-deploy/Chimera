import { useSelector, useDispatch } from "react-redux";

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
        <label>
          AWS Account ID:
          <input type="text" name="awsAccountID" />
        </label>
        <label>
          AWS Region:
          <input type="text" name="region" />
        </label>
        <label>
          App Mesh Name:
          <input type="text" name="meshName" />
        </label>
        <label>
          ECS Cluster Name:
          <input type="text" name="clusterName" />
        </label>
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
      <h2>Welcome to Chimera!</h2>
      {
        !baseInfoEntered
          ? <BaseInfoForm />
          : <Buttons />
      }
    </div>
  );
};

export default Welcome;
