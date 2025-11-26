// asset/js/sanphamchitiet.js
console.log(
  "File JS chi tiết sản phẩm đã chạy (Phiên bản sửa giữ nguyên gốc)!"
);

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
  currentProduct = allProductsData.find((p) => p.id == id);

  if (!currentProduct) {
    console.log("Không tìm thấy sản phẩm, thử tải lại dữ liệu gốc...");
    await fetchAndSaveData();
    allProductsData = JSON.parse(localStorage.getItem("products"));
    currentProduct = allProductsData.find((p) => p.id == id);
  }

  if (currentProduct) {
    console.log("Đã tìm thấy sản phẩm:", currentProduct.name);
    renderProductInfo(currentProduct);
    renderThumbnails(currentProduct);
    renderRelatedProducts(currentProduct);
    loadReviews(); // Tải đánh giá
    bindProductButtons(); // GẮN SỰ KIỆN CHO NÚT SAU KHI RENDER
    bindReviewEvents(); // GẮN SỰ KIỆN GỬI ĐÁNH GIÁ

    renderGallery();
  } else {
    console.error("Vẫn không tìm thấy sản phẩm ID:", id);
    const nameEl = document.getElementById("product-name");
    if (nameEl) nameEl.innerText = "Sản phẩm không tồn tại!";
  }
}

async function fetchAndSaveData() {
  try {
    const apiList = [
      "data/products.json",
      "data/chude2.json",
      "data/hoatuoi2.json",
      "data/kieudang2.json",
    ];
    const responses = await Promise.all(
      apiList.map((url) => fetch(url).then((res) => res.json()))
    );
    let newData = [];
    responses.forEach((data) => {
      if (Array.isArray(data)) newData = newData.concat(data);
      else if (data.products) newData = newData.concat(data.products);
    });
    localStorage.setItem("products", JSON.stringify(newData));
  } catch (error) {
    console.error("Lỗi tải file data:", error);
  }
}

// 3. Hiển thị Thông tin
// 3. Hiển thị Thông tin
function renderProductInfo(product) {
  document.title = product.name + " - Spark Flower";
  const nameEl = document.getElementById("product-name");
  if (nameEl) nameEl.innerText = product.name;

  const idEl =
    document.getElementById("product-id") || document.getElementById("p-id");
  if (idEl) idEl.innerText = product.id || "";

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
  let imgSrc = product.img || "";
  try {
    if (imgSrc && !imgSrc.startsWith("data:") && !imgSrc.startsWith("http")) {
      const storedImg = localStorage.getItem("img_" + product.img);
      if (storedImg) imgSrc = storedImg;
    }
  } catch (e) {
    /* ignore */
  }

  const imgEl = document.getElementById("product-img");
  if (imgEl) {
    if (imgSrc) imgEl.src = imgSrc;
    imgEl.onerror = function () {
      this.src = "asset/hinhanh/logo2 (2).png";
    };
  }

  // --- PHẦN SỬA CHÍNH: NỘI DUNG PHONG PHÚ ---
  const descElement = document.getElementById("product-desc");
  if (descElement) {
    descElement.style.maxHeight = "450px"; // Tăng chiều cao lên xíu để hiển thị đẹp hơn
    descElement.style.overflowY = "auto";
    descElement.style.paddingRight = "10px";

    let content = product.description;

    // Nếu không có mô tả riêng, hiển thị template phong phú mặc định
    if (!content) {
      content = `
                <div class="product-detail-content">
                    <p class="lead text-muted mb-3 text-justify" style="font-size: 0.95rem; line-height: 1.6;">
                        <strong>${product.name}</strong> là sự lựa chọn hoàn hảo để gửi gắm những thông điệp yêu thương chân thành nhất. 
                        Sản phẩm được các nghệ nhân tại Spark Flower thiết kế tỉ mỉ, kết hợp giữa vẻ đẹp hiện đại và sự tinh tế cổ điển.
                    </p>
                    
                    <div class="mb-3">
                        <h6 class="fw-bold text-dark mb-2" style="border-left: 4px solid #d3213f; padding-left: 10px;">
                            <i class="fas fa-star text-warning me-2"></i>Điểm nổi bật:
                        </h6>
                        <ul class="text-muted small" style="list-style: none; padding-left: 0;">
                            <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Hoa tuyển chọn loại 1, đảm bảo độ tươi từ 3-5 ngày.</li>
                            <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Giấy gói Hàn Quốc cao cấp, chống thấm nước.</li>
                            <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Thiết kế độc đáo, phù hợp tặng sinh nhật, kỷ niệm, khai trương.</li>
                        </ul>
                    </div>

                    <div class="alert alert-light border-start border-danger border-3 bg-light mb-3">
                        <h6 class="fw-bold text-danger mb-1"><i class="fas fa-heart me-2"></i>Ý nghĩa:</h6>
                        <p class="text-muted small mb-0 text-justify">
                            Món quà này không chỉ là hoa, mà là lời chúc cho sự hạnh phúc, may mắn và thành công. 
                            Màu sắc hài hòa của sản phẩm sẽ mang lại năng lượng tích cực cho người nhận.
                        </p>
                    </div>
            `;
    }
    descElement.innerHTML = content;
  }
}

