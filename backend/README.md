## 初始化專案

只要使用 docker 設定第一點即可。

1. 在專案最外層設定 `.env`。

   ```env
   MONGODB_CONNECTION_URL=mongodb://localhost:27017
   DATABASE_NAME=bookbot

   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=

   JWT_SECRET=bookstore_jwt_secret
   API_SERVER_PORT=5000
   ```

2. 設定環境

- uv
  ```bash
  uv sync
  ```
- pip

  ```bash
  python -m venv .venv
  source .\Scripts\activate
  pip install -r requirements.txt
  ```

## 運行專案

```bash
uvicorn main:app
```
