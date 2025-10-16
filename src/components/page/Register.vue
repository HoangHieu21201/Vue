<script setup>
import { ref } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// Khởi tạo form mặc định
const form = ref({
    fullname: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    status: "active",
    role: "user"
})

// Gửi form đăng ký
const handleSubmit = async () => {
    try {
        // 🟢 Kiểm tra email trùng trong API db.json
        const checkEmail = await axios.get(`http://localhost:3000/user?email=${form.value.email}`);
        if (checkEmail.data.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Email đã được đăng ký!',
                text: 'Vui lòng dùng email khác.',
                confirmButtonColor: '#000'
            });
            return;
        }

        // 🟢 Nếu chưa trùng → tiến hành tạo tài khoản
        const res = await axios.post("http://localhost:3000/user", form.value);

        if (res.status === 201) {
            Swal.fire({
                icon: 'success',
                title: 'Tài khoản đã được tạo thành công!',
                text: 'Bạn có thể đăng nhập ngay bây giờ.',
                showConfirmButton: true,
                confirmButtonText: 'Đi đến Đăng nhập',
                confirmButtonColor: '#000'
            }).then(() => {
                window.location.href = '/login';
            });

            // Reset form
            form.value = {
                fullname: "",
                email: "",
                password: "",
                phone: "",
                address: "",
                status: "active",
                role: "user"
            };
        }
    } catch (err) {
        console.error("Lỗi khi đăng ký: ", err);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi máy chủ!',
            text: 'Không thể kết nối tới server.',
            confirmButtonColor: '#000'
        });
    }
};
</script>

<template>
    <div class="register-wrapper d-flex justify-content-center align-items-center vh-100">
        <div class="card shadow-lg border-0 rounded-4 p-4"
            style="max-width: 450px; width: 100%; background-color: #fff;">
            <h3 class="text-center fw-bold mb-4 text-dark">Sign Up</h3>

            <form @submit.prevent="handleSubmit">
                <!-- Full Name -->
                <div class="mb-3">
                    <label for="fullname" class="form-label fw-semibold text-dark">Full Name</label>
                    <input v-model="form.fullname" type="text" id="fullname" class="form-control border-dark-subtle"
                        placeholder="Enter your full name" required />
                </div>

                <!-- Email -->
                <div class="mb-3">
                    <label for="email" class="form-label fw-semibold text-dark">Email address</label>
                    <input v-model="form.email" type="email" id="email" class="form-control border-dark-subtle"
                        placeholder="Enter your email" required />
                </div>

                <!-- Phone -->
                <div class="mb-3">
                    <label for="phone" class="form-label fw-semibold text-dark">Phone</label>
                    <input v-model="form.phone" type="text" id="phone" class="form-control border-dark-subtle"
                        placeholder="Enter your phone number" />
                </div>

                <!-- Address -->
                <div class="mb-3">
                    <label for="address" class="form-label fw-semibold text-dark">Address</label>
                    <input v-model="form.address" type="text" id="address" class="form-control border-dark-subtle"
                        placeholder="Enter your address" />
                </div>

                <!-- Password -->
                <div class="mb-3">
                    <label for="password" class="form-label fw-semibold text-dark">Password</label>
                    <input v-model="form.password" type="password" id="password" class="form-control border-dark-subtle"
                        placeholder="Enter your password" required />
                </div>

                <!-- Re-enter Password -->
                <div class="mb-3">
                    <label for="repassword" class="form-label fw-semibold text-dark">Re-enter Password</label>
                    <input type="password" id="repassword" class="form-control border-dark-subtle"
                        placeholder="Re-enter your password" required />
                </div>

                <!-- Submit -->
                <div class="d-grid">
                    <button type="submit" class="btn btn-dark fw-semibold py-2">Create Account</button>
                </div>
            </form>

            <!-- Link to Login -->
            <p class="text-center mt-3 mb-0 text-dark">
                Already have an account?
                <router-link to="/login" class="text-decoration-none fw-semibold text-dark">Login</router-link>
            </p>
        </div>
    </div>
</template>

<style scoped>
.register-wrapper {
    background-color: #f4f4f4;
}

.card {
    transition: 0.3s;
}

input:focus {
    box-shadow: none;
    border-color: #000 !important;
}
</style>
