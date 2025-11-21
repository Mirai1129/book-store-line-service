const apiClient = require('../services/coreApiClient');

const syncProfile = async (req, res) => {
    try {
        const profile = req.body;

        const response = await apiClient.post('/users/', profile);

        req.session.userId = profile.line_id;

        console.log(`BFF: User ${profile.line_id} synced. Session created.`);
        res.status(200).json(response.data);

    } catch (error) {
        console.error('BFF Error: Failed to sync profile:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ detail: 'BFF Error: Cannot connect to Core API' });
        }
    }
};

module.exports = {
    syncProfile
};