# LineShelf AI 書快拍 (AI Second-Hand Book Store)

這是一個基於 LINE LIFF 的二手書交易平台，結合了 AI 書況辨識功能。
採用微服務架構 (Microservices)，將前端與核心邏輯分離，並使用 BFF (Backend for Frontend)。

## 系統架構 (Architecture)

本專案採用 Docker 容器化部署，由以下三個主要服務組成：

- Web / BFF (Node.js Express):
  - 負責提供 LIFF 前端頁面。
  - 處理身分驗證 (Session)、LINE Login 與路由轉發。
  - 負責發送 LINE 推播訊息 (Flex Message)。
- Core API (Python FastAPI):
  - 核心業務邏輯。
  - 負責資料庫操作 (MongoDB) 與 Pydantic 資料驗證。
  - 處理圖片上傳 (Cloudinary) 與 AI 書況預測。
- Database (MongoDB):
  - 儲存使用者、書籍、購物車與訂單資料。

## 快速開始 (Quick Start)

1. 前置需求 (Prerequisites)

   你需要有以下這些東西

   - Docker & Docker Compose
   - Ngrok (用於本地開發時提供公開網址)
   - LINE Developers Console 帳號 (需建立 Login Channel)
   - Cloudinary 帳號 (用於圖片儲存)

2. 環境變數設定 (.env)

   請在對應的資料夾中建立 `.env` 檔案：

A. 後端設定 (backend/`.env`)

    ```
    # MongoDB
    MONGODB_CONNECTION_URL=mongodb://localhost:27017
    DATABASE_NAME=my_book_app

    # Cloudinary 設定
    CLOUDINARY_CLOUD_NAME=您的 CloudName
    CLOUDINARY_API_KEY=您的 APIKey
    CLOUDINARY_API_SECRET=您的 APISecret
    ```

B. BFF 設定 (web/`.env`)

    ```
    # 服務 Port
    PORT=5000

    # Core API 位置
    CORE_API_URL=http://localhost:8000

    # Session key
    SESSION_SECRET=your_super_secret_key_123

    # LINE 設定
    LINE_CHANNEL_ACCESS_TOKEN=您的 MessagingAPIToken
    LINE_CHANNEL_SECRET=您的 ChannelSecret
    LIFF_ID=您的 LIFF_ID

    # 公開網址
    PUBLIC_WEB_URL=https://xxxx-xxxx.ngrok-free.app
    ```

3. 啟動服務 (Docker)

   在專案根目錄執行以下指令：

   ```
   docker-compose up --build
   ```

4. 公開與 LINE 設定 (Ngrok)

由於 LINE Login 需要 HTTPS 的公開網址，請依照以下步驟設定：

    1. 啟動 Ngrok：
        ```bash
        ngrok http 5000
        ```

    2. 更新設定：
        - 複製 Ngrok 產生的網址 (例如 https://abc.ngrok-free.app)。
        - 更新 web/`.env` 中的 `PUBLIC_WEB_URL`。
        - 重要：更新後需重啟 Web 容器讓設定生效 (docker-compose restart web)。

    3. LINE Developers Console 設定：

        - LIFF 頁籤 -> Endpoint URL：設定為 Ngrok 網址。
