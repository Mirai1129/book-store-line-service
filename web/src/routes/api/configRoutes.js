const express = require('express');
const router = express.Router();

const webUrl = process.env.WEB_URL;
const liffId = process.env.LIFF_ID;

router.get('/getWebUrl', (req, res) => {
    res.json({ url: webUrl });
});

router.get('/getLiffId', (req, res) => {
    res.json({ id: liffId });
})

module.exports = router;
