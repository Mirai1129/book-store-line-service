// import liff from "/@line/liff";
import {getLiffId, getWebUrl, API_ENDPOINTS} from "./config.js";

function getSafeId(book) {
    if (!book) {
        return null;
    }

    if (typeof book._id === 'string') {
        return book._id;
    }

    if (book._id && book._id.$oid) {
        return book._id.$oid;
    }

    if (book.id) {
        return book.id;
    }
    return null;
}


async function syncUserProfile(profile) {
    try {
        await fetch(API_ENDPOINTS.syncProfile, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                line_id: profile.userId,
                name: profile.displayName
            })
        });
        console.log("👤 用戶資料同步成功。");
        return true;
    } catch (err) {
        console.error("❌ 用戶資料同步失敗:", err);
        if (err.response && err.response.data) {
            console.error('FastAPI Validation Error:', err.response.data);
        }
        alert("無法連線至使用者認證伺服器。");
        return false;
    }
}

async function initBookLiffApp() {
    const profile = await liff.getProfile();
    document.getElementById("user-picture").src = profile.pictureUrl;
    document.getElementById("user-name").innerText = profile.displayName;
    document.getElementById("user-id").innerText = profile.userId;

    return await syncUserProfile(profile);
}

async function loadBooks() {
    const container = document.getElementById('myBooksList');
    if (!container) {
        return;
    }

    try {
        const response = await fetch(API_ENDPOINTS.myBooks);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const books = await response.json();
        container.innerHTML = "";
        if (!books.length) {
            container.innerHTML = "<p>目前沒有上架的書籍。</p>";
            return;
        }
        books.forEach((b) => {
            const bookId = getSafeId(b);
            if (!bookId) {
                return;
            }

            const el = document.createElement('div');
            el.className = 'book';

            const soldBadge = b.is_sold ? '<span style="color:red; font-weight:bold;">(已售出)</span> ' : '';

            el.innerHTML = `
                <img src="${b.image_url || 'static/images/default_book.png'}" alt="${b.title || '書籍封面'}" />
                <h4>${soldBadge}${b.title || '未知書名'}</h4>
                <p><small>作者：${b.author || '未知作者'}</small></p>
                <p>AI書況預測: ${b.condition || '尚未預測'}</p>
                <div class="row">
                  <div>NT$ ${b.price || '?'}</div>
                  <div>
                    <button class="edit-btn" data-id="${bookId}">編輯</button>
                    <button class="delete-btn" data-id="${bookId}">刪除</button>
                    <!-- [ ⬆️ ⬆️ ⬆️ 修改完畢 ⬆️ ⬆️ ⬆️ ] -->
                  </div>
                </div>
              `;
            container.appendChild(el);
        });
    } catch (err) {
        console.error("❌ 無法載入書籍資料：", err);
        container.innerHTML = "<p>無法載入書籍資料，請稍後再試。</p>";
    }
}

async function deleteBook(id) {
    if (!id) {
        return alert("刪除時發生錯誤 (ID 無效)");
    }
    if (!confirm('您確定要刪除這本書嗎？此動作無法復原。')) {
        return;
    }

    try {
        const res = await fetch(API_ENDPOINTS.bookById(id), {method: 'DELETE'});
        if (res.ok) {
            alert('書籍刪除成功！');
            loadBooks();
        } else {
            const err = await res.json();
            alert(`刪除失敗： ${err.error || '未知錯誤'}`);
        }
    } catch (err) {
        console.error('❌ 刪除時發生錯誤:', err);
        alert('刪除時發生錯誤');
    }
}

async function openEditModal(id) {
    if (!id) return alert("開啟編輯時發生錯誤 (ID 無效)");

    try {
        const res = await fetch(API_ENDPOINTS.bookById(id));
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`無法取得書籍資料： ${errorData.error || res.statusText}`);
        }
        const book = await res.json();

        const bookId = getSafeId(book);
        document.getElementById('editBookId').value = bookId;
        document.getElementById('editBookTitle').value = book.title || '';
        document.getElementById('editBookAuthor').value = book.author || '';
        document.getElementById('editBookPrice').value = book.price || '';
        document.getElementById('editBookHasHighlight').checked = book.has_highlight || false;
        document.getElementById('editBookHasNote').checked = book.has_note || false;
        document.getElementById('editModalOverlay').style.display = 'flex';
    } catch (err) {
        console.error('❌ 開啟編輯時發生錯誤:', err);
        alert(`開啟編輯時發生錯誤: ${err.message}`);
    }
}


