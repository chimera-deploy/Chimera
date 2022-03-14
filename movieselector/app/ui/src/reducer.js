import axios from 'axios';

const baseURL = window.MOVIE_SELECTOR_ENDPOINT.includes("localhost")
  ? `http://localhost:9080`
  : `http://${window.MOVIE_SELECTOR_ENDPOINT}/api`;

const init = {
  movie: "",
  apiVersion: "",
  movieSelectorEndpoint: baseURL,
  uiVersion: 2
};

const reducer = (state=init, action) => {
  switch (action.type) {
    case "GET_MOVIE_SUCCESS": {
      return {
         ...state,
         movie: action.payload.movie,
         apiVersion: action.payload.version
      };
    }
    default: {
      return state;
    }
  };
};

export const readMovie = () => {
  return async dispatch => {
    const response = await axios.get(baseURL);
    dispatch({ type: "GET_MOVIE_SUCCESS", payload: response.data });
  };
};

export default reducer;
