import { useSelector } from 'react-redux';
import Welcome from "./Welcome";
import Setup from "./Setup";
import Deploy from "./Deploy";
import Header from './Header';
import Footer from './Footer';

const App = () => {
  const { page } = useSelector(state => state.logic);

  return (
    <div>
      <Header />
      <div className="main">
        <div className="forms">
          <Welcome />
          {
            page === 'setup' ? <Setup /> : page === 'deploy' ? <Deploy /> : null
          }
        </div>
      </div>
      <Footer />
    </div>
  );

  // return (
  //   <div>
  //     <Header />
  //     <div className="main">
  //       <div className="forms">
  //         {
  //           page === "welcome"
  //             ? <Welcome />
  //             : page === "setup"
  //               ? <Setup />
  //               : <Deploy />
  //         }
  //       </div>
  //     </div>
  //     <Footer />
  //   </div>
  // );
};

export default App;
