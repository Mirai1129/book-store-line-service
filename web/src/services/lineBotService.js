const { messagingApi } = require('@line/bot-sdk');

const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new messagingApi.MessagingApiClient(config);

/**
 * 發送訂單確認訊息
 * @param {string} userId - 使用者的 LINE ID
 * @param {object} orderData - 訂單資料
 */
const sendOrderConfirmation = async (userId, orderData) => {
    try {
        const flexMessage = {
            type: "flex",
            altText: "訂單建立成功通知",
            contents: {
                type: "bubble",
                body: {
                    type: "box",
                    layout: "vertical",
                    contents: [
                        {
                            type: "text",
                            text: "訂單建立成功！🎉",
                            weight: "bold",
                            size: "xl",
                            color: "#1DB446"
                        },
                        {
                            type: "text",
                            text: "感謝您的購買，以下是您的訂單資訊：",
                            size: "sm",
                            color: "#555555",
                            wrap: true,
                            margin: "md"
                        },
                        {
                            type: "separator",
                            margin: "xl"
                        },
                        {
                            type: "box",
                            layout: "vertical",
                            margin: "lg",
                            spacing: "sm",
                            contents: [
                                {
                                    type: "box",
                                    layout: "baseline",
                                    spacing: "sm",
                                    contents: [
                                        {
                                            type: "text",
                                            text: "訂單編號",
                                            color: "#aaaaaa",
                                            size: "sm",
                                            flex: 2
                                        },
                                        {
                                            type: "text",
                                            text: orderData.id || orderData._id || "N/A",
                                            wrap: true,
                                            color: "#666666",
                                            size: "sm",
                                            flex: 4
                                        }
                                    ]
                                },
                                {
                                    type: "box",
                                    layout: "baseline",
                                    spacing: "sm",
                                    contents: [
                                        {
                                            type: "text",
                                            text: "總金額",
                                            color: "#aaaaaa",
                                            size: "sm",
                                            flex: 2
                                        },
                                        {
                                            type: "text",
                                            text: `NT$ ${orderData.total_price || 0}`,
                                            wrap: true,
                                            color: "#666666",
                                            size: "sm",
                                            flex: 4,
                                            weight: "bold"
                                        }
                                    ]
                                },
                                {
                                    type: "box",
                                    layout: "baseline",
                                    spacing: "sm",
                                    contents: [
                                        {
                                            type: "text",
                                            text: "狀態",
                                            color: "#aaaaaa",
                                            size: "sm",
                                            flex: 2
                                        },
                                        {
                                            type: "text",
                                            text: "已付款 (Paid)",
                                            wrap: true,
                                            color: "#1DB446",
                                            size: "sm",
                                            flex: 4
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                footer: {
                    type: "box",
                    layout: "vertical",
                    spacing: "sm",
                    contents: [
                        {
                            type: "button",
                            style: "link",
                            height: "sm",
                            action: {
                                type: "uri",
                                label: "查看我的書籍",
                                uri: "https://liff.line.me/" + process.env.LIFF_ID
                            }
                        }
                    ]
                }
            }
        };

        await client.pushMessage({
            to: userId,
            messages: [flexMessage]
        });

        console.log(`✅ LINE Message sent to ${userId}`);

    } catch (error) {
        const errorDetail = error.originalError && error.originalError.response && error.originalError.response.data;

        console.error("❌ Failed to send LINE message:", errorDetail || error.message);
    }
};

module.exports = {
    sendOrderConfirmation
};