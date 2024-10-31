import React, { useEffect, useState } from 'react';
import { buildAuthUrl } from '../utils/geminiApi';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

const geminiOAuthConnect = () => {
  try {
    window.location.href = buildAuthUrl();
  } catch (error) {
    setError(error.message);
  }
};

  // const geminiCredConnect = () => {
  //   navigate('/gemini-cred-connect');
  // };
  console.log(buildAuthUrl())
  
  return (
    <div>
      <h1>Gemini OAuth Example</h1>
      <button onClick={geminiOAuthConnect}>Connect to Gemini using OAuth</button>
      {/* <button onClick={geminiCredConnect}>Connect to Gemini using Credentials (WE DO NOT STORE THEM)</button> */}
    </div>
  );
}

export default Home;

