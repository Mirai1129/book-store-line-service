const express = require('express');

const router = express.Router();
const path = require('path');


const templatesPath = path.join(__dirname, '../../pages/templates');


router.get('/', (req, res) => {
    res.sendFile(path.join(templatesPath, 'index.html'));
});

router.get('/book', (req, res) => {
    res.sendFile(path.join(templatesPath, 'book.html'));
})

router.get('/cart', (req, res) => {
    res.sendFile(path.join(templatesPath, 'cart.html'));
})

module.exports = router;