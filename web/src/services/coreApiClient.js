const axios = require('axios');


const CORE_API_URL = process.env.CORE_API_URL;

if (!CORE_API_URL) {
    console.error('FATAL ERROR: CORE_API_URL is not defined in .env');
}

const apiClient = axios.create({
    baseURL: `${CORE_API_URL}/api/v1`,
    timeout: 60000,
    headers: {'Content-Type': 'application/json'}
});

module.exports = apiClient;