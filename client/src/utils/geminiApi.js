import axios from 'axios';

const clientId = process.env.REACT_APP_CLIENT_ID;
const redirectUri = process.env.REACT_APP_REDIRECT_URL;
const scope = process.env.REACT_APP_SCOPE;

export function buildAuthUrl() {
    const state = generateRandomState();
    localStorage.setItem('auth_state', state);

    return `https://exchange.gemini.com/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
}

export async function getTokensFromCode(code, state) {
    if (!code) {
        throw new Error('No code provided');
    }

    const savedState = localStorage.getItem('auth_state');
    if (state !== savedState) {
        throw new Error('Invalid state parameter');
    }

    try {
        const response = await axios.post('http://localhost:4000/proxy/auth/token', { code });
        return response.data;
    } catch (error) {
        console.error('Error in getTokensFromCode:', error);
        throw error;
    }
}

export const handleLogout = async () => {
    const accessToken = localStorage.getItem('access_token');

    if (accessToken) {
        try {
            // Revoke the access token through the server proxy
            await axios.post('http://localhost:4000/proxy/revokeToken',
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            console.log('Token successfully revoked');
        } catch (error) {
            console.error('Error revoking token:', error);
        }
    }

    // Remove tokens from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    // Navigate to home page
    navigate('/');
};

export async function fetchBalance() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        throw new Error('No access token found');
    }

    try {
        const response = await axios.get('http://localhost:4000/proxy/balances', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error('Error in fetchBalance:', error);
        throw error;
    }
}

export async function transferCrypto(currency, amount, address) {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        throw new Error('No access token found');
    }

    try {
        const response = await axios.post(`http://localhost:4000/proxy/withdraw/${currency}`,
            { amount, address },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error in transferCrypto:', error);
        throw error;
    }
}

function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}