<template>
  <div class="wishlist-page">
    <div class="container my-5">
      <h2 class="text-center mb-4">Danh sách yêu thích</h2>
      <div v-if="wishlistItems.length === 0" class="text-center">
        <p>Danh sách yêu thích của bạn đang trống.</p>
        <router-link to="/shop" class="btn btn-primary">Bắt đầu mua sắm</router-link>
      </div>
      <div v-else>
        <div class="row">
          <div v-for="item in wishlistItems" :key="item.id" class="col-md-4 col-lg-3 mb-4">
            <div class="card h-100">
              <img :src="item.image[0]" class="card-img-top" :alt="item.name">
              <div class="card-body">
                <h5 class="card-title">{{ item.name }}</h5>
                <p class="card-text text-danger">{{ formatPrice(item.price) }}</p>
                <button class="btn btn-sm btn-outline-danger" @click="removeFromWishlist(item.id)">
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const wishlistItems = ref([]);

const fetchWishlist = async () => {
  try {
    const response = await axios.get('http://localhost:3000/wishlist');
    if (response.data.length > 0) {
      wishlistItems.value = response.data[0].products;
    }
  } catch (error) {
    console.error("Lỗi khi tải danh sách yêu thích:", error);
  }
};

const removeFromWishlist = async (productId) => {
  try {
    const response = await axios.get('http://localhost:3000/wishlist');
    if (response.data.length > 0) {
      let wishlist = response.data[0];
      wishlist.products = wishlist.products.filter(p => p.id !== productId);
      await axios.put('http://localhost:3000/wishlist/1', wishlist);
      await fetchWishlist(); // Tải lại danh sách sau khi xóa
      alert('Đã xóa sản phẩm khỏi danh sách yêu thích.');
    }
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

onMounted(() => {
  fetchWishlist();
});
</script>

<style scoped>
/* (Giữ nguyên style của bạn) */
.card-img-top {
  height: 200px;
  object-fit: cover;
}
</style>