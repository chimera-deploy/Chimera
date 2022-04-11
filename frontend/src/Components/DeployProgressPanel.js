import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import AbortButton from './AbortButton';

const EventLine = ({ event, isCurrentStage }) => {
  return (
    <div className="status-update-line">
      <p>{event}</p>
      {isCurrentStage ? <img id="loading-gif" src="../../loading.gif" alt="loading gif" /> : null}
    </div>
  );
};

const DeployProgressPanel = () => {
  const dispatch = useDispatch();
  const [ listening, setListening ] = useState(false);
  const [ weights, setWeights ] = useState({stable: 100, canary: 0});
  const [ events, setEvents ] = useState([]);
  const [ metricsWidget, setMetricsWidget ] = useState('');
  const { originalECSServiceName, newECSServiceName} = useSelector(state => state.deploy);

  useEffect(() => {
    if (!listening) {
      const eventListener = new EventSource('http://localhost:5000/events');

      eventListener.onmessage = (event) => {
        console.log(event);
        const data = JSON.parse(event.data);
        const events = data.events;

        if (data.events) {
          if (events[events.length - 1] === 'closing connection') {
            eventListener.close();
          } else {
            setEvents(data.events);
          }
        }
        if (data.metricsWidget) {
          setMetricsWidget(data.metricsWidget);
        }
        if (data.weights) {
          setWeights(data.weights);
        }
      }
      
      setListening(true);
    }
  }, [listening, dispatch, events]);


  return (
    <>
      <div className="row">
        <div className="col-50 no-border service-container">
          <div className="service-box original-service" style={{backgroundColor: `rgba(100, 149, 237, ${weights.stable/100})`}}>
            <p><strong>Stable</strong></p>
            <p><em>{originalECSServiceName}</em></p>
            <p className="traffic-weight-text">{`${weights.stable}%`}</p>
          </div>
          <div className="service-box canary-service" style={{backgroundColor: `rgba(34, 139, 34, ${weights.canary/100})`}}>
            <p><strong>Canary</strong></p>
            <p><em>{newECSServiceName}</em></p>
            <p className="traffic-weight-text">{`${weights.canary}%`}</p>
          </div>
        </div>
        <div className="col-50 no-border action-button-container">
            {
              events.length !== 0
                ? <EventLine event={events[events.length - 1]} isCurrentStage={events[events.length - 1] !== 'closing connection'} />
                : <img src="../../loading-circle.gif" width="200" alt="loading" style={{margin: "0 auto"}}></img>
            }
          <AbortButton />
        </div>
      </div>
      {
        <div className="row">
          <div className="col-100">
            {
              metricsWidget !== ''
                ? <img width="100%" src={`data:image/png;base64,${metricsWidget}`} alt='widget' />
                : <p>Waiting for metrics...</p>
            }
          </div>
        </div>
      }
    </>
  );
};

export default DeployProgressPanel;