<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'

const store = useStore()
const category = ref([])
const products = ref([])
const searchQuery = ref('')
const sortOption = ref('Sắp xếp mặc định')
const coupons = ref([])
const wishlistItems = ref([]);
const selectedCategoryId = ref(null); // 1. Thêm biến để lưu ID danh mục được chọn

const addToCart = (product) => {
  store.dispatch('cart/addToCart', product);
  alert('Đã thêm sản phẩm vào giỏ hàng!');
};

const fetchWishlist = async () => {
  try {
    const res = await axios.get('http://localhost:3000/wishlist/1');
    wishlistItems.value = res.data.products;
  } catch (err) {
    console.error('Lỗi khi tải danh sách yêu thích:', err);
    wishlistItems.value = [];
  }
}

const isInWishlist = (productId) => {
  return wishlistItems.value.some(item => item.id === productId);
};

const toggleWishlist = async (product) => {
  try {
    const { data: wishlist } = await axios.get('http://localhost:3000/wishlist/1');
    const productIndex = wishlist.products.findIndex(p => p.id === product.id);

    if (productIndex !== -1) {
      wishlist.products.splice(productIndex, 1);
      alert('Đã xóa khỏi danh sách yêu thích');
    } else {
      wishlist.products.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        discount: product.discount
      });
      alert('Đã thêm vào danh sách yêu thích');
    }

    await axios.put('http://localhost:3000/wishlist/1', wishlist);
    await fetchWishlist();
  } catch (error) {
    console.error('Lỗi khi cập nhật danh sách yêu thích:', error);
    alert('Có lỗi xảy ra, vui lòng thử lại.');
  }
};

const readCoupons = async () => {
  try {
    const res = await axios.get('http://localhost:3000/coupons')
    coupons.value = res.data
  } catch (err) {
    console.error('Error coupons:', err)
  }
}

const copyCode = (code) => {
  navigator.clipboard.writeText(code)
  alert(`Đã sao chép mã: ${code}`)
}

const readCategory = async () => {
  try {
    const res = await axios.get('http://localhost:3000/categories')
    category.value = res.data
  } catch (err) {
    console.error('Error category:', err)
  }
}

// 2. Cập nhật hàm readProduct để có thể lọc theo cả danh mục và tìm kiếm
const readProduct = async () => {
  try {
    let url = new URL('http://localhost:3000/products');
    if (selectedCategoryId.value) {
      url.searchParams.append('categoryId', selectedCategoryId.value);
    }
    if (searchQuery.value) {
      url.searchParams.append('name_like', searchQuery.value);
    }
    const res = await axios.get(url.toString());
    products.value = res.data;
    sortProducts();
  } catch (err) {
    console.error('Error product:', err);
  }
}

// 3. Thêm hàm mới để xử lý việc click vào danh mục
const filterByCategory = (categoryId) => {
  selectedCategoryId.value = categoryId;
  readProduct(); // Gọi lại hàm đọc sản phẩm với bộ lọc mới
}

const searchProduct = () => {
  readProduct()
}

const sortProducts = () => {
  let sorted = [...products.value]
  switch (sortOption.value) {
    case 'Từ A -> Z':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }))
      break
    case 'Từ Z -> A':
      sorted.sort((a, b) => b.name.localeCompare(a.name, 'vi', { sensitivity: 'base' }))
      break
    case 'Giá tăng dần':
      sorted.sort((a, b) => (a.discount || a.price) - (b.discount || b.price))
      break
    case 'Giá giảm dần':
      sorted.sort((a, b) => (b.discount || b.price) - (a.discount || a.price))
      break
    default:
  }
  products.value = sorted
}

onMounted(() => {
  readCategory()
  readProduct()
  readCoupons()
  fetchWishlist()
})

watch(sortOption, () => {
  sortProducts()
})
</script>

