import { useSelector, useDispatch } from "react-redux";
import ActionButtons from "./ActionButtons";
import InputLabel from "./InputLabel";
import SubmitButton from "./SubmitButton";

const BaseInfoForm = () => {
  const dispatch = useDispatch();

  const { baseInfoEntered } = useSelector(state => state.logic);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "BASE_INFO_SUBMITTED", payload: e.target })
    e.target.reset();
  };

  return (
    <div className="row">
      <div className="col-50">
      <h1>AWS Base Infrastructure Information</h1>
        <form onSubmit={handleSubmit}>
          <dl>
            <InputLabel
              message={"AWS Account ID"}
              name={"awsAccountID"}
              required={true}
            />
            <InputLabel
              message={"AWS Region"}
              name={"region"}
              required={true}
            />
            <InputLabel
              message={"App Mesh Name"}
              name={"meshName"}
              required={true}
            />
            <InputLabel
              message={"ECS Cluster Name"}
              name={"clusterName"}
              required={true}
            />
          </dl>
          <SubmitButton value={"Submit"} />
        </form>
      </div>
      {baseInfoEntered ? <ActionButtons /> : <div className="col-50 no-border" />}
    </div>
  );
};

export default BaseInfoForm;
