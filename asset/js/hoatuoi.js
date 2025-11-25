// ======================= 1. CẤU HÌNH DỮ LIỆU TOÀN CỤC =======================
const allDataFiles = [
  "data/products.json",
  "data/chude2.json",
  "data/hoatuoi2.json",
  "data/kieudang2.json",
];

let allProducts = [];
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// Cập nhật số lượng giỏ hàng
document.getElementById("cart-count").innerText =
  cart.reduce((t, i) => t + i.qty, 0) || 0;

// ======================= XỬ LÝ TÌM KIẾM & LOAD DATA =======================
document.getElementById("button-addon2")?.addEventListener("click", (e) => {
  e.preventDefault();
  const query = document.getElementById("search-inp").value.trim();
  localStorage.setItem("searchQuery", query);
  loadGlobalData();
});

document.getElementById("search-inp")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("button-addon2")?.click();
  }
});

function loadGlobalData() {
  // BƯỚC QUAN TRỌNG: Kiểm tra LocalStorage trước
  const storedData = localStorage.getItem("products");

  if (storedData) {
    // Nếu có dữ liệu (Admin đã tác động), dùng nó ngay
    allProducts = JSON.parse(storedData).filter((p) => p.status === "Enabled");
    processDisplay();
  } else {
    // Nếu chưa có (Lần đầu vào), tải từ 4 file JSON gộp lại
    Promise.all(allDataFiles.map((url) => fetch(url).then((res) => res.json())))
      .then((results) => {
        allProducts = [];
        results.forEach((data) => {
          if (Array.isArray(data)) allProducts = allProducts.concat(data);
          else if (data.products)
            allProducts = allProducts.concat(data.products);
        });

        // Lưu vào LocalStorage để đồng bộ với Admin
        localStorage.setItem("products", JSON.stringify(allProducts));
        processDisplay();
      })
      .catch((err) => console.error("Lỗi tải dữ liệu:", err));
  }
}

function processDisplay() {
  const query = (localStorage.getItem("searchQuery") || "")
    .toLowerCase()
    .trim();
  localStorage.removeItem("searchQuery");

  const container = document.getElementById("products-container");
  if (!container) return;
  container.innerHTML = "";

  if (query) {
    // Tìm kiếm trên toàn bộ dữ liệu
    const result = allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.flower?.toLowerCase().includes(query)
    );
    renderSearchResults(query, result);
  } else {
    renderCategories(); // Hiển thị trang chủ
  }
}

// ======================= RIÊNG CHO TRANG HOA TƯƠI =======================
function renderCategories() {
  const container = document.getElementById("products-container");

  const targetCategories = [
    { key: ["hoahong", "hoa hồng"], title: "--- HOA HỒNG ---" },
    {
      key: ["hoahuongduong", "hoa hướng dương"],
      title: "--- HOA HƯỚNG DƯƠNG ---",
    },
    { key: ["hoababy", "hoa baby"], title: "--- HOA BABY ---" },
    { key: ["hoalan", "lan hồ điệp"], title: "--- LAN HỒ ĐIỆP ---" },
  ];

  targetCategories.forEach((group) => {
    const products = allProducts.filter(
      (p) =>
        p.category &&
        group.key.some((k) => p.category.toLowerCase().includes(k))
    );

    if (products.length === 0) return;

    container.insertAdjacentHTML(
      "beforeend",
      `
        <div class="text-center my-5"><h2 class="display-5 fw-bold" style="color:#8b0015;">${
          group.title
        }</h2></div>
        <div class="row g-4 justify-content-center mb-5">
            ${products.map((item) => cardHTML(item)).join("")}
        </div>
        <hr class="my-5" style="border-top:3px solid #f8c6d5;">
      `
    );
  });

  attachEvents();
}

// ======================= CÁC HÀM CHUNG (Card, Cart, Checkout) =======================
function cardHTML(item) {
  let imgSrc = item.img;
  const storedImg = localStorage.getItem("img_" + item.img);
  if (storedImg) imgSrc = storedImg;

  return `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="card h-100 position-relative border-0 shadow-sm overflow-hidden rounded-3">
        ${
          item.salePercent > 0
            ? `<div class="badge bg-danger position-absolute top-0 start-0 m-3 px-3 py-2 fw-bold" style="border-radius:50px;z-index:10;">-${item.salePercent}%</div>`
            : ""
        }
        <a href="sanphamchitiet.html?id=${item.id}">
          <img src="${imgSrc}" class="card-img-top" style="height:320px;object-fit:cover;cursor:pointer;" onerror="this.src='asset/notfound.jpg'">
        </a>
        <div class="card-body text-center d-flex flex-column">
          <a href="sanphamchitiet.html?id=${
            item.id
          }" class="text-decoration-none">
            <h5 class="card-title mb-2" style="color:#5D001E;cursor:pointer;">${
              item.name
            }</h5>
          </a>
          <p class="text-danger fw-bold fs-5 mb-1">
            ${parseInt(item.priceNew || item.price).toLocaleString()} VNĐ
            ${
              item.priceOld && item.priceOld > (item.priceNew || item.price)
                ? `<s class="text-muted fs-6">${parseInt(
                    item.priceOld
                  ).toLocaleString()} VNĐ</s>`
                : ""
            }
          </p>
          <button class="btn btn-danger mt-auto mb-2 btn-buy" data-id="${
            item.id
          }">Đặt hàng</button>
          <button class="btn btn-warning btn-add-cart" data-id="${
            item.id
          }">Thêm vào giỏ</button>
        </div>
      </div>
    </div>`;
}

