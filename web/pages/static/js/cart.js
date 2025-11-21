import {getLiffId, getWebUrl, API_ENDPOINTS} from "./config.js";

let isEditing = false;
let cartItemsWithDetails = [];

async function main() {
    const liffId = await getLiffId();
    const webUrl = await getWebUrl();

    await liff.init({liffId: liffId, withLoginOnExternalBrowser: false});

    if (!liff.isLoggedIn()) {
        liff.login({redirectUri: `${webUrl}/cart`});
        return;
    }

    const profile = await liff.getProfile();
    document.getElementById("user-picture").src = profile.pictureUrl;
    document.getElementById("user-name").innerText = profile.displayName;

    bindPageButtons();

    await loadCart();
}

async function loadCart() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '<p style="text-align:center; padding:20px;">載入中...</p>';
    cartItemsWithDetails = [];

    try {
        const res = await fetch(API_ENDPOINTS.myCart);
        if (!res.ok) {
            if (res.status === 404) {
                renderCart();
                return;
            }
            throw new Error("無法取得購物車");
        }

        const cartData = await res.json();
        const items = cartData.items || [];

        if (items.length === 0) {
            renderCart();
            return;
        }

        for (const item of items) {
            const bookRes = await fetch(API_ENDPOINTS.bookById(item.book_id));

            if (bookRes.ok) {
                const book = await bookRes.json();
                cartItemsWithDetails.push({
                    ...book,
                    qty: item.quantity
                });
            }
        }

        renderCart();

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="text-align:center; color:red;">載入失敗，請稍後再試。</p>';
    }
}

function renderCart() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';

    if (cartItemsWithDetails.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">購物車是空的。</p>';
        updateTotal(0);

        const editBtn = document.getElementById('editCart');
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (editBtn) editBtn.disabled = true;
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    const editBtn = document.getElementById('editCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (editBtn) editBtn.disabled = false;
    if (checkoutBtn) checkoutBtn.disabled = isEditing;

    let total = 0;

    cartItemsWithDetails.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;

        const div = document.createElement('div');
        div.className = 'book';
        div.style.position = 'relative';

        let deleteBtnHtml = '';
        if (isEditing) {
            deleteBtnHtml = `
                <button class="btn-delete-item" data-id="${item._id}" 
                    style="position:absolute; right:10px; top:10px; background:#ff4d4f; color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer; font-weight:bold;">
                    ✕
                </button>
            `;
        }

        div.innerHTML = `
            ${deleteBtnHtml}
            <div style="display:flex; gap:12px; align-items:center;">
                <img src="${item.image_url || 'static/images/default_book.png'}" style="width:80px; height:100px; object-fit:cover; border-radius:4px;">
                <div>
                    <h4 style="margin: 0 0 5px 0;">${item.title}</h4>
                    <p style="margin: 0; color:#555;">單價：$${item.price}</p>
                    <p style="margin: 0; font-weight:bold;">小計：$${subtotal}</p>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    updateTotal(total);

    if (isEditing) {
        bindDeleteEvents();
    }
}

function updateTotal(amount) {
    let totalDiv = document.getElementById('cartTotalDiv');
    const container = document.getElementById('cartItems');

    if (!totalDiv) {
        totalDiv = document.createElement('div');
        totalDiv.id = 'cartTotalDiv';
        totalDiv.style.marginTop = '20px';
        totalDiv.style.textAlign = 'right';
        totalDiv.style.borderTop = '1px solid #eee';
        totalDiv.style.paddingTop = '10px';
        container.appendChild(totalDiv);
    }

    totalDiv.innerHTML = `<h3>總金額：$${amount}</h3>`;
}

function bindDeleteEvents() {
    const deleteBtns = document.querySelectorAll('.btn-delete-item');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const bookId = e.target.getAttribute('data-id');
            if (!bookId) return;

            if (!confirm("確定要將此商品移出購物車嗎？")) return;

            try {
                const res = await fetch(API_ENDPOINTS.removeCartItem(bookId), {
                    method: 'DELETE'
                });

                if (res.ok) {
                    await loadCart();
                } else {
                    alert("刪除失敗");
                }
            } catch (err) {
                console.error("刪除錯誤:", err);
                alert("網路錯誤");
            }
        });
    });
}

function bindPageButtons() {
    const editCartBtn = document.getElementById('editCart');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (editCartBtn) {
        editCartBtn.addEventListener('click', () => {
            isEditing = !isEditing;

            editCartBtn.innerText = isEditing ? "完成" : "編輯購物車";

            editCartBtn.style.backgroundColor = isEditing ? "#666" : "";

            renderCart();
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            if (cartItemsWithDetails.length === 0) return alert("購物車是空的");

            let calculatedTotal = 0;
            const bookIds = [];

            cartItemsWithDetails.forEach(item => {
                calculatedTotal += (item.price * item.qty);
                bookIds.push(item._id);
            });

            const confirmMsg = `總金額為 NT$${calculatedTotal}\n確定要結帳嗎？\n(這將會建立訂單並扣除庫存)`;
            if (!confirm(confirmMsg)) return;

            checkoutBtn.disabled = true;
            checkoutBtn.innerText = "處理中...";

            try {
                const payload = {
                    book_ids: bookIds,
                    total_price: calculatedTotal
                };

                const res = await fetch(API_ENDPOINTS.checkout, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert("🎉 結帳成功！感謝您的購買。");
                    window.location.href = '/';
                } else {
                    const errData = await res.json();
                    if (res.status === 409) {
                        alert("結帳失敗：購物車內有部分書籍已被其他人買走了。\n系統將重新整理購物車。");
                        await loadCart();
                    } else {
                        alert(`結帳失敗：${errData.detail || "未知錯誤"}`);
                    }
                }
            } catch (err) {
                console.error("結帳錯誤:", err);
                alert("結帳發生錯誤，請檢查網路連線。");
            } finally {
                checkoutBtn.disabled = false;
                checkoutBtn.innerText = "結帳";
            }
        });
    }
}

main();