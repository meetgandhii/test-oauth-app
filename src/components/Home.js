
import React from 'react';
import { buildAuthUrl } from '../utils/geminiApi';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const geminiOAuthConnect = () => {
    window.location.href = buildAuthUrl();
  };

  // const geminiCredConnect = () => {
  //   navigate('/gemini-cred-connect');
  // };
  console.log(buildAuthUrl())
  console.log('https://exchange.gemini.com/auth?response_type=code&client_id=66f2ded5-e3ca-411f-8c23-e5f402e19101&redirect_uri=https%3A%2F%2Fgemini-oauth-connect.onrender.com%2Fcallback&scope=history%3Aread%2Corders%3Acreate%2Caccount%3Aread%2Cbanks%3Acreate%2Caddresses%3Acreate%2Cpayments%3Asend%2Cpayments%3Aread%2Cpayments%3Acreate%2Ccrypto%3Asend%2Cbalances%3Aread%2Cclearing%3Aread%2Corders%3Aread%2Cclearing%3Acreate&state=state' == buildAuthUrl())

  return (
    <div>
      <h1>Gemini OAuth Example</h1>
      <button onClick={geminiOAuthConnect}>Connect to Gemini using OAuth</button>
      {/* <button onClick={geminiCredConnect}>Connect to Gemini using Credentials (WE DO NOT STORE THEM)</button> */}
    </div>
  );
}

export default Home;

