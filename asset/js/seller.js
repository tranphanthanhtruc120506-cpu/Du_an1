// ================= 1. CẤU HÌNH API =================
const apiList = [
  "data/products.json",
  "data/chude2.json",
  "data/hoatuoi2.json",
  "data/kieudang2.json",
];

// ================= 2. KHỞI TẠO DỮ LIỆU =================
function initData() {
  // Load danh mục vào ô Select trước
  updateCategorySelect();

  const storedData = localStorage.getItem("products");
  if (storedData) {
    renderProductTable();
    return;
  }

  // Nếu chưa có dữ liệu, tải từ file
  Promise.all(
    apiList.map((url) =>
      fetch(url)
        .then((res) => (res.ok ? res.json() : null))
        .catch((e) => null)
    )
  ).then((results) => {
    let allProducts = [];
    results.forEach((data) => {
      if (!data) return;
      if (Array.isArray(data)) allProducts = allProducts.concat(data);
      else if (data.products) allProducts = allProducts.concat(data.products);
    });
    localStorage.setItem("products", JSON.stringify(allProducts));
    renderProductTable();
  });
}

function updateCategorySelect() {
  const select = document.getElementById("proCategory");
  if (!select) return;

  const categories = JSON.parse(localStorage.getItem("categories")) || [
    "Hoa sinh nhật",
    "Hoa khai trương",
    "Bó hoa",
    "Giỏ hoa",
  ];

  let html = `<option value="" disabled selected>-- Chọn danh mục --</option>`;
  // Thêm các danh mục hệ thống (nếu muốn)
  html += `<optgroup label="Hệ thống"><option value="giamgia">Đang giảm giá</option><option value="spmoi">Sản phẩm mới</option></optgroup>`;

  html += `<optgroup label="Danh mục của bạn">`;
  html += categories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");
  html += `</optgroup>`;

  select.innerHTML = html;
}

// ================= 3. HIỂN THỊ BẢNG =================
function renderProductTable() {
  const tbody = document.getElementById("productTableBody");
  const products = JSON.parse(localStorage.getItem("products")) || [];

  if (products.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center py-4">Chưa có sản phẩm nào.</td></tr>';
    return;
  }

  // Đảo ngược để sản phẩm mới nhất lên đầu
  const reversedList = [...products].reverse();

  tbody.innerHTML = reversedList
    .map((p, i) => {
      // Tính index thực trong mảng gốc (Quan trọng để sửa đúng cái)
      const realIndex = products.length - 1 - i;

      let imgSrc = p.img;
      const storedImg = localStorage.getItem("img_" + p.img);
      if (storedImg) imgSrc = storedImg;

      const priceDisplay = parseInt(
        p.priceNew || p.price || 0
      ).toLocaleString();
      // Hiển thị tên kiểu dáng đẹp hơn
      let styleName = "Khác";
      if (p.style) {
        if (p.style.includes("bo")) styleName = "Bó hoa";
        else if (p.style.includes("gio")) styleName = "Giỏ hoa";
        else styleName = p.style;
      }

      return `
        <tr>
            <td>${i + 1}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${imgSrc}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:10px;border:1px solid #eee;" onerror="this.src='https://placehold.co/40x40?text=Img'">
                    <div>
                        <div class="fw-bold text-dark" style="font-size:0.9rem;">${
                          p.name
                        }</div>
                    </div>
                </div>
            </td>
            <td><span class="badge bg-light text-dark border">${
              p.category || "Chưa phân loại"
            }</span></td>
            <td class="text-danger fw-bold small">${priceDisplay} đ</td>
            <td class="small">${styleName}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-warning text-white me-1" onclick="editProduct(${realIndex})" title="Sửa thông tin">
                  <i class="fas fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${realIndex})" title="Xóa">
                  <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
      `;
    })
    .join("");
}

// ================= 4. CHỨC NĂNG ĐƯA DỮ LIỆU CŨ LÊN FORM (EDIT) =================
function editProduct(index) {
  const products = JSON.parse(localStorage.getItem("products"));
  const p = products[index]; // Lấy sản phẩm tại vị trí index

  // 1. Điền thông tin cũ vào ô input
  document.getElementById("proName").value = p.name;
  document.getElementById("proPrice").value = p.priceNew || p.price;

  // Chọn đúng danh mục (nếu danh mục đó còn tồn tại trong select)
  const catSelect = document.getElementById("proCategory");
  catSelect.value = p.category;
  // Nếu value không khớp (do danh mục bị xóa hoặc tên lạ), ta có thể force chọn hoặc để trống
  if (catSelect.value !== p.category) {
    // Tùy chọn: Thêm tạm option đó vào để hiển thị
    const opt = document.createElement("option");
    opt.value = p.category;
    opt.innerHTML = p.category;
    opt.selected = true;
    catSelect.appendChild(opt);
  }

  // 2. Xử lý Radio (Kiểu dáng)
  // Logic: Tìm từ khóa trong style để check đúng radio
  const styleStr = (p.style || "").toLowerCase();
  if (styleStr.includes("bo")) {
    document.getElementById("type1").checked = true;
  } else if (styleStr.includes("gio")) {
    document.getElementById("type2").checked = true;
  }

  // 3. Xử lý Checkbox (Quà tặng)
  document.getElementById("proGift").checked = p.salePercent > 0;

  // 4. HIỂN THỊ ẢNH CŨ (Quan trọng)
  const previewDiv = document.getElementById("previewImg");
  const previewImg = previewDiv.querySelector("img");

  let imgSrc = p.img;
  const storedImg = localStorage.getItem("img_" + p.img);
  if (storedImg) imgSrc = storedImg;

  previewImg.src = imgSrc;
  previewDiv.classList.remove("d-none"); // Hiện khung xem trước ảnh

  // 5. Lưu ID vào ô ẩn để lát nữa bấm Lưu thì biết là đang sửa
  document.getElementById("editId").value = index;

  // 6. Đổi giao diện nút bấm
  const btnSave = document.getElementById("btnSave");
  btnSave.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Cập nhật';
  btnSave.className = "btn btn-warning text-white fw-bold";

  document.getElementById("btnCancel").classList.remove("d-none"); // Hiện nút Hủy

  // 7. Cuộn lên đầu form
  document.querySelector(".card-header").scrollIntoView({ behavior: "smooth" });
}

