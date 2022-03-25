const SelectorLabel = ({ message, array, condition, alternative, changeHandler }) => {
  return (
    <label>
      {message}
      <select onChange={changeHandler}>
        {
          condition
            ? array.map(ele => <option key={ele} value={ele}>{ele}</option>)
            : <option>{alternative}</option>
        }
      </select>
    </label>
  );
};

export default SelectorLabel
