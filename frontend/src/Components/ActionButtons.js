import React from 'react';
import { useDispatch } from 'react-redux';

const ActionButtons = () => {
  const dispatch = useDispatch();

  return (
    <div className="col-50 no-border action-button-container">
      <button onClick={() => dispatch({ type: "TO_SETUP" })}>
        Setup
      </button>
      <button onClick={() => dispatch({ type: "TO_DEPLOY" })}>
        Deploy
      </button>
    </div>
  );
};

export default ActionButtons;