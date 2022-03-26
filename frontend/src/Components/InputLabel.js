const InputLabel = ({ message }) => {
  return (
    <div className="input-line">
      <dt>{message}</dt>
      <dd>
        <input required="true" type="text" />
      </dd>
    </div>
  )
};

export default InputLabel;
