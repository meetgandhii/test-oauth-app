const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/proxy/auth/token', async (req, res) => {
  try {
    const response = await axios.post('https://exchange.gemini.com/auth/token', {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: req.body.code,
      redirect_uri: process.env.REDIRECT_URL,
      grant_type: 'authorization_code'
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/proxy/balances', async (req, res) => {
  try {
    console.log("Balances")
    const accessToken = req.headers.authorization.split(' ')[1];
    const response = await axios.post('https://api.gemini.com/v1/balances', null, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error in /proxy/balances:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/proxy/withdraw/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    const { amount, address } = req.body;
    const payload = {
      request: `/v1/withdraw/${currency}`,
      amount,
      address
    };
    const response = await axios.post(`https://api.gemini.com/v1/withdraw/${currency}`, null, {
      headers: {
        'Authorization': `Bearer ${req.headers.authorization.split(' ')[1]}`,
        'X-GEMINI-PAYLOAD': Buffer.from(JSON.stringify(payload)).toString('base64')
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));