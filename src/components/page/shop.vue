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

const readProduct = async () => {
  try {
    let url = 'http://localhost:3000/products'
    if (searchQuery.value) {
      url += `?name_like=${searchQuery.value}`
    }
    const res = await axios.get(url)
    products.value = res.data
    sortProducts()
  } catch (err) {
    console.error('Error product:', err)
  }
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
            <li v-for="value in category" :key="value.id">
              <a href="#" class="text-decoration-none text-dark d-block py-2">
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
          <p class="mb-0 text-muted">Hiển thị {{ products.length }} sản phẩm</p>
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
                <button class="btn btn-outline-success px-4 py-2" @click="addToCart(item)">
                  Mua<i class="fa fa-shopping-cart me-2"></i>
                </button>
                <button class="btn btn-outline-danger px-4 py-2" @click="toggleWishlist(item)"
                  :class="{ 'btn-danger': isInWishlist(item.id) }">
                  Yêu thích <i class="fa fa-heart me-2"></i>
                </button>
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
.sidebar-menu li a:hover {
  color: #000;
  font-weight: 500;
}

.card img {
  height: 260px;
  object-fit: cover;
  transition: 0.3s ease;
}

.card:hover img {
  transform: scale(1.05);
}

/* ==== Coupon style ==== */
.coupon-card {
  background-color: #faf9f8;
  border: 1px solid #dee2e6;
  border-left: 4px solid #ce6b02;
  border-radius: 8px;
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

.btn-danger {
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
}
</style>