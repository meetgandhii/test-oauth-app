import axios from 'axios';

const clientId = process.env.REACT_APP_CLIENT_ID;
const redirectUri = process.env.REACT_APP_REDIRECT_URL;
const scope = process.env.REACT_APP_SCOPE;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Builds the Gemini OAuth authorization URL
 */
export function buildAuthUrl() {
    const state = generateRandomState();
    localStorage.setItem('auth_state', state);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope,
        state: state
    });

    return `https://exchange.gemini.com/auth?${params.toString()}`;
}

/**
 * Exchanges authorization code for access tokens
 */
export async function getTokensFromCode(code, state) {
    if (!code) {
        throw new Error('Authorization code is required');
    }

    const savedState = localStorage.getItem('auth_state');
    if (state !== savedState) {
        throw new Error('State parameter mismatch - possible CSRF attack');
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/proxy/auth/token`, { code });
        
        // Clean up state after successful token exchange
        localStorage.removeItem('auth_state');
        
        return response.data;
    } catch (error) {
        console.error('Token exchange error:', error);
        throw new Error(error.response?.data?.error || 'Failed to exchange authorization code');
    }
}

/**
 * Handles user logout
 */
export const handleLogout = async (navigate) => {
    const accessToken = localStorage.getItem('access_token');
    
    if (accessToken) {
        try {
            await axios.post(
                `${API_BASE_URL}/proxy/revokeToken`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
        } catch (error) {
            console.error('Token revocation error:', error);
        } finally {
            // Clear tokens regardless of revocation success
            clearAuthData();
        }
    }

    navigate('/');
};

/**
 * Fetches user's balance
 */
export async function fetchBalance() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        throw new Error('Not authenticated');
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/proxy/balances`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            clearAuthData();
            throw new Error('Session expired. Please log in again.');
        }
        throw new Error(error.response?.data?.error || 'Failed to fetch balance');
    }
}

/**
 * Initiates a crypto transfer
 */
export async function transferCrypto(currency, amount, address) {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        throw new Error('Not authenticated');
    }

    if (!currency || !amount || !address) {
        throw new Error('Currency, amount, and address are required');
    }

    try {
        const response = await axios.post(
            `${API_BASE_URL}/proxy/withdraw/${currency}`,
            { amount, address },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            clearAuthData();
            throw new Error('Session expired. Please log in again.');
        }
        throw new Error(error.response?.data?.error || 'Transfer failed');
    }
}

/**
 * Generates a random state parameter for CSRF protection
 */
function generateRandomState() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Clears all authentication data from localStorage
 */
function clearAuthData() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_state');
}

/**
 * Checks if the user is authenticated
 */
export function isAuthenticated() {
    return !!localStorage.getItem('access_token');
}