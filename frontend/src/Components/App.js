import { useSelector } from 'react-redux';
import Welcome from "./Welcome";
import Setup from "./Setup";
import Deploy from "./Deploy";
import Header from './Header';
import Footer from './Footer';

const App = () => {
  const { page } = useSelector(state => state.logic);

  return (
    <div className="body">
      <Header />
      {
        page === "welcome"
          ? <Welcome />
          : page === "setup"
            ? <Setup />
            : <Deploy />
      }
      <Footer />
    </div>
  );
};

export default App;
