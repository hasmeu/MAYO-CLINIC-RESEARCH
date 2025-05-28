//Creates a server to handle tokens
const db = require('../../db/connection');

const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = 3000;

// Fitbit app credentials (loaded from .env)
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/callback';

// Token storage file
const TOKEN_FILE = path.join(__dirname, 'fitbit_tokens.json');

// Fitbit API endpoints
const API_ENDPOINT = 'https://api.fitbit.com';
const AUTHORIZE_ENDPOINT = 'https://www.fitbit.com';
const TOKEN_URL = `${API_ENDPOINT}/oauth2/token`;
const AUTHORIZE_URL = `${AUTHORIZE_ENDPOINT}/oauth2/authorize`;

// Store code verifier in memory (in production, use a session store)
let codeVerifier = '';

// Generate code verifier and challenge
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url'); // 43+ characters
}

function generateCodeChallenge(verifier) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

// Helper function to load tokens
async function loadTokens() {
  try {
    const data = await fs.readFile(TOKEN_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

// Helper function to save tokens
async function saveTokens(token) {
  await fs.writeFile(TOKEN_FILE, JSON.stringify(token, null, 2));
  console.log('Tokens saved:', token);
}

// Helper function to refresh tokens
async function refreshToken(refreshToken) {
  const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  try {
    const response = await axios.post(TOKEN_URL, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID, // Required for PKCE in Fitbit's implementation
    }, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const newToken = response.data;
    await saveTokens(newToken);
    return newToken;
  } catch (err) {
    console.error('Error refreshing token:', err.response?.data || err.message);
    throw err;
  }
}

// Middleware to ensure token is valid
async function ensureToken(req, res, next) {
  let token = await loadTokens();
  if (!token) {
    return res.redirect('/login');
  }

  const now = Math.floor(Date.now() / 1000);
  if (token.expires_at && now >= token.expires_at) {
    token = await refreshToken(token.refresh_token);
  }

  req.token = token;
  next();
}

app.get('/', ensureToken, async (req, res) => {
  try {
    const response = await axios.get(`${API_ENDPOINT}/1/user/-/profile.json`, {
      headers: {
        'Authorization': `Bearer ${req.token.access_token}`,
      },
    });
    res.send(`Welcome! User Profile: <pre>${JSON.stringify(response.data, null, 2)}</pre>`);
  } catch (err) {
    console.error('Error fetching profile:', err.response?.data || err.message);
    res.status(500).send('Error fetching profile');
  }
});

app.get('/login', (req, res) => {
  // Generate PKCE code verifier and challenge
  codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Generate authorization URL with PKCE
  const scopes = ['activity', 'nutrition', 'heartrate', 'location', 'profile', 'settings', 'sleep', 'social', 'weight'];
  const authUrl = `${AUTHORIZE_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes.join(' '))}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  res.send(`<a href="${authUrl}">Login with Fitbit</a>`);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Error: No code provided');
  }

  // Exchange code for tokens using PKCE
  const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  try {
    const response = await axios.post(TOKEN_URL, new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    }), {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const token = response.data;
    token.expires_at = Math.floor(Date.now() / 1000) + token.expires_in;
    await saveTokens(token);
    codeVerifier = ''; // Clear verifier after use. It should be tied to a user session eventually
    res.redirect('/');
  } catch (err) {
    console.error('Error exchanging code:', err.response?.data || err.message);
    res.status(500).send('Error during token exchange');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});