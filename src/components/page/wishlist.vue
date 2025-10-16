<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useToast } from 'vue-toastification';

const store = useStore();
const router = useRouter();
const toast = useToast();

const wishlistItems = ref([]);

const getLoggedInUser = () => {
  const user = localStorage.getItem('loggedInUser');
  return user ? JSON.parse(user) : null;
};

const fetchWishlist = async () => {
  const user = getLoggedInUser();
  if (!user) {
    wishlistItems.value = [];
    return;
  }

  try {
    const { data: userWishlists } = await axios.get(`http://localhost:3000/wishlist?userId=${user.id}`);
    if (userWishlists.length > 0) {
      wishlistItems.value = userWishlists[0].products.filter(p => p && p.id);
    } else {
      wishlistItems.value = [];
    }
  } catch (error) {
    console.error("Lỗi khi tải danh sách yêu thích:", error);
    toast.error("Lỗi khi tải danh sách yêu thích!");
    wishlistItems.value = [];
  }
};

const removeFromWishlist = async (productId) => {
  const user = getLoggedInUser();
  if (!user) {
    toast.warning("Vui lòng đăng nhập để thực hiện thao tác này!");
    return;
  }

  try {
    const { data: userWishlists } = await axios.get(`http://localhost:3000/wishlist?userId=${user.id}`);

    if (userWishlists.length > 0) {
      let userWishlist = userWishlists[0];
      const initialLength = userWishlist.products.length;
      userWishlist.products = userWishlist.products.filter(p => p.id !== productId);

      if (userWishlist.products.length < initialLength) {
        await axios.put(`http://localhost:3000/wishlist/${userWishlist.id}`, userWishlist);
        await fetchWishlist();
        toast.success("Đã bỏ yêu thích sản phẩm!");
      } else {
        toast.info("Sản phẩm này không tồn tại trong danh sách!");
      }
    }
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    toast.error("Có lỗi xảy ra khi xóa sản phẩm!");
  }
};

const formatPrice = (price) => {
  if (typeof price !== 'number') return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

onMounted(() => {
  fetchWishlist();
});
</script>

<template>
  <div class="wishlist-page">
    <div class="container my-5">
      <h2 class="text-center mb-4 fw-bold">Danh sách yêu thích</h2>

      <div v-if="wishlistItems.length === 0" class="text-center p-5 bg-light rounded">
        <p class="lead">Danh sách yêu thích của bạn đang trống.</p>
        <router-link to="/shop" class="btn btn-dark">
          <i class="fa fa-shopping-bag me-2"></i>Bắt đầu mua sắm
        </router-link>
      </div>

      <div v-else>
        <div class="row">
          <div v-for="item in wishlistItems" :key="item.id" class="col-md-4 col-lg-3 mb-4">
            <div class="card h-100 shadow-sm border-0 product-card">
              <router-link :to="`/productDetail/${item.id}`" class="text-decoration-none">
                <template v-if="Array.isArray(item.image) && item.image.length > 0">
                  <img :src="item.image[0]" class="card-img-top product-img" :alt="item.name">
                </template>
                <template v-else>
                  <img src="https://via.placeholder.com/300x300.png?text=No+Image"
                    class="card-img-top product-img"
                    :alt="item.name">
                </template>
              </router-link>

              <div class="card-body text-center d-flex flex-column">
                <h6 class="card-title fw-semibold text-truncate">
                  <router-link :to="`/productDetail/${item.id}`"
                    class="text-dark text-decoration-none stretched-link">
                    {{ item.name }}
                  </router-link>
                </h6>

                <div class="mt-auto">
                  <p class="card-text text-danger fw-bold fs-5 mb-2">
                    {{ formatPrice(item.discount || item.price) }}
                  </p>

                  <div class="position-relative" style="z-index: 2;">
                    <button @click="removeFromWishlist(item.id)"
                      class="btn btn-sm btn-outline-danger">
                      Bỏ yêu thích <i class="fa fa-heart-broken ms-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}

.product-img {
  height: 220px;
  object-fit: cover;
}

.stretched-link::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  content: "";
}
</style>
