//import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
//import { doSomething } from './reducer';

const App = () => {
  const state = useSelector(state => state);
  //const dispatch = useDispatch();
  //useEffect(() => dispatch(), [dispatch]);

  return (
    <div>
      <h2>Chimere!</h2>
      <p>Hello, world!</p>
      <form>
        {
          Object
            .keys(state)
            .map(key => {
              return (
                <>
                  <label>
                    {key}:
                    <input type="text" name={key} />
                  </label>

                </>
              );
            })
        }
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default App;
