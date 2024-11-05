const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Constants
const GEMINI_API_URL = 'https://api.sandbox.gemini.com';
const GEMINI_AUTH_URL = 'https://exchange.sandbox.gemini.com';

// Middleware to validate access token
const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Verify the token here (e.g., by decoding and validating the JWT)
  // If the token is invalid, return a 401 Unauthorized response

  next();
};

app.get('/welcome', (req, res) => {
  res.send("Welcome to the backend (server.js), if you see this, it means we are live!");
});

// Handle token exchange
app.post('/proxy/auth/token', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const payload = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      redirect_uri: process.env.REDIRECT_URL,
      grant_type: 'authorization_code'
    };

    const response = await axios.post(`${GEMINI_AUTH_URL}/auth/token`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error
    });
  }
});

// Get balances
app.get('/proxy/balances', validateToken, async (req, res) => {
  try {
    const accessToken = req.headers.authorization.split(' ')[1];
    const response = await axios.post(`${GEMINI_API_URL}/v1/balances`, null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Balances error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to fetch balances'
    });
  }
});

// Handle withdrawals
app.post('/proxy/withdraw/:currency', validateToken, async (req, res) => {
  try {
    const { currency } = req.params;
    const { amount, address } = req.body;

    if (!amount || !address) {
      return res.status(400).json({ error: 'Amount and address are required' });
    }

    const payload = {
      request: `/v1/withdraw/${currency}`,
      amount,
      address,
      timestamp: Math.floor(Date.now() / 1000)
    };

    const response = await axios.post(
      `${GEMINI_API_URL}/v1/withdraw/${currency}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${req.headers.authorization.split(' ')[1]}`,
          'Content-Type': 'application/json',
          'X-GEMINI-PAYLOAD': Buffer.from(JSON.stringify(payload)).toString('base64')
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Withdrawal error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to process withdrawal'
    });
  }
});

// Handle token revocation
app.post('/proxy/revokeToken', validateToken, async (req, res) => {
  try {
    const accessToken = req.headers.authorization.split(' ')[1];
    const payload = {
      request: "/v1/oauth/revokeByToken",
      timestamp: Math.floor(Date.now() / 1000)
    };

    const response = await axios.post(
      `${GEMINI_API_URL}/v1/oauth/revokeByToken`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Token revocation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Failed to revoke token'
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));