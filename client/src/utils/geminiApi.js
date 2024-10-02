import axios from 'axios';

const clientId = process.env.REACT_APP_CLIENT_ID;
const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
const redirectUri = process.env.REACT_APP_REDIRECT_URL;
const scope = process.env.REACT_APP_SCOPE;

export function buildAuthUrl() {
    const state = "loremipsum";
    
    return `https://exchange.gemini.com/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
}

export async function getTokensFromCode(code, state) {
    if (!code) {
        throw new Error('No code provided');
    }

    if (state !== 'loremipsum') {
        console.log(state)
        throw new Error('Invalid state parameter');
    }

    try {
        const response = await axios.post('http://localhost:4000/proxy/auth/token', { code });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error in getTokensFromCode:', error);
        throw error;
    }

    return response.data;
}

export async function fetchBalance() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        throw new Error('No access token found');
    }

    const response = await axios.post('https://api.gemini.com/v1/balances', null, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-GEMINI-PAYLOAD': btoa(JSON.stringify({ request: '/v1/balances' }))
        }
    });

    return response.data;
}

export async function transferCrypto(currency, amount, address) {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        throw new Error('No access token found');
    }

    const payload = {
        request: `/v1/withdraw/${currency}`,
        amount,
        address
    };

    const response = await axios.post(`https://api.gemini.com/v1/withdraw/${currency}`, null, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-GEMINI-PAYLOAD': btoa(JSON.stringify(payload))
        }
    });

    return response.data;
}

function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
