<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const category = ref([])
const products = ref([])

const scrollContainer = ref(null)
const scrollLeft = () => scrollContainer.value.scrollBy({ left: -350, behavior: 'smooth' })
const scrollRight = () => scrollContainer.value.scrollBy({ left: 350, behavior: 'smooth' })

const productScroll = ref(null)
const scrollProductLeft = () => productScroll.value.scrollBy({ left: -350, behavior: 'smooth' })
const scrollProductRight = () => productScroll.value.scrollBy({ left: 350, behavior: 'smooth' })

const readCategory = async () => {
  try {
    const res = await axios.get('http://localhost:3000/categories')
    category.value = res.data
  } catch (err) {
    console.error("Error: ", err)
  }
}

const readProduct = async () => {
  try {
    const res = await axios.get('http://localhost:3000/products')
    products.value = res.data
  } catch (err) {
    console.error("Error: ", err)
  }
}

onMounted(() => {
  readCategory()
  readProduct()
})
</script>

<template>
  <div class="home">
    <!-- Banner -->
    <section class="hero d-flex justify-content-center align-items-center text-center text-white">
      <div class="overlay"></div>
      <div class="content">
        <h1 class="fw-bold display-4 mb-3">Sport Men's Fashion</h1>
        <p class="lead mb-4">Style, quality, and your own personality</p>
        <button class="btn btn-light fw-semibold px-4 py-2">Shop Now</button>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="container my-5 position-relative">
      <h2 class="text-center fw-bold mb-4">Featured Categories</h2>

      <!-- Scroll buttons -->
      <button class="scroll-btn left" @click="scrollLeft"><i class="fa fa-chevron-left"></i></button>
      <button class="scroll-btn right" @click="scrollRight"><i class="fa fa-chevron-right"></i></button>

      <!-- Horizontal Scroll -->
      <div class="category-scroll d-flex gap-4 overflow-auto" ref="scrollContainer">
        <div class="category-item flex-shrink-0" v-for="items in category" :key="items.id">
          <div class="image-wrapper">
            <img :src="items.image" alt="Category" />
            <div class="overlay">
              <h5 class="text-white fw-bold">{{ items.nameCategory }}</h5>
              <button class="btn btn-light btn-sm mt-2">Explore</button>
            </div>
          </div>
          <div class="text-center mt-3">
            <p class="fw-semibold mb-1">{{ items.nameCategory }}</p>
            <p class="text-muted small mb-0">{{ items.moTa }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- PRODUCTS -->
    <section class="container my-5 position-relative">
      <h2 class="text-center fw-bold mb-4">Best Sellers</h2>

      <!-- Scroll buttons -->
      <button class="scroll-btn left" @click="scrollProductLeft">
        <i class="fa fa-chevron-left"></i>
      </button>
      <button class="scroll-btn right" @click="scrollProductRight">
        <i class="fa fa-chevron-right"></i>
      </button>

      <div class="category-scroll d-flex gap-4 overflow-auto" ref="productScroll">
        <div class="product-card flex-shrink-0 border-0 shadow-sm text-center bg-white" style="width: 250px"
          v-for="item in products" :key="item.id">
          <router-link :to="`/productDetail/${item.id}`" class="text-decoration-none text-dark">
            <div class="position-relative">
              <img :src="item.image[0]" alt="product" class="product-img" />
              <span v-if="item.discount < item.price"
                class="badge bg-danger position-absolute top-0 start-0 m-2 px-2 py-1" style="font-size: 0.8rem;">
                Giảm giá!
              </span>
            </div>

            <div class="p-3">
              <h6 class="fw-semibold mb-1">{{ item.name }}</h6>

              <template v-if="item.discount < item.price">
                <p class="text-muted text-decoration-line-through small mb-1">
                  {{ Number(item.price).toLocaleString('vi-VN') }} ₫
                </p>
                <p class="fw-bold mb-1 text-danger">
                  {{ Number(item.discount).toLocaleString('vi-VN') }} ₫
                </p>
                <p class="text-success small mb-2">
                  -{{ Math.round(100 - (item.discount / item.price) * 100) }}%
                </p>
              </template>

              <template v-else>
                <p class="fw-bold mb-2">{{ Number(item.price).toLocaleString('vi-VN') }} ₫</p>
              </template>

              <button class="btn btn-dark btn-sm mt-1">Add to Cart</button>
            </div>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* HERO */
.hero {
  position: relative;
  background: url("https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1600&q=80") center/cover no-repeat;
  height: 80vh;
}

.hero .overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.hero .content {
  position: relative;
  z-index: 2;
}

/* SCROLL BUTTONS */
.scroll-btn {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  background: #111;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: 0.3s;
  z-index: 5;
}

.scroll-btn:hover {
  background: #000;
  transform: translateY(-50%) scale(1.1);
}

.scroll-btn.left {
  left: -10px;
}

.scroll-btn.right {
  right: -10px;
}

/* CATEGORY */
.category-scroll {
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-item {
  width: 260px;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.image-wrapper img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: transform 0.4s ease, filter 0.3s ease;
}

.image-wrapper:hover img {
  transform: scale(1.08);
  filter: brightness(0.7);
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.image-wrapper:hover .overlay {
  opacity: 1;
}

/* PRODUCT */
.product-card {
  border-radius: 10px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
  transition: 0.3s ease;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

/* GENERAL */
section h2 {
  color: #111;
  text-transform: uppercase;
  letter-spacing: 1px;
}
</style>