// 4. Xử lý Giỏ Hàng

// === [PHẦN SỬA 1: TÁCH LOGIC THÊM GIỎ HÀNG] ===
// Hàm này chỉ làm nhiệm vụ thêm data vào localStorage, không hiện thông báo
function addToCartInternal(qty) {
  if (!currentProduct) return false;

  cart = JSON.parse(localStorage.getItem("cart") || "[]");
  // Lấy ảnh hiện đang hiển thị (đã xử lý src)
  let imgToStore =
    document.getElementById("product-img")?.src || currentProduct.img || "";

  // nếu đã có sản phẩm (so sánh id ưu tiên hơn name)
  const exist = cart.find(
    (i) => i.id == currentProduct.id || i.name === currentProduct.name
  );
  if (exist) {
    exist.qty = (parseInt(exist.qty) || 0) + qty;
  } else {
    cart.push({
      id: currentProduct.id,
      name: currentProduct.name,
      img: imgToStore,
      price:
        parseInt(currentProduct.priceNew || currentProduct.price || 0) || 0,
      qty: qty,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  console.log("Đã lưu giỏ hàng (Internal):", cart);

  updateCartCount();
  updateCartModalUI();
  return true;
}

// Hàm này dùng cho nút "Thêm vào giỏ" (Hiện thông báo Toast)
window.addCurrentToCart = function () {
  console.log("Nút Thêm vào giỏ được nhấn");
  if (!currentProduct) {
    alert("Đang tải dữ liệu...");
    return;
  }

  const qtyInput = document.getElementById("qty");
  let qty = 1;
  if (qtyInput) {
    qty = parseInt(qtyInput.value) || 1;
    if (qty < 1) qty = 1;
  }

  // Gọi hàm internal để thêm data
  if (addToCartInternal(qty)) {
    // Sau đó mới hiện thông báo
    const toastEl = document.getElementById("toastAddCart");
    if (toastEl && typeof bootstrap !== "undefined") {
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    } else {
      // alert("✅ Đã thêm vào giỏ hàng!"); // Bật cái này nếu không dùng bootstrap toast
    }
  }
};

// Hàm này dùng cho nút "Mua ngay" (KHÔNG hiện toast, mở modal)
window.buyNow = function () {
  console.log("Nút Mua Ngay được nhấn");
  if (!currentProduct) {
    alert("Đang tải dữ liệu...");
    return;
  }

  const qtyInput = document.getElementById("qty");
  let qty = 1;
  if (qtyInput) {
    qty = parseInt(qtyInput.value) || 1;
    if (qty < 1) qty = 1;
  }

  // 1. Thêm vào giỏ hàng "âm thầm" (không hiện toast)
  addToCartInternal(qty);

  // 2. Mở modal giỏ hàng (hoặc checkout nếu muốn)
  const modalEl = document.getElementById("cartModal");
  if (modalEl && typeof bootstrap !== "undefined") {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } else {
    // Nếu không có bootstrap, điều hướng tới trang giỏ hàng hoặc thông báo
    // alert("Đã thêm vào giỏ! Vui lòng kiểm tra giỏ hàng.");
    // window.location.href = "giohang.html"; // Ví dụ
  }
};
// === [KẾT THÚC PHẦN SỬA 1] ===

window.changeQty = function (amount) {
  const input = document.getElementById("qty");
  if (input) {
    let val = parseInt(input.value) || 1;
    val = val + amount;
    if (val < 1) val = 1;
    input.value = val;
  }
};

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (el) {
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

  if (currentCart.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='5' class='text-center'>Giỏ hàng trống</td></tr>";
  } else {
    currentCart.forEach((item, i) => {
      let imgSrc = item.img || "";
      if (!imgSrc.startsWith("data:") && imgSrc && !imgSrc.startsWith("http")) {
        const sImg = localStorage.getItem("img_" + item.img);
        if (sImg) imgSrc = sImg;
      }
      total += (parseInt(item.price) || 0) * (parseInt(item.qty) || 0);
      tbody.innerHTML += `
                <tr>
                    <td><img src="${imgSrc}" width="40" style="border-radius:4px" onerror="this.src='asset/hinhanh/logo2 (2).png'"></td>
                    <td>${item.name}</td>
                    <td>${(parseInt(item.price) || 0).toLocaleString()}</td>
                    <td>${parseInt(item.qty) || 0}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="removeItemFromCart(${i})"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
    });
  }
  totalEl.innerText = total.toLocaleString() + " VNĐ";
}

window.removeItemFromCart = function (index) {
  let c = JSON.parse(localStorage.getItem("cart") || "[]");
  c.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(c));
  updateCartCount();
  updateCartModalUI();
};

// 5. Thanh toán
document.getElementById("checkoutBtn")?.addEventListener("click", () => {
  const cm = bootstrap.Modal.getInstance(document.getElementById("cartModal"));
  if (cm) cm.hide();
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

  const c = JSON.parse(localStorage.getItem("cart") || "[]");
  if (c.length === 0) {
    alert("Giỏ hàng trống!");
    return;
  }

  const newOrder = {
    id: "DH" + Date.now(),
    customer: { name, phone, address, payment },
    items: c,
    total: c.reduce(
      (t, i) => t + (parseInt(i.price) || 0) * (parseInt(i.qty) || 0),
      0
    ),
    date: new Date().toLocaleString(),
    status: "Chờ xử lý",
  };

  let orders = JSON.parse(localStorage.getItem("orders") || "[]");
  orders.unshift(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  localStorage.removeItem("cart");
  updateCartCount();
  updateCartModalUI();

  const cm = bootstrap.Modal.getInstance(
    document.getElementById("checkoutModal")
  );
  if (cm) cm.hide();
  new bootstrap.Modal(document.getElementById("doneModal")).show();
  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
});

const cartModalEl = document.getElementById("cartModal");
if (cartModalEl)
  cartModalEl.addEventListener("show.bs.modal", updateCartModalUI);

// 6. Ảnh & Liên quan
function renderThumbnails(product) {
  const imgContainer = document.querySelector(".product-image-container");
  if (!imgContainer) return;

  // Xóa list cũ nếu có
  const old = document.getElementById("thumb-list");
  if (old) old.remove();

  // Tạo container mới cho thumbnails
  const list = document.createElement("div");
  list.id = "thumb-list";

  // === [SỬA CSS CONTAINER] ===
  // 1. width: 100% để nó tràn đầy chiều ngang container cha (bằng ảnh lớn)
  // 2. justify-content: space-between để dàn đều khoảng cách
  list.style.cssText =
    "display:flex; gap:10px; margin-top:15px; width: 100%; justify-content: space-between;";

  // === [SỬA VỊ TRÍ CHÈN] ===
  // Chèn trực tiếp vào bên trong .product-image-container để đảm bảo nó cùng độ rộng với ảnh lớn
  imgContainer.appendChild(list);

  let mainImg = product.img;
  if (!mainImg.startsWith("data:")) {
    const s = localStorage.getItem("img_" + product.img);
    if (s) mainImg = s;
  }
  // Giả lập 4 ảnh giống nhau (thực tế bạn sẽ lấy từ product.images nếu có)
  const imgs = [mainImg, mainImg, mainImg, mainImg];

  list.innerHTML = imgs
    .map(
      (src, i) => `
        <div class="thumb-item" onclick="changeMainImage('${src}', this)"
             style="
                flex: 1; /* [SỬA CSS ITEM] Quan trọng: để các item tự chia đều chiều ngang */
                height: 85px; /* Chiều cao cố định, bạn có thể chỉnh số này */
                border:2px solid ${i === 0 ? "#d3213f" : "#eee"};
                border-radius:8px; /* Bo góc tròn hơn chút cho hiện đại */
                cursor:pointer;
                overflow:hidden;
                transition: all 0.3s ease; /* Hiệu ứng mượt khi click */
             ">
            <img src="${src}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='asset/hinhanh/logo2 (2).png'">
        </div>
    `
    )
    .join("");
}

window.changeMainImage = function (src, el) {
  document.getElementById("product-img").src = src;
  document
    .querySelectorAll(".thumb-item")
    .forEach((d) => (d.style.borderColor = "#eee"));
  el.style.borderColor = "#d3213f";
};

function renderRelatedProducts(product) {
  const con = document.getElementById("related-products");
  if (!con) return;
  const related = allProductsData
    .filter((p) => p.category === product.category && p.id != product.id)
    .slice(0, 4);
  if (related.length === 0) {
    con.innerHTML =
      "<p class='text-center text-muted w-100'>Không có sản phẩm liên quan.</p>";
    return;
  }

  con.innerHTML = related
    .map((p) => {
      let img = p.img;
      if (!img.startsWith("data:")) {
        const s = localStorage.getItem("img_" + p.img);
        if (s) img = s;
      }
      const price = parseInt(p.priceNew || p.price).toLocaleString();
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
    })
    .join("");
}

// === [PHẦN SỬA 2: XỬ LÝ ĐÁNH GIÁ] ===

// Hàm tải và hiển thị đánh giá (Thay thế hàm rỗng cũ)
function loadReviews() {
  if (!currentProduct) return;
  const reviewListEl = document.getElementById("review-list");
  if (!reviewListEl) return;

  const allReviews = JSON.parse(
    localStorage.getItem("product_reviews") || "[]"
  );
  const productReviews = allReviews.filter(
    (r) => r.productId == currentProduct.id
  );

  if (productReviews.length === 0) {
    reviewListEl.innerHTML =
      "<p class='text-muted text-center py-3'>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>";
    return;
  }

  // Hàm nhỏ để vẽ ngôi sao
  const renderStars = (num) => {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= num)
        html += '<i class="fas fa-star text-warning"></i>'; // Sao vàng
      else html += '<i class="far fa-star text-secondary"></i>'; // Sao rỗng
    }
    return html;
  };

  reviewListEl.innerHTML = productReviews
    .reverse()
    .map(
      (r) => `
        <div class="review-item border-bottom mb-3 pb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <strong style="font-size: 1.1rem;">${r.name}</strong>
                <small class="text-muted" style="font-size: 0.85rem">${
                  r.date
                }</small>
            </div>
            <div class="mb-2">
                ${renderStars(r.stars || 5)} 
            </div>
            <p class="mb-0 text-secondary" style="white-space: pre-wrap;">${
              r.content
            }</p>
        </div>
    `
    )
    .join("");
}

// Hàm gắn sự kiện cho nút gửi đánh giá
// === [PHẦN SỬA 2: XỬ LÝ ĐÁNH GIÁ (ĐÃ FIX LỖI)] ===

function bindReviewEvents() {
  const submitReviewBtn = document.getElementById("btn-submit-review");

  if (!submitReviewBtn) {
    console.error("❌ LỖI: Không tìm thấy nút gửi đánh giá!");
    return;
  }

  submitReviewBtn.onclick = function (e) {
    e.preventDefault();

    if (!currentProduct) {
      alert("Đang tải dữ liệu sản phẩm...");
      return;
    }

    // --- SỬA Ở ĐÂY: Lấy đúng ID từ HTML bạn cung cấp ---
    const nameInput = document.getElementById("review-name");
    const contentInput = document.getElementById("review-text"); // Đã sửa từ 'review-content' thành 'review-text'
    const starInput = document.getElementById("review-stars"); // Lấy thêm số sao

    if (!nameInput || !contentInput) {
      alert(
        "Lỗi HTML: Không tìm thấy ô nhập liệu (Kiểm tra lại ID review-name hoặc review-text)"
      );
      return;
    }

    const name = nameInput.value.trim();
    const content = contentInput.value.trim();
    const stars = starInput ? parseInt(starInput.value) : 5; // Mặc định 5 sao nếu lỗi

    if (!name || !content) {
      alert("Vui lòng nhập tên và nội dung đánh giá!");
      if (!name) nameInput.focus();
      else contentInput.focus();
      return;
    }

    // Tạo object đánh giá có thêm số sao
    const newReview = {
      id: Date.now(),
      productId: currentProduct.id,
      name: name,
      content: content,
      stars: stars, // Lưu số sao vào đây
      date: new Date().toLocaleString("vi-VN"),
    };

    // Lưu vào LocalStorage
    try {
      let allReviews = JSON.parse(
        localStorage.getItem("product_reviews") || "[]"
      );
      allReviews.push(newReview);
      localStorage.setItem("product_reviews", JSON.stringify(allReviews));

      // Reset form
      nameInput.value = "";
      contentInput.value = "";
      if (starInput) starInput.value = "5";

      // Tải lại danh sách
      loadReviews();

      alert("Cảm ơn bạn! Đánh giá đã được gửi thành công.");
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi lưu đánh giá.");
    }
  };
}
// === [KẾT THÚC PHẦN SỬA 2] ===

// ------------ NEW: Gắn sự kiện cho nút Thêm & Mua --------------
function findButtonByText(text) {
  const buttons = Array.from(document.querySelectorAll("button"));
  return buttons.find(
    (b) =>
      b.textContent &&
      b.textContent
        .replace(/\s+/g, " ")
        .toLowerCase()
        .includes(text.toLowerCase())
  );
}

function bindProductButtons() {
  // tìm nút Mua Ngay (nội dung chứa "Mua Ngay")
  const buyBtn =
    findButtonByText("Mua Ngay") || document.querySelector(".btn-danger");
  if (buyBtn) {
    // tránh gán nhiều lần
    buyBtn.removeEventListener?.("click", buyNow);
    buyBtn.addEventListener("click", buyNow);
  }

  // tìm nút Thêm vào giỏ (nội dung chứa "Thêm vào giỏ")
  const addBtn =
    findButtonByText("Thêm vào giỏ") || document.querySelector(".btn-warning");
  if (addBtn) {
    addBtn.removeEventListener?.("click", addCurrentToCart);
    addBtn.addEventListener("click", addCurrentToCart);
  }
}

// Hàm tạo đánh giá giả định (chỉ dùng để test)
function seedFakeReviews() {
  const params = new URLSearchParams(window.location.search);
  const currentId = params.get("id"); // Lấy ID sản phẩm hiện tại

  if (!currentId) {
    console.log("Không tìm thấy ID sản phẩm để thêm đánh giá giả.");
    return;
  }

  // Danh sách data mẫu
  const fakeReviews = [
    {
      name: "Nguyễn Thu Hà",
      content:
        "Hoa bên ngoài nhìn tươi và đẹp hơn trong ảnh nhiều. Shop gói giấy màu pastel nhìn rất sang. Giao hàng đúng giờ hẹn. Sẽ ủng hộ shop dài dài ❤️",
      offset: 1000 * 60 * 60 * 2,
    },
    {
      name: "Trần Văn Nam",
      content:
        "Đặt tặng bạn gái nhân dịp kỷ niệm, cô ấy rất thích. Cảm ơn shop đã tư vấn nhiệt tình và viết thiệp giúp mình.",
      offset: 1000 * 60 * 60 * 24 * 2,
    },
    {
      name: "Lê Thị Bích Ngọc",
      content:
        "Hoa tươi, mix màu rất hài hòa. Tuy nhiên giao hàng hơi chậm hơn dự kiến 15 phút do tắc đường, nhưng bù lại anh shipper rất lễ phép.",
      offset: 1000 * 60 * 60 * 24 * 5,
    },
    {
      name: "Phạm Hoàng Anh",
      content:
        "Đã mua ở đây lần thứ 3 và chưa bao giờ thất vọng. 10 điểm cho chất lượng!",
      offset: 1000 * 60 * 60 * 24 * 10, //
    },
  ];

  // Lấy danh sách cũ
  let currentReviews = JSON.parse(
    localStorage.getItem("product_reviews") || "[]"
  );

  // Thêm data mới vào
  fakeReviews.forEach((review, index) => {
    // Kiểm tra xem đã có đánh giá này chưa để tránh spam khi reload
    const isExist = currentReviews.some(
      (r) => r.productId == currentId && r.content === review.content
    );

    if (!isExist) {
      currentReviews.push({
        id: Date.now() + index,
        productId: currentId,
        name: review.name,
        content: review.content,
        date: new Date(Date.now() - review.offset).toLocaleString("vi-VN"),
      });
    }
  });

  // Lưu ngược lại
  localStorage.setItem("product_reviews", JSON.stringify(currentReviews));
  console.log("Đã thêm đánh giá mẫu thành công! Hãy reload trang.");

  // Nếu hàm loadReviews đã chạy rồi thì gọi lại để cập nhật giao diện ngay
  if (typeof loadReviews === "function") loadReviews();
}

// Chạy hàm tạo đánh giá mẫu
seedFakeReviews();

// 7. Sản phẩm liên quan (ĐÃ SỬA: Tự động bù ảnh nếu thiếu)
function renderRelatedProducts(product) {
  const con = document.getElementById("related-products");
  if (!con) return;

  // 1. Lấy sản phẩm cùng loại (trừ sản phẩm đang xem)
  let related = allProductsData.filter(
    (p) => p.category === product.category && p.id != product.id
  );

  // 2. [MỚI] Nếu ít hơn 4 sản phẩm, lấy thêm từ các danh mục khác bù vào
  if (related.length < 4) {
    // Lấy tất cả sản phẩm khác loại
    const otherProducts = allProductsData.filter(
      (p) => p.category !== product.category && p.id != product.id
    );
    // Xáo trộn để lấy ngẫu nhiên
    otherProducts.sort(() => 0.5 - Math.random());

    // Tính số lượng cần thêm
    const need = 4 - related.length;

    // Gộp vào danh sách chính
    related = related.concat(otherProducts.slice(0, need));
  }

  // Chỉ lấy đúng 4 sản phẩm
  related = related.slice(0, 4);

  if (related.length === 0) {
    con.innerHTML =
      "<p class='text-center text-muted w-100'>Không có sản phẩm liên quan.</p>";
    return;
  }

  con.innerHTML = related
    .map((p) => {
      let img = p.img;
      if (!img.startsWith("data:") && !img.startsWith("http")) {
        const s = localStorage.getItem("img_" + p.img);
        if (s) img = s;
      }
      const price = parseInt(p.priceNew || p.price || 0).toLocaleString();

      return `
        <div class="col-6 col-md-3">
            <div class="card h-100 border-0 shadow-sm">
                <a href="sanphamchitiet.html?id=${p.id}">
                    <img src="${img}" class="card-img-top" style="height:200px; object-fit:cover;" onerror="this.src='asset/hinhanh/logo2 (2).png'">
                </a>
                <div class="card-body text-center p-2">
                    <h6 class="card-title mb-1" style="font-size:0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        <a href="sanphamchitiet.html?id=${p.id}" class="text-decoration-none text-dark fw-bold">${p.name}</a>
                    </h6>
                    <p class="text-danger fw-bold mb-0">${price} VNĐ</p>
                </div>
            </div>
        </div>`;
    })
    .join("");
}
// 7. Hiển thị Gallery ảnh (Instagram style) - Phiên bản fix lỗi hiển thị
function renderGallery() {
  const relatedSection = document.getElementById("related-products");
  if (!relatedSection) return;

  // Tìm container cha để chèn
  const parentContainer = relatedSection.parentElement;

  // Kiểm tra trùng lặp
  if (document.getElementById("insta-gallery")) return;

  // --- BƯỚC 1: LẤY DỮ LIỆU ẢNH ---
  let galleryImages = [];

  // Cách 2: (QUAN TRỌNG) Nếu không có dữ liệu, dùng danh sách cứng dự phòng
  if (galleryImages.length === 0) {
    console.log("Dữ liệu trống, đang dùng danh sách ảnh dự phòng...");
    galleryImages = [
      "asset/hinhanh/hoatuoi/hoahong/sp1.jpg",
      "asset/hinhanh/hoatuoi/hoahong/sp2.jpg",
      "asset/hinhanh/hoatuoi/hoahong/sp3.jpg",
      "asset/hinhanh/hoatuoi/hoahong/sp4.jpg",
      "asset/hinhanh/hoatuoi/hoahuongduong/sp1.jpg",
      "asset/hinhanh/hoatuoi/hoahuongduong/sp2.jpg",
      "asset/hinhanh/hoatuoi/hoababy/sp1.jpg",
      "asset/hinhanh/hoatuoi/hoababy/sp2.jpg",
      "asset/hinhanh/kieudang/bohoa/sp1.jpg",
      "asset/hinhanh/kieudang/giohoa/sp1.jpg",
      "asset/hinhanh/hoagiamgia/sp1.jpg",
      "asset/hinhanh/hoagiamgia/sp2.jpg",
      "asset/hinhanh/chude/hoasinhnhat/sp1.jpg",
      "asset/hinhanh/chude/hoacauhon/sp1.jpg",
    ];
  }

  // Lấy ngẫu nhiên 6 ảnh
  const randomImages = galleryImages
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);

  // --- BƯỚC 2: HIỂN THỊ HTML ---
  const galleryDiv = document.createElement("div");
  galleryDiv.id = "insta-gallery";
  galleryDiv.className = "mt-5 pt-4 border-top";

  let html = `
        <div class="text-center mb-4">
            <h5 class="fw-bold text-uppercase" style="letter-spacing: 2px;">Theo dõi trên Instagram</h5>
            <p class="text-muted small">@SparkFlower_Official</p>
        </div>
        <div class="row g-2 justify-content-center">
    `;

  randomImages.forEach((imgSrc) => {
    // Xử lý nếu ảnh được lưu base64 trong localStorage
    let finalSrc = imgSrc;
    if (!finalSrc.startsWith("data:") && !finalSrc.startsWith("http")) {
      const s = localStorage.getItem("img_" + imgSrc);
      if (s) finalSrc = s;
    }

    html += `
            <div class="col-4 col-md-2">
                <div class="gallery-item position-relative" style="overflow: hidden; aspect-ratio: 1/1; cursor: pointer; border-radius: 4px;">
                    <img src="${finalSrc}" 
                         class="w-100 h-100" 
                         style="object-fit: cover; transition: transform 0.5s ease;"
                         onmouseover="this.style.transform='scale(1.1)'"
                         onmouseout="this.style.transform='scale(1)'"
                         onerror="this.src='asset/hinhanh/logo2 (2).png'">
                         
                    <div class="overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                         style="background: rgba(0,0,0,0.3); opacity: 0; transition: opacity 0.3s; pointer-events: none;">
                        <i class="fas fa-heart text-white fs-4"></i>
                    </div>
                </div>
            </div>
        `;
  });

  html += `</div>`;
  galleryDiv.innerHTML = html;
  parentContainer.appendChild(galleryDiv);

  // Thêm style hover hiệu ứng tim
  const style = document.createElement("style");
  style.innerHTML = `
        .gallery-item:hover .overlay { opacity: 1 !important; }
    `;
  document.head.appendChild(style);
}

// Gọi loadProduct sau DOM ready
document.addEventListener("DOMContentLoaded", loadProduct);
