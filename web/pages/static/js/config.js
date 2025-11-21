export async function getWebUrl() {
    try {
        let url = "";

        const response = await fetch('/api/getWebUrl');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        url = data.url;
        return url;
    } catch (error) {
        console.error('Error fetching URL:', error);
        return null;
    }
}

export async function getLiffId() {
    try {
        let url = "";
        // 呼叫 BFF 的 /api/getLiffId
        const response = await fetch('/api/getLiffId');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        url = data.id;
        return url;
    } catch (error) {
        console.error('Error fetching URL:', error);
        return null;
    }
}

export const API_BASE_URL = "/api";

export const API_ENDPOINTS = {
    // User
    syncProfile: `${API_BASE_URL}/profile`,

    // Books
    books: `${API_BASE_URL}/books`,
    myBooks: `${API_BASE_URL}/books/me`,
    predict: `${API_BASE_URL}/books/predict`,
    bookById: (id) => `${API_BASE_URL}/books/${id}`,

    // Carts
    addToCart: `${API_BASE_URL}/cart/items`,
    myCart: `${API_BASE_URL}/cart`,
    removeCartItem: (bookId) => `${API_BASE_URL}/cart/items/${bookId}`,

    // Upload
    upload: `${API_BASE_URL}/upload/images`,

    // Order
    checkout: `${API_BASE_URL}/orders`
};