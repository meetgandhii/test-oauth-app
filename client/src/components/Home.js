import React, { useState } from 'react';
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

  return (
    <div>
      <h1>Gemini OAuth Example</h1>
      <button onClick={geminiOAuthConnect}>Connect to Gemini using OAuth</button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}

export default Home;