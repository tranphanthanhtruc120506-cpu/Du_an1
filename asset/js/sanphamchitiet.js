// asset/js/sanphamchitiet.js
console.log("File JS chi tiết sản phẩm đã chạy!");

// 1. Lấy ID sản phẩm từ URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
console.log("ID Sản phẩm:", id);

let currentProduct = null;
let allProductsData = [];
// Lấy giỏ hàng từ localStorage
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// Cập nhật icon giỏ hàng ngay khi vào trang
updateCartCount();
updateCartModalUI(); // đảm bảo modal hiển thị nếu người dùng mở luôn

// 2. Load Dữ Liệu
async function loadProduct() {
    if (!id) return; // Không có ID thì thôi

    // Lấy dữ liệu từ LocalStorage
    let storedProducts = JSON.parse(localStorage.getItem("products"));

    // Nếu chưa có, tải mới
    if (!storedProducts || storedProducts.length === 0) {
        console.log("Chưa có dữ liệu, đang tải từ JSON...");
        await fetchAndSaveData();
        storedProducts = JSON.parse(localStorage.getItem("products"));
    }

    allProductsData = storedProducts || [];
    
    // Tìm sản phẩm
    currentProduct = allProductsData.find(p => p.id == id);

    if (!currentProduct) {
        console.log("Không tìm thấy sản phẩm, thử tải lại dữ liệu gốc...");
        await fetchAndSaveData(); 
        allProductsData = JSON.parse(localStorage.getItem("products")); 
        currentProduct = allProductsData.find(p => p.id == id); 
    }

    if (currentProduct) {
        console.log("Đã tìm thấy sản phẩm:", currentProduct.name);
        renderProductInfo(currentProduct);
        renderThumbnails(currentProduct);
        renderRelatedProducts(currentProduct);
        loadReviews();
        bindProductButtons(); // GẮN SỰ KIỆN CHO NÚT SAU KHI RENDER
    } else {
        console.error("Vẫn không tìm thấy sản phẩm ID:", id);
        const nameEl = document.getElementById("product-name");
        if(nameEl) nameEl.innerText = "Sản phẩm không tồn tại!";
    }
}

async function fetchAndSaveData() {
    try {
        const apiList = ["data/products.json", "data/chude2.json", "data/hoatuoi2.json", "data/kieudang2.json"];
        const responses = await Promise.all(apiList.map(url => fetch(url).then(res => res.json())));
        let newData = [];
        responses.forEach(data => {
            if (Array.isArray(data)) newData = newData.concat(data);
            else if (data.products) newData = newData.concat(data.products);
        });
        localStorage.setItem("products", JSON.stringify(newData));
    } catch (error) {
        console.error("Lỗi tải file data:", error);
    }
}

// 3. Hiển thị Thông tin
function renderProductInfo(product) {
    document.title = product.name + " - Spark Flower";
    const nameEl = document.getElementById("product-name");
    if(nameEl) nameEl.innerText = product.name;

    const idEl = document.getElementById("product-id") || document.getElementById("p-id");
    if(idEl) idEl.innerText = product.id || "";

    const priceNew = parseInt(product.priceNew || product.price || 0) || 0;
    const priceOld = parseInt(product.priceOld || 0) || 0;
    const priceNewEl = document.getElementById("product-price-new");
    if (priceNewEl) priceNewEl.innerText = priceNew.toLocaleString() + " VNĐ";
    
    const oldPriceEl = document.getElementById("product-price-old");
    if (oldPriceEl) {
        if (priceOld > priceNew) {
            oldPriceEl.innerText = priceOld.toLocaleString() + " VNĐ";
            oldPriceEl.parentElement.style.display = "block";
        } else {
            // ẩn nếu không có giá cũ
            oldPriceEl.parentElement.style.display = "none";
        }
    }

    // Xử lý img: nếu có ảnh lưu trong localStorage dùng ảnh đó, ngược lại dùng product.img
    let imgSrc = product.img || '';
    try {
        if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http')) {
            const storedImg = localStorage.getItem("img_" + product.img);
            if (storedImg) imgSrc = storedImg;
        }
    } catch (e) { /* ignore */ }
    
    const imgEl = document.getElementById("product-img");
    if(imgEl) {
        if (imgSrc) imgEl.src = imgSrc;
        imgEl.onerror = function() { this.src = 'asset/hinhanh/logo2 (2).png'; };
    }

    const descElement = document.getElementById("product-desc");
    if(descElement) {
        descElement.style.maxHeight = "400px"; 
        descElement.style.overflowY = "auto";
        descElement.style.paddingRight = "10px";
        let content = product.description;
        if (!content) {
            content = `<div class="product-detail-content"><p class="text-muted"><strong>${product.name}</strong>...</p></div>`;
        }
        descElement.innerHTML = content;
    }
}