<template>
  <div class="container-fluid my-5">
    <div class="row">
      <div class="col-lg-3 mb-4">
        <div class="p-3 border rounded shadow-sm bg-white">
          <h5 class="fw-bold mb-3">Tìm kiếm</h5>
          <form class="input-group mb-3" @submit.prevent>
            <input v-model="searchQuery" type="text" class="form-control" placeholder="Nhập tên sản phẩm..." />
            <button type="button" class="btn btn-dark" @click="searchProduct">
              <i class="fa fa-search"></i>
            </button>
          </form>

          <h5 class="fw-bold mt-4 mb-3">Danh mục sản phẩm</h5>
          <ul class="list-unstyled sidebar-menu mb-4">
            <li>
              <a href="#" @click.prevent="filterByCategory(null)" class="text-decoration-none text-dark d-block py-2"
                :class="{ 'fw-bold': selectedCategoryId === null }">
                Tất cả sản phẩm
              </a>
            </li>
            <li v-for="value in category" :key="value.id">
              <a href="#" @click.prevent="filterByCategory(value.id)"
                class="text-decoration-none text-dark d-block py-2"
                :class="{ 'fw-bold': selectedCategoryId === value.id }">
                {{ value.nameCategory }}
              </a>
            </li>
          </ul>

          <h5 class="fw-bold mt-4 mb-3">
            <i class="fa fa-ticket-alt me-2 text-secondary"></i> Mã giảm giá
          </h5>
          <div class="d-flex flex-column gap-2">
            <div v-for="coupon in coupons" :key="coupon.id" class="coupon-card small">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="fw-bold text-primary text-uppercase">{{ coupon.code }}</span>
                  <div class="text-muted" style="font-size: 12px;">
                    HSD: {{ new Date(coupon.expiry_date).toLocaleDateString('vi-VN') }}
                  </div>
                </div>
                <span class="badge bg-danger ms-2">{{ coupon.discount }}%</span>
              </div>
              <button class="btn btn-sm btn-outline-danger w-100 mt-2" @click="copyCode(coupon.code)">
                Sao chép mã
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-9">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <!-- <p class="mb-0 text-muted">Hiển thị {{ products.length }} sản phẩm</p> -->
          <h3>Sản phẩm</h3>
          <select v-model="sortOption" class="form-select w-auto">
            <option selected>Sắp xếp mặc định</option>
            <option>Từ A -> Z</option>
            <option>Từ Z -> A</option>
            <option>Giá tăng dần</option>
            <option>Giá giảm dần</option>
          </select>
        </div>

        <div class="row g-4">
          <div class="col-12 col-sm-6 col-md-4 col-lg-3" v-for="item in products" :key="item.id">
            <div class="card border-0 shadow-sm h-100">
              <router-link :to="`/productDetail/${item.id}`" class="text-decoration-none text-dark">
                <div class="position-relative">
                  <img :src="item.image[0]" class="card-img-top" alt="product" />
                  <span v-if="item.discount < item.price"
                    class="badge bg-danger position-absolute top-0 start-0 m-2 px-2 py-1" style="font-size: 0.8rem;">
                    Giảm giá!
                  </span>
                </div>

                <div class="card-body text-center">
                  <p class="text-secondary small mb-1">
                    {{category.find(c => c.id === item.categoryId)?.nameCategory || 'Không có'}}
                  </p>
                  <h6 class="fw-semibold">{{ item.name }}</h6>

                  <template v-if="item.discount < item.price">
                    <p class="text-muted text-decoration-line-through small mb-1">
                      {{ Number(item.price).toLocaleString('vi-VN') }} ₫
                    </p>
                    <p class="fw-bold mb-1 text-danger">
                      {{ Number(item.discount).toLocaleString('vi-VN') }} ₫
                    </p>
                  </template>

                  <template v-else>
                    <p class="fw-bold text-danger mb-0">
                      {{ Number(item.price).toLocaleString('vi-VN') }} ₫
                    </p>
                  </template>
                </div>
              </router-link>
              <div class="card-footer bg-transparent border-0 d-flex justify-content-center gap-2 pb-3">
                <div class="card-footer bg-transparent border-0 d-flex justify-content-center gap-2 pb-3">
                  <button class="btn btn-outline-success px-4 py-2" @click="addToCart(item)">
                    Mua<i class="fa fa-shopping-cart"></i>
                  </button>
                  <button class="btn px-4 py-2" @click="toggleWishlist(item)"
                    :class="isInWishlist(item.id) ? 'btn-danger' : 'btn-outline-danger'">
                    <i class="fa me-2" :class="isInWishlist(item.id) ? 'fa-heart-crack' : 'fa-heart'"></i>
                    {{ isInWishlist(item.id) ? 'Bỏ yêu thích' : 'Yêu thích' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p v-if="products.length === 0" class="text-center text-muted mt-4">
          Không tìm thấy sản phẩm nào
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* === Sidebar Menu === */
.sidebar-menu li a.fw-bold {
  color: #ce6b02 !important;
}
.sidebar-menu li a:hover {
  color: #000;
  font-weight: 500;
}

/* === Product Card Styling === */
.card {
  border: none;
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.25s ease;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
}

/* === Product Image === */
.card img {
  height: 250px;
  width: 100%;
  object-fit: cover;
  border-bottom: 1px solid #f1f1f1;
  transition: transform 0.3s ease;
}

.card:hover img {
  transform: scale(1.06);
}

/* === Card Body === */
.card-body {
  padding: 12px 10px 4px;
}

.card-body h6 {
  font-size: 0.95rem;
  font-weight: 600;
  min-height: 40px;
  color: #333;
}

.card-body p {
  margin: 0;
}

.card-body .text-secondary {
  font-size: 13px;
}

.card-body .fw-bold {
  font-size: 15px;
}

/* === Price Display === */
.text-decoration-line-through {
  font-size: 13px;
  color: #999;
}
.fw-bold.text-danger {
  font-size: 16px;
}

/* === Buttons Area === */
.card-footer {
  background-color: transparent;
  border: none;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 0;
  padding-bottom: 14px;
}

/* === Buttons === */
.btn {
  font-size: 13px;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-outline-success {
  color: #28a745;
  border-color: #28a745;
}

.btn-outline-success:hover {
  background-color: #28a745;
  color: #fff;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: #fff;
}

.btn-danger {
  background-color: #dc3545;
  color: #fff;
  border: 1px solid #dc3545;
}

.btn-danger:hover {
  background-color: #b32d39;
}

/* === Discount Badge === */
.badge.bg-danger {
  font-size: 12px !important;
  padding: 4px 8px !important;
  border-radius: 6px !important;
}

/* === Coupon Card (giữ nguyên, chỉ nhẹ hơn) === */
.coupon-card {
  background-color: #faf9f8;
  border: 1px solid #dee2e6;
  border-left: 4px solid #ce6b02;
  border-radius: 10px;
  padding: 10px 12px;
  transition: all 0.2s ease;
}

.coupon-card:hover {
  background-color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.coupon-card .badge {
  font-size: 11px;
  padding: 4px 6px;
}

.coupon-card .btn {
  font-size: 13px;
  padding: 4px 0;
}
</style>
