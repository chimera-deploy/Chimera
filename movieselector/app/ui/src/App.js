import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { readMovie } from './reducer';

const App = () => {
  const state = useSelector(state => state);
  const dispatch = useDispatch();
  useEffect(() => dispatch(readMovie()), [dispatch]);

  return (
    <div>
      <h2>Get a Movie!</h2>
      <p>Movie: {state.movie}</p>
      <p>Brought to you by: {state.movieSelectorEndpoint} v{state.apiVersion}</p>
      <p>UIVersion: {state.uiVersion}</p>
    </div>
  );
};

export default App;
