document.getElementById("formLogin").addEventListener("submit", function (e) {
    e.preventDefault(); // Ngăn form reload

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    // Lấy danh sách users đã đăng ký trong localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Tìm user phù hợp
    let userFound = users.find(user => user.email === email && user.password === password);

    if (!userFound) {
        alert("Email hoặc mật khẩu không đúng!");
        return;
    }

    // Lưu trạng thái đăng nhập
    localStorage.setItem("currentUser", JSON.stringify(userFound));

    alert("Đăng nhập thành công!");
    window.location.href = "index.html"; // Chuyển sang trang chính
});