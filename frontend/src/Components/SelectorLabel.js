const SelectorLabel = ({ message, array, condition, alternative, changeHandler }) => {
  return (
    <div className="input-line">
      <dt>{message}</dt>
      <dd>
        <select required={true} onChange={changeHandler}>
          <option value="" disabled selected>Select one</option>
          {
            condition
              ? array.map(ele => <option key={ele} value={ele}>{ele}</option>)
              : <option>{alternative}</option>
          }
        </select>
      </dd>
    </div>
  );
};

export default SelectorLabel
