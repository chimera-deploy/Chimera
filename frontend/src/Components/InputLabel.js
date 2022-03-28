const InputLabel = ({ message, name, required }) => {
  return (
    <div className="input-line">
      <dt>
        <label for={name}>{message}</label>
      </dt>
      <dd>
        <input required={required} type="text" name={name} id={name}/>
      </dd>
    </div>
  )
};

export default InputLabel;
