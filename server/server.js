const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/proxy/auth/token', async (req, res) => {
    console.log(req.body)
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));