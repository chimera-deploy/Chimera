import { useSelector } from 'react-redux';
import Welcome from "./Welcome";
import Setup from "./Setup";
import Deploy from "./Deploy";

const App = () => {
  const { page } = useSelector(state => state.logic);

  return (
    <div>
      {
        page === "welcome"
          ? <Welcome />
          : page === "setup"
            ? <Setup />
            : <Deploy />
      }
    </div>
  );
};

export default App;
