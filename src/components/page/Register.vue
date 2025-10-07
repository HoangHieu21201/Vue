<script setup>
import { ref } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const form = ref({
    fullname: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "user"
})

const handleSubmit = async () => {
    let users = JSON.parse(localStorage.getItem("users")) || []

    if (users.some(u => u.email === form.value.email)) {
        Swal.fire({
            icon: 'error',
            title: 'Email has been registered!',
            text: 'Please use another email',
            confirmButtonColor: '#000'
        })
        return
    }

    try {
        const res = await axios.post("http://localhost:3000/user", form.value)
        if (res.status === 201) {
            users.push(form.value)
            localStorage.setItem("users", JSON.stringify(users))
            Swal.fire({
                icon: 'success',
                title: 'Account created successfully',
                text: 'Your account has been created!',
                showConfirmButton: true,
                confirmButtonText: 'Go to Login',
                confirmButtonColor: '#000'
            }).then(() => {
                window.location.href = '/login'
            })
            form.value = { fullname: "", email: "", password: "", phone: "", address: "", role: "user" }
        }
    } catch (err) {
        console.error("Err: ", err)
        isMessage.value = "Error connert to server!"
        isSuccess.value = false
    }
}
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

                <div class="mb-3">
                    <label for="password" class="form-label">Re-enter Password</label>
                    <input type="password" class="form-control" id="password" v-model="password"
                        placeholder="Enter your password" required />
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
