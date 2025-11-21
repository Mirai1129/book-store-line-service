# LineShelf AI 書快拍 (AI Second-Hand Book Store)

這是一個基於 LINE LIFF 的二手書交易平台，結合了 AI 書況辨識功能。
採用微服務架構 (Microservices)，將前端與核心邏輯分離，並使用 BFF (Backend for Frontend)。

## 快速開始 (Quick Start)

1. 前置需求 (Prerequisites)

   你需要有以下這些東西

   - Docker & Docker Compose
   - Ngrok (用於本地開發時提供公開網址)
   - LINE Developers Console 帳號 (需建立 Login Channel)
   - Cloudinary 帳號 (用於圖片儲存)

2. 環境變數設定 (.env)

   請在對應的資料夾中建立 `.env` 檔案：

   1. [後端設定](.backend/README.md) (backend/`.env`)

   2. [BFF 設定](.web/README.md) (web/`.env`)

3. 啟動服務 (Docker)

   在專案根目錄執行以下指令：

   ```
   docker-compose up --build
   ```
