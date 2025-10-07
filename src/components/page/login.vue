<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const router = useRouter();

const email = ref("");
const password = ref("");
const form = ref([]);
const message = ref("");
const isSuccess = ref(false);

const readadmin = async () => {
    try {
        const res = await axios.get('http://localhost:3000/user');
        form.value = res.data;
    } catch (err) {
        console.log("Fetch posts error:", err);
    }
};

const handleLogin = () => {
    if (email.value === "") {
        message.value = "Email cannot be blank";
        isSuccess.value = false;
        return;
    }
    if (password.value === "") {
        message.value = "Password cannot be blank";
        isSuccess.value = false;
        return;
    }

    const user = form.value.find(u => u.email === email.value && u.password === password.value);

    if (!user) {
        Swal.fire({
            icon: 'error',
            title: 'Login failed!',
            text: 'Please check your email and password again.',
            confirmButtonColor: '#000'
        })
    } else {
        Swal.fire({
            icon: 'success',
            title: 'Login Complete',
            text: 'Your account is logged in!',
            showConfirmButton: true,
            confirmButtonText: 'Go to Home',
            confirmButtonColor: '#000'
        }).then(() => {
            window.location.href = '/'
        })

        localStorage.setItem('loggedInUser', JSON.stringify(user));
    }
};

onMounted(readadmin);
</script>

<template>
    <div class="container d-flex justify-content-center align-items-center vh-100">
        <div class="card shadow-lg p-4 rounded-4" style="max-width: 400px; width: 100%;">
            <h3 class="text-center mb-4">Login</h3>
            <form @submit.prevent="handleLogin">
                <!-- Email -->
                <div class="mb-3">
                    <label for="email" class="form-label">Email address</label>
                    <input type="email" class="form-control" id="email" v-model="email" placeholder="Enter your email"
                        required />
                </div>

                <!-- Password -->
                <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" v-model="password"
                        placeholder="Enter your password" required />
                </div>

                <div class="d-grid">
                    <button type="submit" class="btn btn-dark">Login</button>
                </div>
            </form>

            <p class="text-center mt-3 mb-0" :class="isSuccess ? 'text-success' : 'text-danger'">
                {{ message }}
            </p>

            <p class="text-center mt-3 mb-0">
                Don’t have an account?
                <router-link to="/register" class="text-decoration-none fw-semibold text-dark">Sign up</router-link>
            </p>
        </div>
    </div>
</template>
