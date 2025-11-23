import {getLiffId, API_ENDPOINTS} from "./config.js";

// 假資料 (備用)
const SAMPLE_BOOKS = [
    {
        _id: "sample_1",
        image_url: "static/images/default_book.png",
        title: "範例書 A",
        author: "作者 A",
        price: 100,
        seller_id: "other",
        description: "範例描述...",
        has_highlight: true, // 測試用
        has_note: false
    },
    {
        _id: "sample_2",
        image_url: "static/images/default_book.png",
        title: "範例書 B",
        author: "作者 B",
        price: 200,
        seller_id: "other",
        description: "範例描述...",
        has_highlight: false,
        has_note: true
    }
];

let allBooks = [];
let currentUserId = null;
let cartBookIds = new Set();


window.addToCart = async function (bookId, btnElement) {
    if (!bookId) return alert("錯誤：無法識別書籍 ID");

    if (cartBookIds.has(bookId)) return;

    try {
        const response = await fetch(API_ENDPOINTS.addToCart, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({bookId: bookId})
        });

        if (response.ok) {
            alert("已加入購物車！ 🛒");

            cartBookIds.add(bookId);

            if (btnElement) {
                updateButtonState(btnElement, "已在購物車");
            }

            const modalBtn = document.getElementById("modalAddToCartBtn");
            if (modalBtn) {
                updateButtonState(modalBtn, "已在購物車");
            }

        } else {
            if (response.status === 401) {
                alert("您尚未登入，無法加入購物車。");
            } else {
                const errData = await response.json();
                alert(`加入失敗：${errData.detail || "未知錯誤"}`);
            }
        }
    } catch (err) {
        console.error("加入購物車錯誤:", err);
        alert("網路錯誤，無法加入購物車。");
    }
};

function updateButtonState(btn, text) {
    btn.innerText = text;
    btn.className = "btn-add disabled";
    btn.disabled = true;
    btn.style.backgroundColor = "#ccc";
    btn.style.cursor = "not-allowed";
    btn.onclick = null;
}

