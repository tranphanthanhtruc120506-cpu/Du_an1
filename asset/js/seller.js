// ================= 1. CẤU HÌNH API =================
// Danh sách các file dữ liệu cần tải
const apiList = [
  "data/products.json",
  "data/chude2.json",
  "data/hoatuoi2.json",
  "data/kieudang2.json",
];

// ================= 2. KHỞI TẠO DỮ LIỆU (initData) =================
function initData() {
  // BƯỚC 1: Kiểm tra xem LocalStorage có dữ liệu chưa
  const storedData = localStorage.getItem("products");

  if (storedData) {
    // Nếu có rồi thì hiển thị luôn, không tải lại để tránh mất dữ liệu mới thêm
    renderProductTable();
    return;
  }

  // BƯỚC 2: Tải tất cả các file JSON cùng lúc
  const fetchPromises = apiList.map((url) =>
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Lỗi tải file ${url}`);
        return res.json();
      })
      .catch((err) => {
        console.warn(err); // Nếu 1 file lỗi thì bỏ qua, không làm chết web
        return null;
      })
  );

  // Sau khi tải xong tất cả
  Promise.all(fetchPromises).then((results) => {
    let allProducts = [];

    results.forEach((data) => {
      if (!data) return; // Bỏ qua file lỗi

      // Xử lý các cấu trúc JSON khác nhau
      if (Array.isArray(data)) {
        // Trường hợp file products.json là mảng []
        allProducts = allProducts.concat(data);
      } else if (data.products && Array.isArray(data.products)) {
        // Trường hợp file chude2.json, hoatuoi2.json... là object { products: [] }
        allProducts = allProducts.concat(data.products);
      }
    });

    // Lưu mảng tổng hợp vào LocalStorage
    localStorage.setItem("products", JSON.stringify(allProducts));

    // Vẽ bảng
    renderProductTable();
    console.log(`Đã tải tổng cộng ${allProducts.length} sản phẩm từ các file.`);
  });
}

// ================= 3. HIỂN THỊ DANH SÁCH SẢN PHẨM =================
function renderProductTable() {
  const tbody = document.getElementById("productTableBody");
  if (!tbody) return;

  const products = JSON.parse(localStorage.getItem("products")) || [];

  if (products.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center py-4">Chưa có sản phẩm nào. Hãy thêm mới!</td></tr>';
    return;
  }

  tbody.innerHTML = products
    .map((p, i) => {
      // Logic hiển thị ảnh: Ưu tiên ảnh base64, sau đó đến ảnh từ file json
      let imgSrc = p.img;
      const storedImg = localStorage.getItem("img_" + p.img);
      if (storedImg) imgSrc = storedImg;

      // Xử lý giá tiền (vì trong json có lúc là priceNew, lúc là price)
      const priceDisplay = parseInt(
        p.priceNew || p.price || 0
      ).toLocaleString();

      return `
        <tr>
            <td>${i + 1}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${imgSrc}" 
                         style="width:50px;height:50px;object-fit:cover;border-radius:4px;margin-right:10px;border:1px solid #ddd;" 
                         onerror="this.src='https://placehold.co/50x50?text=No+Img'">
                    <span class="fw-bold text-dark">${p.name}</span>
                </div>
            </td>
            <td><span class="badge bg-light text-dark border">${
              p.category || "Khác"
            }</span></td>
            <td class="text-danger fw-bold">${priceDisplay} đ</td>
            <td>${
              p.style === "bo" || p.style === "bó hoa" ? "Bó hoa" : "Giỏ hoa"
            }</td>
            <td>${
              p.salePercent > 0
                ? `<span class="badge bg-danger">-${p.salePercent}%</span>`
                : '<span class="text-muted">-</span>'
            }</td>
            <td>
                <button class="btn btn-sm btn-danger shadow-sm" onclick="deleteProduct(${i})">
                  <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
      `;
    })
    .join("");
}

// ================= 4. XỬ LÝ THÊM SẢN PHẨM =================
function handleAddProduct(e) {
  e.preventDefault();

  const name = document.getElementById("proName").value.trim();
  const price = document.getElementById("proPrice").value;
  const category = document.getElementById("proCategory").value;

  // Radio button
  let type = "bó hoa";
  const typeInput = document.querySelector('input[name="proType"]:checked');
  if (typeInput) type = typeInput.value === "bo" ? "bó hoa" : "giỏ hoa";

  const gift = document.getElementById("proGift").checked;
  const imgFile = document.getElementById("proImg").files[0];

  if (!name || !price) {
    alert("Vui lòng nhập tên và giá sản phẩm!");
    return;
  }

  // Hàm lưu
  const saveToLocalStorage = (imgPath) => {
    const products = JSON.parse(localStorage.getItem("products")) || [];

    const newProduct = {
      id: Date.now(),
      name: name,
      priceNew: parseInt(price),
      category: category,
      style: type,
      salePercent: gift ? 10 : 0,
      img: imgPath,
      status: "Enabled",
    };

    products.push(newProduct);
    localStorage.setItem("products", JSON.stringify(products));

    alert("Thêm sản phẩm thành công!");
    document.getElementById("addProductForm").reset();
    renderProductTable();
  };

  // Xử lý ảnh
  if (imgFile) {
    const fileName = "upload_" + Date.now() + "_" + imgFile.name;
    const reader = new FileReader();
    reader.onload = function (event) {
      localStorage.setItem("img_" + fileName, event.target.result);
      saveToLocalStorage(fileName);
    };
    reader.readAsDataURL(imgFile);
  } else {
    saveToLocalStorage("asset/hinhanh/logo2 (2).png");
  }
}

// ================= 5. XÓA SẢN PHẨM =================
function deleteProduct(index) {
  if (confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    products.splice(index, 1);
    localStorage.setItem("products", JSON.stringify(products));
    renderProductTable();
  }
}

// ================= 6. KHỞI CHẠY =================
document.addEventListener("DOMContentLoaded", () => {
  initData();

  const form = document.getElementById("addProductForm");
  if (form) form.addEventListener("submit", handleAddProduct);
});
