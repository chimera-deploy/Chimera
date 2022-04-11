import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import AbortButton from './AbortButton';

const EventLine = ({ event, isCurrentStage }) => {
  return (
    <div className="status-update-line">
      <p>{event.message}</p>
      {isCurrentStage ? <img id="loading-gif" src="../../loading.gif" alt="loading gif" /> : null}
    </div>
  );
};

const DeployProgressPanel = () => {
  const dispatch = useDispatch();
  const [ listening, setListening ] = useState(false);
  const [ canaryWeight, setCanaryWeight ] = useState(.75);
  const [ stableWeight, setStableWeight] = useState(.25);
  const { events, metrics } = useSelector(state => state.events);
  const { originalECSServiceName, newECSServiceName} = useSelector(state => state.deploy);
  console.log(metrics);

  useEffect(() => {
    if (!listening) {
      const eventListener = new EventSource('http://localhost:5000/events');

      eventListener.onmessage = (event) => {
        console.log(event);
        const data = JSON.parse(event.data);
        const events = data.events

        if (data.metricsWidget !== "") {
          dispatch({ type: 'METRICS_RECEIVED', payload: data.metricsWidget });
        } else {
          dispatch({ type: 'EVENT_RECEIVED', payload: data.events});
        }
        if (events[events.length - 1] === 'closing connection') {
          eventListener.close();
        }
      }
      
      // let eventCount = 0;
      // const tick = () => {
      //   if (eventCount < 10) {
      //     console.log(events);
      //     dispatch({ type: 'EVENT_RECEIVED', payload: events.concat({ message: `this is event ${eventCount}` }) });
      //     eventCount++;
      //     setTimeout(tick, 5000);
      //   }
      // }
      // setTimeout(tick, 5000);
      setListening(true);
    }
  }, [listening, dispatch, events]);


  return (
    <>
      <div className="row">
        <div className="col-50 no-border service-container">
          <div className="service-box original-service" style={{backgroundColor: `rgba(100, 149, 237, ${stableWeight})`}}>
            <p><strong>Stable</strong></p>
            <p><em>{originalECSServiceName}</em></p>
            <p className="traffic-weight-text">{`${stableWeight*100}%`}</p>
          </div>
          <div className="service-box canary-service" style={{backgroundColor: `rgba(34, 139, 34, ${canaryWeight})`}}>
            <p><strong>Canary</strong></p>
            <p><em>{newECSServiceName}</em></p>
            <p className="traffic-weight-text">{`${canaryWeight*100}%`}</p>
          </div>
        </div>
        <div className="col-50 no-border action-button-container">
            {
              events.length !== 0
                ? <EventLine event={events[events.length - 1]} isCurrentStage={events[events.length - 1].message !== 'closing connection'} />
                : null
            }
          <AbortButton />
        </div>
      </div>
      {
        metrics !== ''
        ? <div className="row">
            <div className="col-100">
              <img width="1200" height="600" src={`data:image/png;base64,${metrics}`} alt='widget' />
            </div>
          </div>
          
        : null
      }
    </>
  );
};

export default DeployProgressPanel;