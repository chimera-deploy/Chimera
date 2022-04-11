import { useSelector } from 'react-redux';
import BaseInfoForm from "./BaseInfoForm";
import SetupInfoForm from "./SetupInfoForm";
import Deploy from "./Deploy";
import DeployProgressPanel from './DeployProgressPanel';
import Header from './Header';
import Footer from './Footer';

const App = () => {
  const { page, deployInfoEntered } = useSelector(state => state.logic);

  let mainSection = <BaseInfoForm />;

  if (deployInfoEntered) {
    mainSection = <Deploy />;
  } else if (page === 'deploy') {
    mainSection = (
      <>
        <BaseInfoForm />
        <Deploy />
      </>
    );
  } else if (page === 'setup') {
    mainSection = (
      <>
        <BaseInfoForm />
        <SetupInfoForm />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        {mainSection}
      </main>
      <Footer />
    </>
  );
};

export default App;
