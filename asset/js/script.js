// ===== API local (file JSON) =====
const productApi = "data/products.json";

// ===== DOM =====
const searchInput = document.getElementById("search-inp");
const searchButton = document.getElementById("button-addon2");
const productList = document.getElementById("product-list");

// ===== CLICK TÌM KIẾM =====
if (searchButton) {
    searchButton.addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.setItem("searching", searchInput.value);
        location.reload();
    });
}

// ===== HÀM LOAD SẢN PHẨM =====
function loadProducts() {
    fetch(productApi)
        .then(res => res.json())
        .then(products => {
            let searchingData = localStorage.getItem("searching");

            let filteredProducts = products;

            if (searchingData && searchingData.trim() !== "") {
                filteredProducts = products.filter(product =>
                    product.name.toLowerCase().includes(searchingData.toLowerCase())
                );
            }

            renderProducts(filteredProducts);
            localStorage.removeItem("searching");
        });
}

// ===== HÀM RENDER SẢN PHẨM =====
function renderProducts(products) {
    productList.innerHTML = "";

    products.forEach(item => {
        productList.innerHTML += `
        <div class="col-sm-3 col-6">
            <div class="card h-auto position-relative p-2">

                <div class="badge bg-danger position-absolute top-0 start-0 m-2 p-2">
                    -${item.salePercent}%
                </div>

                <img src="${item.img}" class="card-img-top" style="height: 320px; object-fit: cover;">

                <div class="card-body text-center">
                    <h5 class="card-title" style="color: rgb(68, 12, 21);">${item.name}</h5>

                    <p class="text-danger fw-bold">
                        ${item.priceNew} VND <s class="text-muted">${item.priceOld} VND</s>
                    </p>

                    <button class="btn btn-outline-danger w-100">Đặt hàng</button>
                </div>
            </div>
        </div>`;
    });
}

loadProducts();
