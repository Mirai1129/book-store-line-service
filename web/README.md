## 怎麼跑這個專案

1. 設定專案
    在專案最外層新增一個 `.env` 的檔案，並設定底下的變數
    ```shell
    WEB_URL=  
    CORE_API_URL=http://127.0.0.1:8000
    SESSION_SECRET=
    JWT_SECRET=
    PORT=5000 # 或是其他你設定的
    LIFF_ID=
    LINE_CHANNEL_ACCESS_TOKEN=
    LINE_CHANNEL_SECRET=
    ```

2. 啟動專案

    ```shell
    npm install
    node app.js
    ```


