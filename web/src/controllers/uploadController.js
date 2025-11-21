const FormData = require('form-data');

const apiClient = require('../services/coreApiClient');

const uploadImages = async (req, res) => {
    try {
        // 1. 檢查 Session (最重要的身分驗證)
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ detail: 'User not authenticated' });
        }

        // 2. 檢查檔案是否存在
        // 因為我們用 multer.fields，檔案會放在 req.files 物件中
        // 結構: { front: [File], spine: [File], back: [File] }
        const files = req.files;
        if (!files || !files.front || !files.spine || !files.back) {
            return res.status(400).json({ detail: 'Missing required images (front, spine, back)' });
        }

        // 3. 準備轉發給 FastAPI 的 FormData
        const formData = new FormData();

        // [重點] 必填：告訴 FastAPI 這是哪個 User
        formData.append('user_id', userId);

        // [重點] 必填：依序加入三個檔案
        ['front', 'spine', 'back'].forEach(key => {
            const fileObj = files[key][0]; // 取得該欄位的第一個檔案
            formData.append(key, fileObj.buffer, {
                filename: fileObj.originalname,
                contentType: fileObj.mimetype
            });
        });

        // 4. 呼叫 FastAPI
        // FastAPI 完整路徑: /api/v1/upload/images
        // apiClient BaseURL: /api/v1
        // 所以這裡只要寫: /upload/images
        const response = await apiClient.post('/upload/images', formData, {
            headers: formData.getHeaders() // ⚠️ 這裡一定要加，不然 FastAPI 讀不到 boundary
        });

        // 5. 回傳 FastAPI 的結果 (URLs) 給前端
        res.status(201).json(response.data);

    } catch (error) {
        console.error('BFF Error: Upload images failed:', error.message);
        if (error.response) {
            // 轉發 FastAPI 的錯誤訊息
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ detail: 'BFF Error: Upload failed' });
        }
    }
};

module.exports = {
    uploadImages
};