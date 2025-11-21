const apiClient = require('../services/coreApiClient');
const lineBotService = require('../services/lineBotService');

const createOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({detail: 'User not authenticated'});
        }

        const {book_ids, total_price} = req.body;

        if (!book_ids || !Array.isArray(book_ids) || book_ids.length === 0) {
            return res.status(400).json({detail: 'No books provided for order'});
        }
        if (!total_price) {
            return res.status(400).json({detail: 'Total price is required'});
        }

        const response = await apiClient.post('/orders/', {
            book_ids: book_ids,
            total_price: total_price
        }, {
            headers: {'X-User-ID': userId}
        });

        const createdOrder = response.data;

        await lineBotService.sendOrderConfirmation(userId, createdOrder);

        res.status(201).json(createdOrder);

    } catch (error) {
        console.error('BFF Error: Create Order failed:', error.message);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({detail: 'BFF Error: Order creation failed'});
        }
    }
};

module.exports = {createOrder};