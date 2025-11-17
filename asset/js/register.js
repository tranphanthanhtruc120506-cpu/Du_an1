const formRegister = document.getElementById("formRegister");
const userNameElement = document.getElementById("userName");
const emailElement = document.getElementById("email");
const passwordElement = document.getElementById("password");
const rePasswordElement = document.getElementById("rePassword");
const addressElement = document.getElementById("address");

const userNameError = document.getElementById("userNameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const rePasswordError = document.getElementById("rePasswordError");

// Lấy dữ liệu từ localStorage
let usersRaw = localStorage.getItem("users");
let userLocal;

try {
  userLocal = usersRaw ? JSON.parse(usersRaw) : [];
} catch (e) {
  console.error("Dữ liệu lỗi, reset lại localStorage");
  userLocal = [];
  localStorage.removeItem("users");
}

formRegister.addEventListener("submit", function (e) {
  e.preventDefault();

  // Kiểm tra rỗng
  userNameError.style.display = userNameElement.value ? "none" : "block";
  emailError.style.display = emailElement.value ? "none" : "block";
  passwordError.style.display = passwordElement.value ? "none" : "block";
  rePasswordError.style.display = rePasswordElement.value ? "none" : "block";

  // Kiểm tra mật khẩu trùng khớp
  if (passwordElement.value !== rePasswordElement.value) {
    rePasswordError.style.display = "block";
    rePasswordError.innerHTML = "Mật khẩu không khớp";
    return;
  } else {
    rePasswordError.innerHTML = "Mật khẩu không được để trống";
  }

  // Nếu hợp lệ → Lưu dữ liệu
  if (
    userNameElement.value &&
    emailElement.value &&
    passwordElement.value &&
    rePasswordElement.value &&
    passwordElement.value === rePasswordElement.value
  ) {
    const user = {
      userId: Date.now(),
      userName: userNameElement.value,
      email: emailElement.value,
      password: passwordElement.value,
      address: addressElement.value,
    };

    userLocal.push(user);

    // Lưu vào Local Storage
    localStorage.setItem("users", JSON.stringify(userLocal));

    // Chuyển trang
    window.location.href = "login.html";
  }
});