function bindAllEventListeners() {
    const uploadBtn = document.getElementById("uploadBtn");

    if (uploadBtn) {
        uploadBtn.addEventListener("click", async () => {
            const title = document.getElementById("bookTitle").value.trim();
            const author = document.getElementById("bookAuthor").value.trim();
            const priceStr = document.getElementById("bookPrice").value.trim();
            const price = Number(priceStr);
            const hasHighlight = document.getElementById("bookHasHighlight").checked;
            const hasNote = document.getElementById("bookHasNote").checked;
            const frontFile = document.getElementById("bookFrontInput").files[0];
            const spineFile = document.getElementById("bookSpineInput").files[0];
            const backFile = document.getElementById("bookBackInput").files[0];
            const userId = document.getElementById("user-id").innerText;
            const resultDiv = document.getElementById("result");

            if (!title || !author || !priceStr) {
                return alert("請填寫書籍資料！");
            }
            if (isNaN(price) || price <= 0) {
                return alert("價格請輸入正確數字！");
            }
            if (!frontFile || !spineFile || !backFile) {
                return alert("請完整上傳三張圖片！");
            }
            if (!userId) {
                return alert("無法取得使用者資訊！");
            }

            if (resultDiv) {
                resultDiv.innerHTML = "☁️ 正在上傳圖片...";
            }

            uploadBtn.disabled = true;

            try {
                const uploadFormData = new FormData();
                uploadFormData.append("front", frontFile);
                uploadFormData.append("spine", spineFile);
                uploadFormData.append("back", backFile);

                const uploadRes = await fetch(API_ENDPOINTS.upload, {method: "POST", body: uploadFormData});
                if (!uploadRes.ok) {
                    throw new Error(`圖片上傳失敗: ${uploadRes.status}`);
                }
                const urls = await uploadRes.json();

                if (resultDiv) {
                    resultDiv.innerHTML = "🤖 正在 AI 分析...";
                }
                const predictFormData = new FormData();
                predictFormData.append("front", frontFile);
                predictFormData.append("spine", spineFile);
                predictFormData.append("back", backFile);

                const predictRes = await fetch(API_ENDPOINTS.predict, {method: "POST", body: predictFormData});
                if (!predictRes.ok) {
                    throw new Error("AI 預測失敗");
                }
                const predictData = await predictRes.json();
                const aiCondition = predictData.desc || "無法辨識";

                document.getElementById("bookCondition").innerText = aiCondition;

                if (resultDiv) {
                    resultDiv.innerHTML = "💾 儲存中...";
                }

                const bookData = {
                    title, author, price, seller_id: userId, condition: aiCondition,
                    image_url: urls.front,
                    image_front_url: urls.front,
                    image_spine_url: urls.spine,
                    image_back_url: urls.back,
                    has_highlight: hasHighlight,
                    has_note: hasNote
                };

                const saveRes = await fetch(API_ENDPOINTS.books, {
                    method: "POST",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(bookData)
                });

                if (saveRes.ok) {
                    alert(`上架成功！`);
                    await loadBooks();
                    document.getElementById('modalOverlay').style.display = 'none';
                    document.getElementById("bookTitle").value = "";
                    document.getElementById("bookAuthor").value = "";
                    document.getElementById("bookPrice").value = "";
                    document.getElementById("bookHasHighlight").checked = false;
                    document.getElementById("bookHasNote").checked = false;
                    document.getElementById("bookFrontInput").value = "";
                    document.getElementById("bookSpineInput").value = "";
                    document.getElementById("bookBackInput").value = "";
                    document.getElementById("bookCondition").innerText = "尚未預測";

                    if (resultDiv) {
                        resultDiv.innerHTML = "";
                    }
                } else {
                    const errData = await saveRes.json();
                    throw new Error(`上架失敗：${errData.detail || "未知錯誤"}`);
                }
            } catch (err) {
                console.error(err);
                if (resultDiv) resultDiv.innerHTML = `<p style='color:red;'>錯誤: ${err.message}</p>`;
                alert(`發生錯誤: ${err.message}`);
            } finally {
                uploadBtn.disabled = false;
            }
        });
    }

    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', async () => {
            const id = document.getElementById('editBookId').value;

            if (!id || id === "undefined" || id === "[object Object]") {
                return alert('錯誤：書籍 ID 無效，請重新整理頁面後再試。');
            }

            const updatedData = {
                title: document.getElementById('editBookTitle').value.trim(),
                author: document.getElementById('editBookAuthor').value.trim(),
                price: Number(document.getElementById('editBookPrice').value),
                has_highlight: document.getElementById('editBookHasHighlight').checked,
                has_note: document.getElementById('editBookHasNote').checked
            };

            try {
                const res = await fetch(API_ENDPOINTS.bookById(id), {
                    method: 'PATCH',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(updatedData),
                });

                if (res.ok) {
                    alert('更新成功！');
                    document.getElementById('editModalOverlay').style.display = 'none';
                    loadBooks();
                } else {
                    const err = await res.json();
                    if (res.status === 404) {
                        alert("更新失敗：找不到書籍或書籍可能已售出/被刪除。");
                    } else {
                        throw new Error(`更新失敗： ${err.error || res.statusText}`);
                    }
                }
            } catch (err) {
                console.error('❌ 更新時發生錯誤:', err);
                alert(`更新時發生錯誤: ${err.message}`);
            }
        });
    }

    const myBooksListContainer = document.getElementById('myBooksList');
    if (myBooksListContainer) {
        myBooksListContainer.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('.delete-btn');
            if (deleteButton) {
                deleteBook(deleteButton.dataset.id);
                return;
            }
            const editButton = event.target.closest('.edit-btn');
            if (editButton) {
                openEditModal(editButton.dataset.id);
                return;
            }
        });
    }
}

async function main() {
    try {
        const liffIdString = await getLiffId();
        const liffUrl = await getWebUrl();

        await liff.init({liffId: liffIdString, withLoginOnExternalBrowser: false});

        if (liff.isLoggedIn()) {
            const isUserSynced = await initBookLiffApp();

            if (isUserSynced) {
                await loadBooks();
                bindAllEventListeners();
            } else {
                document.getElementById('btnAdd').disabled = true;
                console.error("使用者資料同步失敗，無法使用上架功能。");
            }
        } else {
            liff.login({redirectUri: `${liffUrl}/book`});
        }
    } catch (err) {
        console.error("❌ LIFF 初始化錯誤:", err);
        const container = document.getElementById("myBooksList");
        if (container) {
            container.innerText = "LIFF 初始化失敗。";
        }
    }
}

main();