const SubmitButton = ({ value }) => {
  return (
    <div className="input-line">
      <dt>
      </dt>
      <dd>
        <input className="button" type="submit" value={value} />
      </dd>
    </div>
  )
};

export default SubmitButton;