function showBookModal(book) {
    const modal = document.getElementById("bookModal");
    if (!modal || !book) return;

    // 1. 圖片處理
    const images = [
        {src: book.image_front_url || book.image_url, label: '封面'},
        {src: book.image_spine_url, label: '書背'},
        {src: book.image_back_url, label: '封底'}
    ].filter(img => img.src);

    if (images.length === 0) {
        images.push({src: 'static/images/default_book.png', label: '封面'});
    }

    let currentIndex = 0;

    let galleryWrapper = document.getElementById("modalGalleryWrapper");
    if (!galleryWrapper) {
        galleryWrapper = document.createElement("div");
        galleryWrapper.id = "modalGalleryWrapper";
        galleryWrapper.className = "modal-gallery-wrapper";

        const existingImg = document.getElementById("modalImg");
        // 確保 existingImg 存在才插入
        if (existingImg) {
            existingImg.parentNode.insertBefore(galleryWrapper, existingImg);
            galleryWrapper.appendChild(existingImg);
        }
    }

    const mainImg = document.getElementById("modalImg");
    if (mainImg) mainImg.src = images[0].src;

    // 清除舊箭頭
    const oldPrev = galleryWrapper.querySelector('.nav-btn.prev');
    const oldNext = galleryWrapper.querySelector('.nav-btn.next');
    if (oldPrev) oldPrev.remove();
    if (oldNext) oldNext.remove();

    // 只有多張圖才顯示箭頭
    if (images.length > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.className = "nav-btn prev";
        prevBtn.innerHTML = "&#10094;";
        prevBtn.onclick = () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateMainImage(currentIndex);
        };

        const nextBtn = document.createElement("button");
        nextBtn.className = "nav-btn next";
        nextBtn.innerHTML = "&#10095;";
        nextBtn.onclick = () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateMainImage(currentIndex);
        };

        galleryWrapper.appendChild(prevBtn);
        galleryWrapper.appendChild(nextBtn);
    }

    // 縮圖處理
    let thumbContainer = document.getElementById("modalThumbnails");
    if (!thumbContainer) {
        thumbContainer = document.createElement("div");
        thumbContainer.id = "modalThumbnails";
        thumbContainer.className = "modal-thumbnails";
        // 插入在 galleryWrapper 之後
        galleryWrapper.parentNode.insertBefore(thumbContainer, galleryWrapper.nextSibling);
    }
    thumbContainer.innerHTML = "";

    if (images.length > 1) {
        images.forEach((img, index) => {
            const thumb = document.createElement("img");
            thumb.src = img.src;
            thumb.className = "thumb-img";
            if (index === 0) thumb.classList.add("active");

            thumb.onclick = () => {
                currentIndex = index;
                updateMainImage(currentIndex);
            };
            thumbContainer.appendChild(thumb);
        });
        thumbContainer.style.display = "flex";
    } else {
        thumbContainer.style.display = "none";
    }

    function updateMainImage(idx) {
        mainImg.src = images[idx].src;
        const thumbs = thumbContainer.querySelectorAll(".thumb-img");
        thumbs.forEach(t => t.classList.remove("active"));
        if (thumbs[idx]) thumbs[idx].classList.add("active");
    }

    // 2. 文字資訊填充
    document.getElementById("modalTitle").innerText = book.title;
    document.getElementById("modalAuthor").innerText = `作者：${book.author}`;
    document.getElementById("modalPrice").innerText = `價格：NT$ ${book.price}`;

    // [ ⬇️ ⬇️ ⬇️ 新增：顯示書況標籤 (螢光/筆記) ⬇️ ⬇️ ⬇️ ]
    // 檢查是否已有標籤容器，沒有就建立
    let tagsContainer = document.getElementById("modalTags");
    if (!tagsContainer) {
        tagsContainer = document.createElement("div");
        tagsContainer.id = "modalTags";
        tagsContainer.style.display = "flex";
        tagsContainer.style.justifyContent = "center";
        tagsContainer.style.gap = "8px";
        tagsContainer.style.marginTop = "8px";
        tagsContainer.style.marginBottom = "8px";

        // 插入在價格 (modalPrice) 之後
        const priceEl = document.getElementById("modalPrice");
        if (priceEl) {
            priceEl.parentNode.insertBefore(tagsContainer, priceEl.nextSibling);
        }
    }
    tagsContainer.innerHTML = ""; // 清空舊標籤

    if (book.has_highlight) {
        const tag = document.createElement("span");
        tag.innerText = "🖍 有螢光/劃線";
        // 樣式：淺黃底深黃字
        tag.style.backgroundColor = "#fff3cd";
        tag.style.color = "#856404";
        tag.style.padding = "4px 8px";
        tag.style.borderRadius = "4px";
        tag.style.fontSize = "0.85rem";
        tag.style.fontWeight = "bold";
        tagsContainer.appendChild(tag);
    }

    if (book.has_note) {
        const tag = document.createElement("span");
        tag.innerText = "✏️ 有書寫筆記";
        // 樣式：淺灰底深灰字
        tag.style.backgroundColor = "#e2e3e5";
        tag.style.color = "#383d41";
        tag.style.padding = "4px 8px";
        tag.style.borderRadius = "4px";
        tag.style.fontSize = "0.85rem";
        tag.style.fontWeight = "bold";
        tagsContainer.appendChild(tag);
    }
    // [ ⬆️ ⬆️ ⬆️ 新增完畢 ⬆️ ⬆️ ⬆️ ]

    const desc = book.description || `書況：${book.condition || '良好'}`;
    document.getElementById("modalDescription").innerText = desc;

    // 3. 按鈕處理
    const oldBtn = document.getElementById("modalAddToCartBtn");
    if (oldBtn) oldBtn.remove();

    const addToCartBtn = document.createElement("button");
    addToCartBtn.id = "modalAddToCartBtn";

    if (currentUserId && book.seller_id === currentUserId) {
        updateButtonState(addToCartBtn, "您的書籍");
    } else if (cartBookIds.has(book._id)) {
        updateButtonState(addToCartBtn, "已在購物車");
    } else {
        addToCartBtn.className = "btn-add";
        addToCartBtn.innerText = "加入購物車";
        addToCartBtn.onclick = () => {
            window.addToCart(book._id, addToCartBtn);
        };
    }

    modal.querySelector(".modal-content").appendChild(addToCartBtn);
    modal.style.display = "flex";
}

function closeBookModal() {
    const modal = document.getElementById("bookModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function initModalHandlers() {
    const closeBtn = document.getElementById("modalClose");
    if (closeBtn) closeBtn.onclick = closeBookModal;

    const modal = document.getElementById("bookModal");
    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) closeBookModal();
        };
    }
}

