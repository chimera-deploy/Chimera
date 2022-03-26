const InputLabel = ({ message, name }) => {
  return (
    <div className="input-line">
      <dt>
        <label for={name}>{message}</label>
      </dt>
      <dd>
        <input type="text" name={name} id={name}/>
      </dd>
    </div>
  )
};

export default InputLabel;
