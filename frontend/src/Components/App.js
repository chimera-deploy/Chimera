import { useSelector } from 'react-redux';
import BaseInfoForm from "./BaseInfoForm";
import SetupInfoForm from "./SetupInfoForm";
import Deploy from "./Deploy";
import Header from './Header';
import Footer from './Footer';

const App = () => {
  const { page } = useSelector(state => state.logic);

  return (
    <>
      <Header />
      <main>
        <BaseInfoForm />
        {
          page === "setup" 
            ? <SetupInfoForm /> 
            : null
        }
      </main>
      <Footer />
    </>
  );
};

export default App;
