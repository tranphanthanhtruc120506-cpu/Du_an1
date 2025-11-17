// ======================= API =======================
const productApi = "data/products.json";

// ======================= DOM =======================
const searchInput = document.getElementById("search-inp");
const searchButton = document.getElementById("button-addon2");
const productList = document.getElementById("product-list");

let cart = [];
let cartCount = 0;

// ======================= TÌM KIẾM =======================
if (searchButton && searchInput) {
    searchButton.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.setItem("searching", searchInput.value.trim());
        loadProducts();
    });
}

// ======================= LOAD SẢN PHẨM =======================
function loadProducts() {
    if (!productList) return;

    fetch(productApi)
        .then(res => res.json())
        .then(products => {
            let searchingData = localStorage.getItem("searching");

            let filtered = products;
            if (searchingData) {
                filtered = products.filter(p =>
                    p.name.toLowerCase().includes(searchingData.toLowerCase())
                );
            }

            renderProducts(filtered);

            localStorage.removeItem("searching");
        })
        .catch(err => console.error("Lỗi load dữ liệu:", err));
}

// ======================= RENDER SẢN PHẨM =======================
function renderProducts(products) {
    productList.innerHTML = "";

    if (products.length === 0) {
        productList.innerHTML = `
            <div class="text-center text-danger fw-bold">Không tìm thấy sản phẩm!</div>
        `;
        return;
    }

    products.forEach((item, index) => {
        productList.innerHTML += `
        <div class="col-sm-3 col-6">
            <div class="card h-auto position-relative p-2">

                <div class="badge bg-danger position-absolute top-0 start-0 m-2 p-2">
                    -${item.salePercent}%
                </div>

                <img src="${item.img}" class="card-img-top" style="height: 350px; object-fit: cover;">

                <div class="card-body text-center">
                    <h5 class="card-title" style="color: rgb(68, 12, 21);">${item.name}</h5>

                    <p class="text-danger fw-bold">
                        ${item.priceNew.toLocaleString()} VND 
                        <s class="text-muted">${item.priceOld.toLocaleString()} VND</s>
                    </p>

                    <button class="btn btn-danger w-100 mb-2 btn-add" data-index="${index}">
                        Đặt hàng
                    </button>
                    <button class="btn btn-warning w-100 btn-add-cart" data-index="${index}">
                        <i class='bx bx-cart'></i> Thêm vào giỏ
                    </button>
                </div>
            </div>
        </div>`;
    });

    attachProductEvents(products);
}

// ======================= GÁN SỰ KIỆN SAU KHI RENDER =======================
function attachProductEvents(products) {
    document.querySelectorAll(".btn-add").forEach(btn => {
        btn.addEventListener("click", () => {
            addToCart(products[btn.dataset.index], true);
        });
    });

    document.querySelectorAll(".btn-add-cart").forEach(btn => {
        btn.addEventListener("click", () => {
            addToCart(products[btn.dataset.index], false);
        });
    });
}

// ======================= GIỎ HÀNG =======================
function addToCart(product, openModal) {
    let exist = cart.find(item => item.name === product.name);

    if (exist) {
        exist.qty++;
    } else {
        cart.push({
            name: product.name,
            img: product.img,
            price: product.priceNew,
            qty: 1
        });
    }

    cartCount = cart.reduce((t, i) => t + i.qty, 0);
    document.getElementById("cart-count").innerText = cartCount;

    updateCartUI();

    if (openModal)
        new bootstrap.Modal(document.getElementById("cartModal")).show();
}

function updateCartUI() {
    const tbody = document.getElementById("cart-items");
    let total = 0;
    tbody.innerHTML = "";

    cart.forEach((item, i) => {
        total += item.price * item.qty;

        tbody.innerHTML += `
        <tr>
            <td><img src="${item.img}" width="50"></td>
            <td>${item.name}</td>
            <td>${item.price.toLocaleString()}</td>
            <td>${item.qty}</td>
            <td><button class="btn btn-danger btn-sm" onclick="removeItem(${i})">X</button></td>
        </tr>`;
    });

    document.getElementById("cart-total").innerText = total.toLocaleString();
}

function removeItem(i) {
    cart.splice(i, 1);
    cartCount = cart.reduce((t, i) => t + i.qty, 0);
    document.getElementById("cart-count").innerText = cartCount;

    updateCartUI();
}

// ======================= ĐẶT HÀNG =======================
document.getElementById("checkoutBtn").addEventListener("click", () => {
    new bootstrap.Modal(document.getElementById("checkoutModal")).show();
});

document.getElementById("confirmOrderBtn").addEventListener("click", () => {
    if (!cusName.value || !cusPhone.value || !cusAddress.value) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    cart = [];
    cartCount = 0;
    document.getElementById("cart-count").innerText = 0;
    updateCartUI();

    // đóng modal cũ
    document.querySelectorAll('.modal.show').forEach(m => bootstrap.Modal.getInstance(m).hide());
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

    // mở modal hoàn tất
    new bootstrap.Modal(document.getElementById("doneModal")).show();
});

// Load sản phẩm lần đầu
loadProducts();

if (openModal)
    new bootstrap.Modal(document.getElementById("cartModal")).show();
function addToCart(product, openModal) {
    let exist = cart.find(item => item.name === product.name);
    if (exist) {
        exist.qty++;
    } else {
        cart.push({
            name: product.name,
            img: product.img,
            price: product.priceNew,
            qty: 1
        });
    }
    cartCount = cart.reduce((t, i) => t + i.qty, 0);
    document.getElementById("cart-count").innerText = cartCount;
    updateCartUI();
    const toastEl = document.getElementById("toastAddCart");
    const toast = new bootstrap.Toast(toastEl, { delay: 2000 }); // 2 giây tự biến mất
    toast.show();
    if (openModal)
        new bootstrap.Modal(document.getElementById("cartModal")).show();
}


