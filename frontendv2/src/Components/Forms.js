import React, { useState } from 'react';
import BaseForm from './BaseForm.js';

const Forms = () => {
  const [ baseInfoEntered, setBaseInfoEntered ] = useState(false);

  return (
    <>
    {baseInfoEntered === false ? <BaseForm /> : null}
    </>
  );
};

export default Forms;