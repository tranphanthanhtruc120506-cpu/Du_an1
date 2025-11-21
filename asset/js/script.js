// ======================= API =======================
const productApi = "data/products.json";

let allProducts = [];
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// Cập nhật số lượng giỏ hàng khi load trang
document.getElementById("cart-count").innerText =
  cart.reduce((t, i) => t + i.qty, 0) || 0;

// ======================= TÌM KIẾM =======================
document.getElementById("button-addon2")?.addEventListener("click", (e) => {
  e.preventDefault();
  const query = document.getElementById("search-inp").value.trim();
  localStorage.setItem("searchQuery", query);
  loadProducts();
});

document.getElementById("search-inp")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("button-addon2")?.click();
  }
});

// ======================= LOAD DATA =======================
function loadProducts() {
  fetch(productApi)
    .then((r) => r.json())
    .then((data) => {
      allProducts = (data.products || data).filter(
        (p) => p.status === "Enabled"
      );

      const query = (localStorage.getItem("searchQuery") || "")
        .toLowerCase()
        .trim();

      localStorage.removeItem("searchQuery");

      const container = document.getElementById("products-container");
      if (!container) return;

      container.innerHTML = "";

      if (query) {
        const result = allProducts.filter((p) => {
          return (
            p.name?.toLowerCase().includes(query) ||
            p.topic?.toLowerCase().includes(query) ||
            p.flower?.toLowerCase().includes(query) ||
            p.style?.toLowerCase().includes(query)
          );
        });

        renderSearchResults(query, result);
      } else {
        renderCategories();
      }
    })
    .catch((err) => {
      console.error(err);
      document
        .getElementById("products-container")
        ?.insertAdjacentHTML(
          "beforeend",
          `<h3 class="text-center text-danger">Lỗi tải dữ liệu sản phẩm!</h3>`
        );
    });
}

// ======================= TRANG CHỦ =======================
function renderCategories() {
  const container = document.getElementById("products-container");

  const groups = {
    giamgia: allProducts.filter((p) => p.category === "giamgia"),
    spmoi: allProducts.filter((p) => p.category === "spmoi"),
  };

  const titles = {
    giamgia: "--- Đang giảm giá ---",
    spmoi: "--- Sản Phẩm Mới ---",
  };

  Object.keys(groups).forEach((key, idx) => {
    if (groups[key].length === 0) return;

    container.insertAdjacentHTML(
      "beforeend",
      `
      <div class="text-center my-5">
        <h2 class="display-5 fw-bold" style="color:#8b0015;">${titles[key]}</h2>
      </div>

      <div class="row g-4 justify-content-center mb-5">
        ${groups[key]
          .slice(0, 4)
          .map((item) => cardHTML(item))
          .join("")}
      </div>

      ${
        idx < Object.keys(groups).length - 1
          ? '<hr class="my-5" style="border-top:3px solid #f8c6d5;">'
          : ""
      }
      `
    );
  });

  attachEvents();
}

// ======================= CARD HTML =======================
function cardHTML(item) {
  return `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="card h-100 position-relative border-0 shadow-sm overflow-hidden rounded-3">

        ${
          item.salePercent > 0
            ? `<div class="badge bg-danger position-absolute top-0 start-0 m-3 px-3 py-2 fw-bold"
                style="border-radius:50px;z-index:10;">-${item.salePercent}%</div>`
            : ""
        }

        <img src="${item.img}" 
             class="card-img-top"
             style="height:320px;object-fit:cover;"
             onerror="this.src='asset/notfound.jpg'"
             alt="${item.name}">

        <div class="card-body text-center d-flex flex-column">
          <h5 class="card-title mb-2" style="color:#5D001E;">${item.name}</h5>

          <p class="text-danger fw-bold fs-5 mb-1">
            ${item.priceNew.toLocaleString()} VNĐ
            ${
              item.priceOld > item.priceNew
                ? `<s class="text-muted fs-6">${item.priceOld.toLocaleString()} VNĐ</s>`
                : ""
            }
          </p>

          <button class="btn btn-danger mt-auto mb-2 btn-buy" data-id="${
            item.id
          }">
            Đặt hàng
          </button>

          <button class="btn btn-warning btn-add-cart" data-id="${item.id}">
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  `;
}