// Hàm reset form về trạng thái thêm mới
function resetForm() {
  document.getElementById("addProductForm").reset();
  document.getElementById("editId").value = ""; // Xóa ID ẩn

  // Trả lại nút Lưu màu đỏ
  const btnSave = document.getElementById("btnSave");
  btnSave.innerHTML = '<i class="fas fa-save me-2"></i>Lưu sản phẩm';
  btnSave.className = "btn btn-danger fw-bold";

  document.getElementById("btnCancel").classList.add("d-none"); // Ẩn nút hủy
  document.getElementById("previewImg").classList.add("d-none"); // Ẩn ảnh cũ
}

// ================= 5. XỬ LÝ LƯU (THÊM HOẶC SỬA) =================
function handleAddProduct(e) {
  e.preventDefault();

  const name = document.getElementById("proName").value.trim();
  const price = document.getElementById("proPrice").value;
  const category = document.getElementById("proCategory").value;
  const editIndex = document.getElementById("editId").value; // Lấy ID từ ô ẩn

  let type = "bó hoa";
  const typeInput = document.querySelector('input[name="proType"]:checked');
  if (typeInput) type = typeInput.value === "bo" ? "bó hoa" : "giỏ hoa";

  const gift = document.getElementById("proGift").checked;
  const imgFile = document.getElementById("proImg").files[0];

  if (!name || !price) {
    alert("Vui lòng nhập tên và giá!");
    return;
  }

  // --- LOGIC LƯU DỮ LIỆU ---
  const saveProcess = (imgPath) => {
    const products = JSON.parse(localStorage.getItem("products")) || [];

    // Dữ liệu mới chuẩn bị lưu
    const productData = {
      id: Date.now(),
      name: name,
      priceNew: parseInt(price),
      category: category,
      style: type,
      salePercent: gift ? 10 : 0,
      img: imgPath, // Đường dẫn ảnh (mới hoặc cũ)
      status: "Enabled",
    };

    if (editIndex !== "") {
      // === TRƯỜNG HỢP SỬA (CẬP NHẬT) ===
      // Giữ lại ID cũ của sản phẩm (không tạo ID mới)
      productData.id = products[editIndex].id;

      // Nếu người dùng KHÔNG chọn ảnh mới (imgPath là null) -> Giữ ảnh cũ
      if (!imgPath) {
        productData.img = products[editIndex].img;
      }

      products[editIndex] = productData; // Ghi đè dữ liệu mới vào vị trí cũ
      alert("Đã cập nhật thông tin sản phẩm!");
    } else {
      // === TRƯỜNG HỢP THÊM MỚI ===
      // Nếu không có ảnh thì dùng ảnh mặc định
      if (!imgPath) productData.img = "asset/hinhanh/logo2 (2).png";
      products.push(productData);
      alert("Thêm mới thành công!");
    }

    localStorage.setItem("products", JSON.stringify(products));
    resetForm(); // Xóa form
    renderProductTable(); // Vẽ lại bảng
  };

  // --- XỬ LÝ ẢNH TRƯỚC KHI LƯU ---
  if (imgFile) {
    // Nếu có chọn ảnh mới -> Đọc ảnh -> Lưu base64 -> Gọi hàm saveProcess
    const fileName = "upload_" + Date.now();
    const reader = new FileReader();
    reader.onload = function (event) {
      localStorage.setItem("img_" + fileName, event.target.result);
      saveProcess(fileName);
    };
    reader.readAsDataURL(imgFile);
  } else {
    // Nếu không chọn ảnh mới -> Gọi hàm saveProcess với tham số null
    saveProcess(null);
  }
}

// ================= 6. XÓA SẢN PHẨM =================
function deleteProduct(index) {
  if (confirm("Bạn chắc chắn muốn xóa?")) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    products.splice(index, 1);
    localStorage.setItem("products", JSON.stringify(products));

    // Nếu đang sửa đúng cái sản phẩm bị xóa thì reset form luôn
    if (document.getElementById("editId").value == index) resetForm();

    renderProductTable();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initData();
  const form = document.getElementById("addProductForm");
  if (form) form.addEventListener("submit", handleAddProduct);
});
