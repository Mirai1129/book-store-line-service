const express = require('express');

const router = express.Router();
const cartController = require('../../controllers/cartController');

router.post('/items', cartController.addToCart);
router.get('/', cartController.getCart);
router.delete('/items/:bookId', cartController.removeItem);

module.exports = router;