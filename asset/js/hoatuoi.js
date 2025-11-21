const productApi = "data/hoatuoi2.json";

let allProducts = []; // Lưu toàn bộ sản phẩm
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// Cập nhật số lượng giỏ hàng
document.getElementById("cart-count").innerText =
  cart.reduce((t, i) => t + i.qty, 0) || 0;

// Tìm kiếm
document.getElementById("button-addon2")?.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.setItem(
    "searchQuery",
    document.getElementById("search-inp").value.trim()
  );
  loadProducts();
});

// Load dữ liệu
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
      if (!container)
        return console.error("Không tìm thấy #products-container");

      if (query) {
        // Kết quả tìm kiếm
        const result = allProducts.filter((p) =>
          p.name.toLowerCase().includes(query)
        );
        renderSearchResults(query, result);
      } else {
        // Trang chủ: nhóm theo category
        renderCategories();
      }
    })
    .catch((err) => {
      console.error(err);
      document
        .getElementById("products-container")
        ?.insertAdjacentHTML(
          "beforeend",
          `<h3 class="text-center text-danger">Lỗi tải dữ liệu!</h3>`
        );
    });
}

function renderCategories() {
  const container = document.getElementById("products-container");
  container.innerHTML = "";

  const groups = {
    hoahong: allProducts.filter((p) => p.category === "hoahong"),
    hoahuongduong: allProducts.filter((p) => p.category === "hoahuongduong"),
    hoababy: allProducts.filter((p) => p.category === "hoababy"),
  };

  const titles = {
    hoahong: "--- Hoa Hồng ---",
    hoahuongduong: "--- Hoa Hướng Dương ---",
    hoababy: "--- Hoa Baby ---",
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
          .map(
            (item) => `
          <div class="col-6 col-md-4 col-lg-3">
            <div class="card h-100 position-relative border-0 shadow-sm overflow-hidden rounded-3">
              ${
                item.salePercent > 0
                  ? `<div class="badge bg-danger position-absolute top-0 start-0 m-3 px-3 py-2 fw-bold" style="border-radius:50px;z-index:10;">-${item.salePercent}%</div>`
                  : ""
              }
              <img src="${
                item.img
              }" class="card-img-top" style="height:320px;object-fit:cover;" onerror="this.src='asset/notfound.jpg'" alt="${
              item.name
            }">
              <div class="card-body text-center d-flex flex-column">
                <h5 class="card-title mb-2" style="color:#5D001E;">${
                  item.name
                }</h5>
                <p class="text-danger fw-bold fs-5 mb-1">${item.priceNew.toLocaleString()} VNĐ 
                  ${
                    item.priceOld > item.priceNew
                      ? `<s class="text-muted fs-6">${item.priceOld.toLocaleString()} VNĐ</s>`
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
          </div>
        `
          )
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

// Render kết quả tìm kiếm
function renderSearchResults(query, products) {
  const container = document.getElementById("products-container");
  container.innerHTML = `<div class="text-center my-5"><h2 class="display-5 fw-bold" style="color:#8b0015;">Kết quả tìm kiếm: "${query}"</h2></div><div class="row g-4 justify-content-center">`;
  if (products.length === 0) {
    container.innerHTML += `<h4 class="text-center text-danger w-100">Không tìm thấy sản phẩm nào!</h4></div>`;
  } else {
    products.forEach((p) => {
      container.insertAdjacentHTML(
        "beforeend",
        `
        <div class="col-6 col-md-4 col-lg-3"> ... giống card ở trên ... </div>
      `
      ); // (giống hệt card ở renderCategories, bạn copy paste cho nhanh)
    });
    container.insertAdjacentHTML("beforeend", "</div>");
  }
  attachEvents();
}

// Gắn sự kiện nút
function attachEvents() {
  document.querySelectorAll(".btn-buy, .btn-add-cart").forEach((btn) => {
    btn.onclick = () => {
      const id = parseInt(btn.dataset.id);
      const product = allProducts.find((p) => p.id === id);
      if (product) addToCart(product, btn.classList.contains("btn-buy"));
    };
  });
}

// Giỏ hàng
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
  tbody.innerHTML = "";
  let total = 0;
  cart.forEach((item, i) => {
    total += item.price * item.qty;
    tbody.innerHTML += `
      <tr>
        <td><img src="${
          item.img
        }" width="50" onerror="this.src='asset/notfound.jpg'"></td>
        <td>${item.name}</td>
        <td>${item.price.toLocaleString()}</td>
        <td><input type="number" min="1" value="${
          item.qty
        }" class="form-control form-control-sm qty" data-index="${i}" style="width:70px;"></td>
        <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${i})">X</button></td>
      </tr>`;
  });
  document.getElementById("cart-total").innerText = total.toLocaleString();

  // Cập nhật số lượng
  document.querySelectorAll(".qty").forEach((input) => {
    input.onchange = () => {
      let qty = parseInt(input.value) || 1;
      cart[input.dataset.index].qty = qty;
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartUI();
    };
  });
}

function removeFromCart(i) {
  cart.splice(i, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

// Checkout (giữ nguyên như cũ)
document
  .getElementById("checkoutBtn")
  ?.addEventListener("click", () =>
    new bootstrap.Modal("#checkoutModal").show()
  );
document.getElementById("confirmOrderBtn")?.addEventListener("click", () => {
  if (
    !document.getElementById("cusName").value ||
    !document.getElementById("cusPhone").value ||
    !document.getElementById("cusAddress").value
  ) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }
  cart = [];
  localStorage.removeItem("cart");
  document.getElementById("cart-count").innerText = "0";
  updateCartUI();
  bootstrap.Modal.getInstance("#checkoutModal").hide();
  new bootstrap.Modal("#doneModal").show();
});

// Khởi động
loadProducts();
