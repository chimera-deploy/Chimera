import { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ActionButtons from "./ActionButtons";
import InputLabel from "./InputLabel";
import SubmitButton from "./SubmitButton";

const BaseInfoForm = () => {
  const dispatch = useDispatch();
  const baseInfoForm = useRef(null);

  const {
    meshName,
    awsAccountID,
    region,
    clusterName,
  }= useSelector(state => state.deploy);
  const { baseInfoEntered } = useSelector(state => state.logic);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "BASE_INFO_SUBMITTED", payload: e.target })
  };

  return (
    <div className="row">
      <div className="col-50">
      <h1>AWS Base Infrastructure Information</h1>
        <form onSubmit={handleSubmit} ref={baseInfoForm}>
          <dl>
            <InputLabel
              message={"AWS Account ID"}
              name={"awsAccountID"}
              required={true}
              value={awsAccountID}
            />
            <InputLabel
              message={"AWS Region"}
              name={"region"}
              required={true}
              value={region}
            />
            <InputLabel
              message={"App Mesh Name"}
              name={"meshName"}
              required={true}
              value={meshName}
            />
            <InputLabel
              message={"ECS Cluster Name"}
              name={"clusterName"}
              required={true}
              value={clusterName}
            />
          </dl>
          <SubmitButton value={"Submit"} />
        </form>
      </div>
      <div className="col-50 action-button-container no-border">
        {
          baseInfoEntered ?
            <>
              <button onClick={() => dispatch({ type: "TO_SETUP" })}>
                Setup
              </button>
              <button onClick={() => dispatch({ type: "TO_DEPLOY" })}>
                Deploy
              </button>
              <button onClick={() => {
                dispatch({ type: "RESET_ALL_FORMS" });
                baseInfoForm.current.reset();
              }}>
                Reset
              </button>
            </>
          : null
        }
      </div>
    </div>
  );
};

export default BaseInfoForm;