// 4. Xử lý Giỏ Hàng
window.addCurrentToCart = function() {
    console.log("Đang thêm vào giỏ...");
    if (!currentProduct) { alert("Đang tải dữ liệu..."); return; }
    
    const qtyInput = document.getElementById("qty");
    let qty = 1;
    if (qtyInput) {
        qty = parseInt(qtyInput.value) || 1;
        if (qty < 1) qty = 1;
    }
    
    cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Lấy ảnh hiện đang hiển thị (đã xử lý src)
    let imgToStore = document.getElementById("product-img")?.src || currentProduct.img || '';

    // nếu đã có sản phẩm (so sánh id ưu tiên hơn name)
    const exist = cart.find(i => i.id == currentProduct.id || i.name === currentProduct.name);
    if (exist) {
        exist.qty = (parseInt(exist.qty) || 0) + qty;
    } else {
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            img: imgToStore,
            price: parseInt(currentProduct.priceNew || currentProduct.price || 0) || 0,
            qty: qty
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Đã lưu giỏ hàng:", cart);

    updateCartCount();
    updateCartModalUI();

    const toastEl = document.getElementById("toastAddCart");
    if (toastEl && typeof bootstrap !== 'undefined') {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    } else {
        alert("✅ Đã thêm vào giỏ hàng!");
    }
}

window.buyNow = function() {
    // Thêm vào giỏ trước
    window.addCurrentToCart();
    // Mở modal giỏ hàng
    const modalEl = document.getElementById('cartModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } else {
        // Nếu không có bootstrap, điều hướng tới trang giỏ hàng hoặc thông báo
        alert("Đã thêm vào giỏ! Vui lòng kiểm tra giỏ hàng.");
    }
}

window.changeQty = function(amount) {
    const input = document.getElementById("qty");
    if(input) {
        let val = parseInt(input.value) || 1;
        val = val + amount;
        if (val < 1) val = 1;
        input.value = val;
    }
}

function updateCartCount() {
    const el = document.getElementById("cart-count");
    if(el) {
        const c = JSON.parse(localStorage.getItem("cart") || "[]");
        el.innerText = c.reduce((t, i) => t + (parseInt(i.qty) || 0), 0);
    }
}

function updateCartModalUI() {
    const tbody = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    if (!tbody || !totalEl) return;

    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
    tbody.innerHTML = "";
    let total = 0;

    if(currentCart.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' class='text-center'>Giỏ hàng trống</td></tr>";
    } else {
        currentCart.forEach((item, i) => {
            let imgSrc = item.img || '';
            if (!imgSrc.startsWith('data:') && imgSrc && !imgSrc.startsWith('http')) {
                 const sImg = localStorage.getItem("img_" + item.img);
                 if(sImg) imgSrc = sImg;
            }
            total += (parseInt(item.price) || 0) * (parseInt(item.qty) || 0);
            tbody.innerHTML += `
                <tr>
                    <td><img src="${imgSrc}" width="40" style="border-radius:4px" onerror="this.src='asset/hinhanh/logo2 (2).png'"></td>
                    <td>${item.name}</td>
                    <td>${(parseInt(item.price)||0).toLocaleString()}</td>
                    <td>${parseInt(item.qty)||0}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="removeItemFromCart(${i})"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
        });
    }
    totalEl.innerText = total.toLocaleString() + " VNĐ";
}

window.removeItemFromCart = function(index) {
    let c = JSON.parse(localStorage.getItem("cart") || "[]");
    c.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(c));
    updateCartCount();
    updateCartModalUI();
}

// 5. Thanh toán
document.getElementById("checkoutBtn")?.addEventListener("click", () => {
    const cm = bootstrap.Modal.getInstance(document.getElementById("cartModal"));
    if(cm) cm.hide();
    new bootstrap.Modal(document.getElementById("checkoutModal")).show();
});

document.getElementById("confirmOrderBtn")?.addEventListener("click", () => {
    const name = document.getElementById("cusName").value.trim();
    const phone = document.getElementById("cusPhone").value.trim();
    const address = document.getElementById("cusAddress").value.trim();
    const payment = document.getElementById("paymentMethod").value;

    if (!name || !phone || !address) { alert("Vui lòng nhập đủ thông tin!"); return; }

    const c = JSON.parse(localStorage.getItem("cart") || "[]");
    if (c.length === 0) { alert("Giỏ hàng trống!"); return; }

    const newOrder = {
        id: "DH" + Date.now(),
        customer: { name, phone, address, payment },
        items: c,
        total: c.reduce((t, i) => t + (parseInt(i.price)||0) * (parseInt(i.qty)||0), 0),
        date: new Date().toLocaleString(),
        status: "Chờ xử lý"
    };

    let orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.unshift(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    localStorage.removeItem("cart");
    updateCartCount();
    updateCartModalUI();

    const cm = bootstrap.Modal.getInstance(document.getElementById("checkoutModal"));
    if(cm) cm.hide();
    new bootstrap.Modal(document.getElementById("doneModal")).show();
    setTimeout(() => { window.location.href = "index.html"; }, 2000);
});

const cartModalEl = document.getElementById('cartModal');
if (cartModalEl) cartModalEl.addEventListener('show.bs.modal', updateCartModalUI);

// 6. Ảnh & Liên quan
function renderThumbnails(product) {
    const imgContainer = document.querySelector(".product-image-container");
    if (!imgContainer) return;
    const old = document.getElementById("thumb-list"); if(old) old.remove();
    const list = document.createElement("div"); list.id="thumb-list";
    list.style.cssText = "display:flex; gap:10px; margin-top:10px; justify-content:center;"; 
    imgContainer.parentNode.appendChild(list);

    let mainImg = product.img;
    if (!mainImg.startsWith('data:')) { const s = localStorage.getItem("img_" + product.img); if(s) mainImg = s; }
    const imgs = [mainImg, mainImg, mainImg, mainImg];

    list.innerHTML = imgs.map((src, i) => `
        <div class="thumb-item" onclick="changeMainImage('${src}', this)" 
             style="width:70px; height:70px; border:2px solid ${i===0?'#d3213f':'#eee'}; border-radius:5px; cursor:pointer; overflow:hidden;">
            <img src="${src}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='asset/hinhanh/logo2 (2).png'">
        </div>
    `).join("");
}

window.changeMainImage = function(src, el) {
    document.getElementById("product-img").src = src;
    document.querySelectorAll(".thumb-item").forEach(d => d.style.borderColor = "#eee");
    el.style.borderColor = "#d3213f";
}

function renderRelatedProducts(product) {
    const con = document.getElementById("related-products");
    if(!con) return;
    const related = allProductsData.filter(p => p.category === product.category && p.id != product.id).slice(0, 4);
    if(related.length === 0) { con.innerHTML = "<p class='text-center text-muted w-100'>Không có sản phẩm liên quan.</p>"; return; }

    con.innerHTML = related.map(p => {
        let img = p.img;
        if(!img.startsWith('data:')) { const s = localStorage.getItem("img_" + p.img); if(s) img = s; }
        const price = parseInt(p.priceNew||p.price).toLocaleString();
        return `
        <div class="col-6 col-md-3">
            <div class="card h-100 border-0 shadow-sm">
                <a href="sanphamchitiet.html?id=${p.id}"><img src="${img}" class="card-img-top" style="height:180px; object-fit:cover;" onerror="this.src='asset/hinhanh/logo2 (2).png'"></a>
                <div class="card-body text-center p-2">
                    <h6 class="card-title mb-1" style="font-size:0.9rem"><a href="sanphamchitiet.html?id=${p.id}" class="text-decoration-none text-dark">${p.name}</a></h6>
                    <p class="text-danger fw-bold mb-0">${price} VNĐ</p>
                </div>
            </div>
        </div>`;
    }).join("");
}

function loadReviews() {}

// ------------ NEW: Gắn sự kiện cho nút Thêm & Mua --------------
function findButtonByText(text) {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.find(b => b.textContent && b.textContent.replace(/\s+/g,' ').toLowerCase().includes(text.toLowerCase()));
}

function bindProductButtons() {
    // tìm nút Mua Ngay (nội dung chứa "Mua Ngay")
    const buyBtn = findButtonByText("Mua Ngay") || document.querySelector(".btn-danger");
    if (buyBtn) {
        // tránh gán nhiều lần
        buyBtn.removeEventListener?.("click", buyNow);
        buyBtn.addEventListener("click", buyNow);
    }

    // tìm nút Thêm vào giỏ (nội dung chứa "Thêm vào giỏ")
    const addBtn = findButtonByText("Thêm vào giỏ") || document.querySelector(".btn-warning");
    if (addBtn) {
        addBtn.removeEventListener?.("click", addCurrentToCart);
        addBtn.addEventListener("click", addCurrentToCart);
    }
}

// Gọi loadProduct sau DOM ready
document.addEventListener("DOMContentLoaded", loadProduct);

        