function renderSearchResults(query, products) {
  const container = document.getElementById("products-container");
  container.innerHTML = `<div class="text-center my-5"><h2 class="display-5 fw-bold" style="color:#8b0015;">Kết quả: "${query}"</h2><p class="text-muted">Tìm thấy <strong>${products.length}</strong> sản phẩm</p></div>`;
  if (products.length === 0) {
    container.insertAdjacentHTML(
      "beforeend",
      `<h4 class="text-center text-danger">Không tìm thấy!</h4>`
    );
    return;
  }
  container.insertAdjacentHTML(
    "beforeend",
    `<div class="row g-4 justify-content-center mb-5">${products
      .map((item) => cardHTML(item))
      .join("")}</div>`
  );
  attachEvents();
}

function attachEvents() {
  document.querySelectorAll(".btn-buy, .btn-add-cart").forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      const id = parseInt(btn.dataset.id);
      const product = allProducts.find((p) => p.id == id);
      if (product) addToCart(product, btn.classList.contains("btn-buy"));
    };
  });
}

function addToCart(product, openModal = false) {
  const exist = cart.find((i) => i.name === product.name);
  if (exist) exist.qty++;
  else
    cart.push({
      name: product.name,
      img: product.img,
      price: parseInt(product.priceNew || product.price),
      qty: 1,
    });
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cart-count").innerText = cart.reduce(
    (t, i) => t + i.qty,
    0
  );
  updateCartUI();
  if (!openModal)
    new bootstrap.Toast(document.getElementById("toastAddCart")).show();
  else new bootstrap.Modal(document.getElementById("cartModal")).show();
}

function updateCartUI() {
  const tbody = document.getElementById("cart-items");
  if (!tbody) return;
  tbody.innerHTML = "";
  let total = 0;
  cart.forEach((item, i) => {
    let imgSrc = item.img;
    const storedImg = localStorage.getItem("img_" + item.img);
    if (storedImg) imgSrc = storedImg;
    total += item.price * item.qty;
    tbody.innerHTML += `
      <tr>
        <td><img src="${imgSrc}" width="50" class="rounded" onerror="this.src='asset/notfound.jpg'"></td>
        <td class="align-middle">${item.name}</td>
        <td class="align-middle">${item.price.toLocaleString()} VNĐ</td>
        <td class="align-middle"><input type="number" min="1" value="${
          item.qty
        }" class="form-control form-control-sm qty" data-index="${i}" style="width:70px;"></td>
        <td class="align-middle"><button class="btn btn-danger btn-sm" onclick="removeFromCart(${i})">Xóa</button></td>
      </tr>`;
  });
  document.getElementById("cart-total").innerText =
    total.toLocaleString() + " VNĐ";
  document.querySelectorAll(".qty").forEach((input) => {
    input.onchange = () => {
      let qty = parseInt(input.value) || 1;
      if (qty < 1) qty = 1;
      cart[input.dataset.index].qty = qty;
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartUI();
    };
  });
}

function removeFromCart(i) {
  cart.splice(i, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cart-count").innerText = cart.reduce(
    (t, i) => t + i.qty,
    0
  );
  updateCartUI();
}

document.getElementById("checkoutBtn")?.addEventListener("click", () => {
  updateCartUI();
  new bootstrap.Modal(document.getElementById("checkoutModal")).show();
});

document.getElementById("confirmOrderBtn")?.addEventListener("click", () => {
  const name = document.getElementById("cusName").value.trim();
  const phone = document.getElementById("cusPhone").value.trim();
  const address = document.getElementById("cusAddress").value.trim();
  const payment = document.getElementById("paymentMethod").value;
  if (!name || !phone || !address) {
    alert("Vui lòng nhập đủ thông tin!");
    return;
  }

  const newOrder = {
    id: "DH" + Date.now(),
    customer: { name, phone, address, payment },
    items: cart,
    total: cart.reduce((t, i) => t + i.price * i.qty, 0),
    date: new Date().toLocaleString(),
    status: "Chờ xử lý",
  };
  let orders = JSON.parse(localStorage.getItem("orders") || "[]");
  orders.unshift(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  cart = [];
  localStorage.removeItem("cart");
  document.getElementById("cart-count").innerText = "0";
  updateCartUI();
  bootstrap.Modal.getInstance(document.getElementById("checkoutModal")).hide();
  const cartModalEl = document.getElementById("cartModal");
  const cartInstance = bootstrap.Modal.getInstance(cartModalEl);
  if (cartInstance) cartInstance.hide();
  const doneModal = new bootstrap.Modal(document.getElementById("doneModal"));
  doneModal.show();
  setTimeout(() => {
    doneModal.hide();
    document.getElementById("cusName").value = "";
    document.getElementById("cusPhone").value = "";
    document.getElementById("cusAddress").value = "";
  }, 2000);
});

loadGlobalData();