// ======================= KẾT QUẢ TÌM KIẾM  =======================
function renderSearchResults(query, products) {
  const container = document.getElementById("products-container");

  // Tiêu đề kết quả
  container.innerHTML = `
    <div class="text-center my-5">
      <h2 class="display-5 fw-bold" style="color:#8b0015;">
        Kết quả tìm kiếm: "${query}"
      </h2>
      <p class="text-muted">Tìm thấy <strong>${products.length}</strong> sản phẩm</p>
    </div>
  `;

  if (products.length === 0) {
    container.insertAdjacentHTML(
      "beforeend",
      `<h4 class="text-center text-danger">Không tìm thấy sản phẩm nào phù hợp!</h4>`
    );
    return;
  }

  const rowHTML = `
    <div class="row g-4 justify-content-center mb-5">
      ${products.map((item) => cardHTML(item)).join("")}
    </div>
  `;

  container.insertAdjacentHTML("beforeend", rowHTML);

  attachEvents();
}

// ======================= EVENTS =======================
function attachEvents() {
  document.querySelectorAll(".btn-buy, .btn-add-cart").forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      const id = parseInt(btn.dataset.id);
      const product = allProducts.find((p) => p.id === id);
      if (product) addToCart(product, btn.classList.contains("btn-buy"));
    };
  });
}

// ======================= GIỎ HÀNG =======================
function addToCart(product, openModal = false) {
  const exist = cart.find((i) => i.name === product.name);

  if (exist) exist.qty++;
  else
    cart.push({
      name: product.name,
      img: product.img,
      price: product.priceNew,
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
    total += item.price * item.qty;

    tbody.innerHTML += `
      <tr>
        <td><img src="${item.img}" width="50" class="rounded"></td>
        <td class="align-middle">${item.name}</td>
        <td class="align-middle">${item.price.toLocaleString()} VNĐ</td>
        <td class="align-middle">
          <input type="number" min="1" value="${item.qty}"
            class="form-control form-control-sm qty"
            data-index="${i}" style="width:70px;">
        </td>
        <td class="align-middle">
          <button class="btn btn-danger btn-sm" onclick="removeFromCart(${i})">Xóa</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("cart-total").innerText =
    total.toLocaleString() + " VNĐ";

  // Cập nhật số lượng khi thay đổi input
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

// ======================= XÓA SẢN PHẨM KHỎI GIỎ =======================
function removeFromCart(i) {
  cart.splice(i, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  document.getElementById("cart-count").innerText = cart.reduce(
    (t, i) => t + i.qty,
    0
  );
  updateCartUI();
}

// ======================= CHECKOUT =======================
document.getElementById("checkoutBtn")?.addEventListener("click", () => {
  updateCartUI(); // Cập nhật lại giỏ hàng trước khi hiện modal
  new bootstrap.Modal(document.getElementById("checkoutModal")).show();
});

document.getElementById("confirmOrderBtn")?.addEventListener("click", () => {
  const name = document.getElementById("cusName").value.trim();
  const phone = document.getElementById("cusPhone").value.trim();
  const address = document.getElementById("cusAddress").value.trim();

  if (!name || !phone || !address) {
    alert("Vui lòng nhập đầy đủ thông tin nhận hàng!");
    return;
  }

  // Xóa giỏ hàng sau khi đặt thành công
  cart = [];
  localStorage.removeItem("cart");
  document.getElementById("cart-count").innerText = "0";
  updateCartUI();

  // Đóng modal checkout
  bootstrap.Modal.getInstance(document.getElementById("checkoutModal")).hide();

  // Hiện thông báo thành công
  new bootstrap.Modal(document.getElementById("doneModal")).show();
});

// ======================= KHỞI ĐỘNG =======================
loadProducts();
