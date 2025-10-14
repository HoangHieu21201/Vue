<template>
  <div class="wishlist-page">
    <div class="container my-5">
      <div class="row mb-4">
        <div class="col">
          <!-- <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">Sản phẩm yêu thích</li>
            </ol>
          </nav> -->
          <h2 class="fw-bold text-center ">Danh sách yêu thích</h2>
        </div>
      </div>

      <div v-if="!wishlist || wishlist.length === 0" class="text-center py-5 border rounded bg-light">
          <i class="fa fa-heart-o fa-3x text-muted mb-3"></i>
          <h4 class="fw-bold">Danh sách yêu thích của bạn đang trống</h4>
          <p class="text-muted">Hãy thêm những sản phẩm bạn muốn mua sau vào đây nhé.</p>
          <router-link to="/shop" class="btn btn-dark mt-3">
              <i class="fa fa-shopping-bag me-2"></i>Tiếp tục mua sắm
          </router-link>
      </div>

      <div v-else class="row g-4">
        <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="product in wishlist" :key="product.id">
          <div class="card product-card h-100">
            <router-link :to="`/productDetail/${product.id}`">
              <img :src="product.image[0]" class="card-img-top" :alt="product.name">
            </router-link>
            <div class="card-body d-flex flex-column text-center">
              <h5 class="card-title fw-semibold">{{ product.name }}</h5>
              <p class="card-text text-danger fw-bold fs-5 mt-auto">{{ Number(product.price).toLocaleString('vi-VN') }} ₫</p>
            </div>
            <div class="card-footer p-3 border-0 bg-transparent">
               <button @click="removeFromWishlist(product.id)" class="btn btn-outline-danger w-100">
                  <i class="fa fa-heart-crack me-2"></i> Bỏ yêu thích
               </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-5 pt-5 border-top" v-if="recommendedProducts.length > 0">
         <h3 class="fw-bold text-center mb-4">Có thể bạn sẽ thích</h3>
         <div class="row g-4">
            <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="product in recommendedProducts" :key="product.id">
                <div class="card product-card h-100">
                    <router-link :to="`/productDetail/${product.id}`">
                        <img :src="product.image[0]" class="card-img-top" :alt="product.name">
                        <div class="card-body text-center">
                            <h5 class="card-title fw-semibold">{{ product.name }}</h5>
                            <p class="card-text text-danger fw-bold fs-5">{{ Number(product.price).toLocaleString('vi-VN') }} ₫</p>
                        </div>
                    </router-link>
                </div>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';

const store = useStore();
const recommendedProducts = ref([]);

const wishlist = computed(() => store.state.wishlist.items);

const removeFromWishlist = (productId) => {
  store.dispatch('wishlist/removeFromWishlist', productId);
};

const fetchRecommendedProducts = async () => {
  if (wishlist.value && wishlist.value.length > 0) {
    const categoryIds = [...new Set(wishlist.value.map(item => item.categoryId))];
    try {
      const { data } = await axios.get('http://localhost:3000/products');
      recommendedProducts.value = data.filter(product =>
        categoryIds.includes(product.categoryId) &&
        !wishlist.value.some(wishlistItem => wishlistItem.id === product.id)
      ).slice(0, 4);
    } catch(error) {
      console.error("Lỗi khi tải sản phẩm gợi ý:", error);
    }
  } else {
    recommendedProducts.value = [];
  }
};

watch(wishlist, fetchRecommendedProducts, { deep: true, immediate: true });

onMounted(() => {
  fetchRecommendedProducts();
});
</script>

<style scoped>
.wishlist-page {
  background-color: #f8f9fa;
}

.breadcrumb-item a {
  text-decoration: none;
  color: #6c757d;
}

.breadcrumb-item a:hover {
  color: #000;
}

.product-card {
  border: 1px solid #e9ecef;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.product-card .card-img-top {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.product-card .card-title {
  font-size: 1rem;
  /* Cắt ngắn tên sản phẩm nếu quá dài */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-card .card-body {
    padding: 1rem;
}
</style>