async function fetchCartBookIds() {
    try {
        const res = await fetch(API_ENDPOINTS.myCart);
        if (res.ok) {
            const data = await res.json();
            const items = data.items || [];
            cartBookIds = new Set(items.map(item => item.book_id));
        }
    } catch (err) {
        console.warn("無法取得購物車狀態:", err);
    }
}

function hideWelcomeAfterTimeout() {
    const el = document.getElementById('welcomeOverlay');
    if (!el) return;
    setTimeout(() => {
        el.style.display = 'none';
    }, 3000);
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
    } catch (err) {
        console.error("❌ 用戶資料同步失敗:", err);
    }
}

async function initIndexLiffApp() {
    try {
        const profile = await liff.getProfile();
        currentUserId = profile.userId;

        document.getElementById("user-picture").src = profile.pictureUrl;
        document.getElementById("user-name").innerText = profile.displayName;
        document.getElementById("user-id").innerText = profile.userId;

        await syncUserProfile(profile);

        const loadingScreen = document.getElementById("loading-screen");
        if (loadingScreen) loadingScreen.style.display = "none";
        const mainContent = document.getElementById("main-content");
        if (mainContent) mainContent.style.display = "block";

        hideWelcomeAfterTimeout();

        initModalHandlers();

        await fetchCartBookIds();
        await loadIndexBooks();

        const searchBtn = document.getElementById("searchBtn");
        const searchInput = document.getElementById("searchInput");
        if (searchBtn && searchInput) {
            searchBtn.addEventListener("click", () => renderIndexBooks(searchInput.value));
            searchInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") renderIndexBooks(searchInput.value);
            });
        }
    } catch (error) {
        console.error("❌ 初始化錯誤:", error);
    }
}

async function loadIndexBooks() {
    try {
        const response = await fetch(API_ENDPOINTS.books);
        if (!response.ok) throw new Error(response.status);
        allBooks = await response.json();
        renderIndexBooks();
    } catch (err) {
        console.error("❌ 無法載入書籍資料：", err);
        allBooks = SAMPLE_BOOKS;
        renderIndexBooks();
    }
}

function renderIndexBooks(filter = "") {
    const container = document.getElementById("bookList");
    if (!container) return;

    container.innerHTML = "";
    const q = filter.trim().toLowerCase();

    const books = allBooks.filter(b => {
        if (!q) return true;
        return (b.title || '').toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q);
    });

    if (!books.length) {
        container.innerHTML = "<p>找不到符合的書籍。</p>";
        return;
    }

    books.forEach(b => {
        const el = document.createElement("div");
        el.className = "book";
        el.style.cursor = "pointer";

        let buttonHtml = "";
        let isBtnDisabled = false;

        if (currentUserId && b.seller_id === currentUserId) {
            buttonHtml = `<button class="btn-add disabled" disabled style="background-color:#ccc; cursor:not-allowed;">您的書籍</button>`;
            isBtnDisabled = true;
        } else if (cartBookIds.has(b._id)) {
            buttonHtml = `<button class="btn-add disabled" disabled style="background-color:#ccc; cursor:not-allowed;">已在購物車</button>`;
            isBtnDisabled = true;
        } else {
            buttonHtml = `<button class="btn-add btn-add-action">加入購物車</button>`;
        }

        el.innerHTML = `
            <img src="${b.image_url || 'static/images/default_book.png'}" alt="${b.title} 封面" />
            <h4>${b.title}</h4>
            <p><small>作者：${b.author}</small></p>
            <div class="row">
                <div>NT$ ${b.price}</div>
                <div>${buttonHtml}</div>
            </div>
        `;

        el.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-add-action')) {
                window.addToCart(b._id, event.target);
                return;
            }
            if (event.target.classList.contains('disabled')) {
                return;
            }

            showBookModal(b);
        });

        container.appendChild(el);
    });
}

async function main() {
    try {
        const liffIdString = await getLiffId();
        await liff.init({liffId: liffIdString, withLoginOnExternalBrowser: false});

        if (liff.isLoggedIn()) {
            await initIndexLiffApp();
        } else {
            liff.login();
        }
    } catch (error) {
        console.error("LIFF Init Error", error);
    }
}

main();