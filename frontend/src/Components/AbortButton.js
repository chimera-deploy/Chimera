import axios from 'axios';
const abortDeployment = () => {
  if (window.confirm("Warning: A forced 'ABORT' can result in unexepected results. Are you certain you wish to force ABORT this deployment?") === true ) {
    console.log('Requesting abort:');
    const abortResponse = axios.post('http://localhost:5000/abort');
    console.log('Abort Response:', abortResponse)
  } else {
    console.log('Abort cancelled');
  }
}

const AbortButton = () => {
  return (
    <button onClick={abortDeployment}>ABORT</button>
  );
};

export default AbortButton;

