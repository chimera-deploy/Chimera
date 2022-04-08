import { useSelector } from 'react-redux';
import BaseInfoForm from "./BaseInfoForm";
import Setup from "./Setup";
import Deploy from "./Deploy";
import Header from './Header';
import Footer from './Footer';

const App = () => {
  const { page } = useSelector(state => state.logic);

  return (
    <>
      <Header />
      <div className="main">
        <div className="forms">
          {
            page === "welcome"
              ? <BaseInfoForm />
              : page === "setup"
                ? <Setup />
                : <Deploy />
          }
        </div>
      </div>
      <Footer />
    </>
  );
};

export default App;
