<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import axios from 'axios';

const router = useRouter()
const user = ref(null)

onMounted(async () => {
  const storedUser = JSON.parse(localStorage.getItem('loggedInUser'))
  if (storedUser) {
    try {
      const res = await axios.get(`http://localhost:3000/user/${storedUser.id}`)
      user.value = res.data
    } catch (err) {
      console.error(err)
    }
  }
})

const handleLogout = () => {
  localStorage.removeItem('loggedInUser')
  user.value = null
  router.push('/login')
}
</script>

<template>
  <header>
    <nav class="navbar navbar-expand-lg shadow-sm sticky-top custom-navbar">
      <div class="container">
        <!-- Logo -->
        <router-link class="navbar-brand d-flex align-items-center" to="/">
          <img src="https://www.accuratereviews.com/wp-content/uploads/2021/07/outfit-logo-padding.png" alt="logo"
            width="110" class="me-2" />
        </router-link>

        <!-- Toggle (mobile) -->
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <i class="fa fa-bars text-dark fs-4"></i>
        </button>

        <!-- Nav links -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav mx-auto text-center gap-lg-4">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/shop">Shop</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/about">About</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/profile">Profile</router-link>
            </li>
          </ul>

          <!-- Right actions -->
          <div class="d-flex align-items-center gap-2">
            <template v-if="user">
              <span class="text-dark">
                <i class="fa-solid fa-user" style="color: #000000;"></i>
                Hi, <b>{{ user.fullname }}</b>
              </span>

              <template v-if="user.role === 'admin'">
                <router-link to="/admin" class="btn btn-dark btn-sm fw-semibold">Admin Panel</router-link>
              </template>

              <button @click="handleLogout" class="btn btn-outline-dark btn-sm">Logout</button>
            </template>

            <template v-else>
              <router-link to="/login" class="btn btn-outline-dark btn-sm">Login</router-link>
              <router-link to="/register" class="btn btn-dark btn-sm fw-semibold">Register</router-link>
            </template>

            <div class="position-relative">
              <router-link to="/cart"><i class="fa-solid fa-cart-shopping fs-5 text-dark"></i></router-link>
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style="font-size: 10px;">
                2
              </span>
            </div>

          </div>

        </div>
      </div>
    </nav>
  </header>

  <!-- Router view -->
  <router-view />

  <!-- FOOTER -->
  <footer class="footer text-dark mt-5">
    <div class="container py-5">
      <div class="row gy-4">
        <!-- Logo + Description -->
        <div class="col-lg-4 col-md-6">
          <router-link class="navbar-brand d-flex align-items-center" to="/">
            <img src="https://www.accuratereviews.com/wp-content/uploads/2021/07/outfit-logo-padding.png" alt="logo"
              width="110" class="me-2" />
          </router-link>
          <p class="small text-secondary mb-3">
            Where fashion meets technology ✨ — Stay updated with the latest
            trends and elevate your style with OutfitVN.
          </p>
          <div class="d-flex gap-3">
            <a href="#" class="social"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="social"><i class="fab fa-instagram"></i></a>
            <a href="#" class="social"><i class="fab fa-tiktok"></i></a>
            <a href="#" class="social"><i class="fab fa-twitter"></i></a>
          </div>
        </div>

        <!-- Links -->
        <div class="col-lg-2 col-md-6">
          <h6 class="fw-semibold mb-3 text-black">Quick Links</h6>
          <ul class="list-unstyled footer-links">
            <li><router-link to="/" class="text-decoration-none">Home</router-link></li>
            <li><router-link to="/categories" class="text-decoration-none">Categories</router-link></li>
            <li><router-link to="/about" class="text-decoration-none">About</router-link></li>
            <li><router-link to="/crud" class="text-decoration-none">User</router-link></li>
          </ul>
        </div>

        <!-- Support -->
        <div class="col-lg-3 col-md-6">
          <h6 class="fw-semibold mb-3 text-black">Support</h6>
          <ul class="list-unstyled footer-links">
            <li><a href="#" class="text-decoration-none">FAQ</a></li>
            <li><a href="#" class="text-decoration-none">Privacy Policy</a></li>
            <li><a href="#" class="text-decoration-none">Terms of Service</a></li>
            <li><a href="#" class="text-decoration-none">Contact Us</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="col-lg-3 col-md-6">
          <h6 class="fw-semibold mb-3 text-black">Contact</h6>
          <p class="small mb-1"><i class="fa fa-map-marker-alt me-2"></i>Thanh Nhat Ward, Dak Lak, Vietnam</p>
          <p class="small mb-1"><i class="fa fa-envelope me-2"></i>support@OutfitVN.vn</p>
          <p class="small mb-0"><i class="fa fa-phone me-2"></i>+84 999 888 777</p>
        </div>
      </div>
    </div>

    <!-- Copyright -->
    <div class="footer-bottom text-center py-3 mt-4 border-top border-secondary">
      <p class="mb-0 small text-secondary">
        &copy; 2025 <b>OutfitVN</b> — All rights reserved.
      </p>
    </div>
  </footer>

</template>

<style scoped>
/* ===== BODY BASE ===== */
body {
  background-color: #fff;
  color: #222;
}

/* ======= HEADER ======= */
.custom-navbar {
  background-color: #fff;
  border-bottom: 1px solid #e5e5e5;
  padding: 0.8rem 0;
  transition: all 0.3s ease;
}

.navbar-brand img {
  filter: brightness(0);
  /* cho logo đen trắng */
}

.navbar-nav .nav-link {
  color: #333 !important;
  font-weight: 500;
  transition: color 0.3s;
}

.navbar-nav .nav-link:hover {
  color: #000 !important;
  text-decoration: underline;
}

.navbar-nav .nav-link.router-link-active {
  color: #000 !important;
  font-weight: 600;
}

/* ======= FOOTER ======= */
.footer {
  background: #f8f8f8;
  border-top: 1px solid #ddd;
  font-size: 0.95rem;
  color: #333;
}

.footer h6,
.footer h5 {
  color: #000;
}

.footer-links a {
  color: #555;
  transition: color 0.3s;
  display: inline-block;
  padding: 3px 0;
}

.footer-links a:hover {
  color: #000;
  text-decoration: underline;
}

.social {
  color: #333;
  font-size: 1.1rem;
  border: 1px solid #aaa;
  width: 35px;
  height: 35px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: 0.3s;
}

.social:hover {
  background-color: #000;
  color: #fff;
  border-color: #000;
}

.footer-bottom {
  background-color: #f0f0f0;
}

/* ======= MOBILE ======= */
@media (max-width: 991px) {
  .navbar-collapse {
    background-color: #fff;
    border-top: 1px solid #eee;
    padding: 1rem;
  }

  .nav-link {
    padding: 0.5rem 0;
  }
}
</style>
