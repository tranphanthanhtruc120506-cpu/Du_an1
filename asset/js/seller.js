// asset/js/seller.js

// 1. Khởi tạo dữ liệu mẫu nếu chưa có
const sampleProducts = [
    { id: 1, name: "Bó Hoa Hồng Đỏ Luxury", category: "Hoa hồng", price: 500000, type: "bo", gift: true, img: "hoa1.jpg" },
    { id: 2, name: "Giỏ Hoa Hướng Dương", category: "Hoa hướng dương", price: 350000, type: "gio", gift: false, img: "hoa2.jpg" }
];

const sampleOrders = [
    { id: "DH001", cus: "Nguyễn Văn A", date: "2025-11-18", total: 500000, status: "Mới" },
    { id: "DH002", cus: "Trần Thị B", date: "2025-11-17", total: 1200000, status: "Đã giao" }
];

function initData() {
    if (!localStorage.getItem('products')) localStorage.setItem('products', JSON.stringify(sampleProducts));
    if (!localStorage.getItem('orders')) localStorage.setItem('orders', JSON.stringify(sampleOrders));
}

// 2. Render Sản phẩm (Dùng cho seller_product.html)
function renderProductTable() {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    tbody.innerHTML = products.map((p, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><i class="fas fa-image text-muted"></i> ${p.name}</td>
            <td><span class="badge bg-info text-dark">${p.category}</span></td>
            <td>${parseInt(p.price).toLocaleString()} đ</td>
            <td>${p.type === 'bo' ? 'Bó hoa' : 'Giỏ hoa'}</td>
            <td>${p.gift ? '<i class="fas fa-check text-success"></i>' : ''}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${i})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// 3. Xử lý Form Thêm Sản phẩm
function handleAddProduct(e) {
    e.preventDefault();
    const name = document.getElementById('proName').value;
    const price = document.getElementById('proPrice').value;
    const category = document.getElementById('proCategory').value;
    // Radio logic
    const type = document.querySelector('input[name="proType"]:checked').value;
    // Checkbox logic
    const gift = document.getElementById('proGift').checked;
    const fast = document.getElementById('proFast').checked; // Chỉ để demo lấy dữ liệu

    if (name && price) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        products.push({ 
            id: Date.now(), 
            name, price, category, type, gift, 
            img: "default.jpg" 
        });
        localStorage.setItem('products', JSON.stringify(products));
        alert("Thêm sản phẩm thành công!");
        document.getElementById('addProductForm').reset();
        renderProductTable();
    }
}

// 4. Xóa sản phẩm
function deleteProduct(index) {
    if(confirm("Bạn chắc chắn muốn xóa?")) {
        const products = JSON.parse(localStorage.getItem('products'));
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        renderProductTable();
    }
}

// Chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
    initData();
    renderProductTable();
    
    const form = document.getElementById('addProductForm');
    if(form) form.addEventListener('submit', handleAddProduct);
});