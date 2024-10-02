import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getTokensFromCode } from '../utils/geminiApi';

function Callback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('Processing callback...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Callback initiated. Current URL:', window.location.href);
        
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        console.log('Extracted code:', code);
        console.log('Extracted state:', state);

        if (!code) {
          throw new Error('No code parameter found in URL');
        }

        setStatus('Retrieving tokens...');
        console.log("pre")
        const tokens = await getTokensFromCode(code, state);
        console.log("post")
        console.log('Received tokens:', tokens);

        if (!tokens || !tokens.access_token) {
          throw new Error('Invalid token response');
        }

        setStatus('Storing tokens...');
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        
        setStatus('Redirecting to dashboard...');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error in callback:', error);
        setStatus(`Error: ${error.message || 'An unknown error occurred'}`);
      }
    };

    handleCallback();
  }, [navigate, location]);

  return <div>{status}</div>;
}

export default Callback;