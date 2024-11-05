import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getTokensFromCode } from '../utils/geminiApi';

function Callback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('Processing callback...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        if (error) {
          throw new Error(`Authentication Error: ${error} - ${errorDescription}`);
        }

        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (!code) {
          throw new Error('No authorization code received from Gemini. Please try again.');
        }

        setStatus('Retrieving tokens...');
        const tokens = await getTokensFromCode(code, state);

        if (!tokens || !tokens.access_token) {
          throw new Error('Invalid token response');
        }

        setStatus('Storing tokens...');
        localStorage.setItem('access_token', tokens.access_token);
        if (tokens.refresh_token) {
          localStorage.setItem('refresh_token', tokens.refresh_token);
        }

        setStatus('Redirecting to dashboard...');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error in callback:', error);
        setError(error.message);
        setStatus('Authentication failed');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate, location]);

  if (error) {
    return (
      <div>
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <p>Redirecting to home page...</p>
      </div>
    );
  }

  return <div>{status}</div>;
}

export default Callback;