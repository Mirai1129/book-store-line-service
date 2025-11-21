const apiClient = require('../services/coreApiClient');

const addToCart = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            console.error('BFF Error: Add to cart failed. User not authenticated.');
            return res.status(401).json({ detail: 'User not authenticated' });
        }

        const payload = {
            book_id: req.body.bookId,
            quantity: 1
        };

        const response = await apiClient.post(`/carts/items`, payload, {
            headers: {
                'X-User-ID': userId
            }
        });

        console.log(`BFF: Item added to cart for user ${userId}.`);
        res.status(200).json(response.data);

    } catch (error) {
        console.error('BFF Error: Failed to add to cart:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ detail: 'BFF Error: Cannot connect to Core API' });
        }
    }
};

const getCart = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ detail: 'User not authenticated' });
        }

        const response = await apiClient.get(`/carts/`, {
            headers: {
                'X-User-ID': userId
            }
        });

        res.status(200).json(response.data);

    } catch (error) {
        console.error('BFF Error: Get cart failed:', error.message);
        if (error.response) {
            if (error.response.status === 404) {
                return res.status(200).json({ items: [] });
            }
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ detail: 'BFF Error: Cannot connect to Core API' });
        }
    }
};

const removeItem = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { bookId } = req.params;

        if (!userId) {
            return res.status(401).json({ detail: 'User not authenticated' });
        }

        const response = await apiClient.delete(`/carts/items/${bookId}`, {
            headers: { 'X-User-ID': userId }
        });

        res.status(200).json(response.data);

    } catch (error) {
        console.error('BFF Error: Remove item failed:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ detail: 'BFF Error: Remove failed' });
        }
    }
};

module.exports = {
    addToCart,
    getCart,
    removeItem
};