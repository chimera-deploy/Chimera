import { useSelector, useDispatch } from "react-redux";
import InputLabel from "./InputLabel";
import SubmitButton from "./SubmitButton";

const BaseInfoForm = () => {
  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "BASE_INFO_SUBMITTED", payload: e.target })
  }

  return (
    <div className="form-box half-width">
      <h1>AWS Base Infrastructure Information</h1>
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
  );
};

const Buttons = () => {
  const dispatch = useDispatch();

  return (
    <>
      <button onClick={() => dispatch({ type: "TO_SETUP" })}>Setup</button>
      <button onClick={() => dispatch({ type: "TO_DEPLOY" })}>Deploy</button>
    </>
  );
};

const Welcome = () => {
  const { baseInfoEntered } = useSelector(state => state.logic);

  return (
    <div className="main-row">
      <BaseInfoForm />
      <div className="mainButtonContainer form-box no-border half-width">
        {
          baseInfoEntered
            ? <Buttons />
            : null
        }
      </div>
    </div>
  );
};

export default Welcome;
