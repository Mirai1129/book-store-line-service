// eslint-disable-next-line import/order
const express = require('express');

const router = express.Router();
const multer = require('multer');

const uploadController = require('../../controllers/uploadController');


// 設定 Multer: 將檔案暫存在記憶體中 (MemoryStorage)，方便我們直接轉發
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload/images
// 使用 .fields() 來接收具名的多個檔案
router.post('/images',
    upload.fields([
        { name: 'front', maxCount: 1 },
        { name: 'spine', maxCount: 1 },
        { name: 'back', maxCount: 1 }
    ]),
    uploadController.uploadImages
);

module.exports = router;