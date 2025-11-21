// eslint-disable-next-line import/order
const express = require('express');

const router = express.Router();
const multer = require('multer');

const bookController = require('../../controllers/bookController');
const upload = multer()

router.get('/', bookController.getAllBooks);
router.post('/', bookController.createBook);
router.get('/me', bookController.getMyBooks);
router.post('/predict', upload.any(), bookController.predictCondition)

router.route('/:id')
    .get(bookController.getBookById)
    .patch(bookController.updateBook)
    .delete(bookController.deleteBook);

module.exports = router;