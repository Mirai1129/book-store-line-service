const express = require('express');
const router = express.Router();

const bookRoutes = require('./bookRoutes');
const cartRoutes = require('./cartRoutes');
const configRoutes = require('./configRoutes');
const orderRoutes = require('./orderRoutes');
const uploadRoutes = require('./uploadRoutes');
const userRoutes = require('./userRoutes');



router.use('/books', bookRoutes);
router.use('/cart', cartRoutes);
router.use(configRoutes);
router.use('/orders', orderRoutes);
router.use('/upload', uploadRoutes);
router.use(userRoutes);

module.exports = router;