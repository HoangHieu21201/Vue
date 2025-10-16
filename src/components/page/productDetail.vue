<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { toast } from "vue3-toastify";


const Toast = useToast();
const product = ref(null)
const route = useRoute()
const router = useRouter()
const store = useStore();
const categories = ref([])
const relatedProducts = ref([])
const isFavorited = ref(false);

const getLoggedInUser = () => {
    const user = localStorage.getItem('loggedInUser');
    return user ? JSON.parse(user) : null;
};

const checkFavoriteStatus = async () => {
    if (!product.value) return;
    const user = getLoggedInUser();
    if (!user) {
        isFavorited.value = false;
        return;
    }

    try {
        const { data: userWishlists } = await axios.get(`http://localhost:3000/wishlist?userId=${user.id}`);
        if (userWishlists.length > 0) {
            const userWishlist = userWishlists[0];
            isFavorited.value = userWishlist.products.some(p => p.id === product.value.id);
        } else {
            isFavorited.value = false;
        }
    } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
        isFavorited.value = false;
    }
};

const isTogglingWishlist = ref(false);

const toggleWishlist = async () => {
    if (isTogglingWishlist.value || !product.value) return;

    const user = getLoggedInUser();
    if (!user) {
        Toast.error('Bạn cần đăng nhập để sử dụng chức năng này!', { theme: "colored" });
        router.push('/login');
        return;
    }

    isTogglingWishlist.value = true;

    try {
        const { data: userWishlists } = await axios.get(`http://localhost:3000/wishlist?userId=${user.id}`);
        let actionMessage = ''; // Biến lưu thông báo duy nhất

        if (userWishlists.length > 0) {
            let userWishlist = userWishlists[0];
            const productIndex = userWishlist.products.findIndex(p => p.id === product.value.id);

            if (productIndex !== -1) {
                userWishlist.products.splice(productIndex, 1);
                actionMessage = 'Đã xóa khỏi danh sách yêu thích';
            } else {
                const { id, name, image, price, discount } = product.value;
                userWishlist.products.push({ id, name, image, price, discount });
                actionMessage = 'Đã thêm vào danh sách yêu thích';
            }

            await axios.put(`http://localhost:3000/wishlist/${userWishlist.id}`, userWishlist);
        } else {
            const { id, name, image, price, discount } = product.value;
            const newWishlist = {
                userId: user.id,
                products: [{ id, name, image, price, discount }]
            };
            await axios.post('http://localhost:3000/wishlist', newWishlist);
            actionMessage = 'Đã thêm vào danh sách yêu thích';
        }

        isFavorited.value = !isFavorited.value;
        if (isFavorited.value) {
            Toast.success(actionMessage, { theme: "colored" });
        } else {
            Toast.info(actionMessage, { theme: "colored" });
        }

    } catch (error) {
        console.error('Lỗi khi cập nhật danh sách yêu thích:', error);
    } finally {
        isTogglingWishlist.value = false;
    }
};


const readProductDetail = async () => {
    try {
        const res = await axios.get(`http://localhost:3000/products/${route.params.id}`)
        product.value = res.data
        if (product.value?.categoryId) {
            await readRelatedProducts(product.value.categoryId);
        }
        await checkFavoriteStatus();
    } catch (err) {
        console.error('Lỗi tải sản phẩm: ', err)
    }
}

const readCategories = async () => {
    try {
        const res = await axios.get(`http://localhost:3000/categories`)
        categories.value = res.data
    } catch (err) {
        console.error('Err: ', err)
    }
}

const readRelatedProducts = async (categoryId) => {
    try {
        const res = await axios.get(`http://localhost:3000/products?categoryId=${categoryId}`)
        relatedProducts.value = res.data.filter(p => p.id !== product.value.id)
    } catch (err) {
        console.error('Lỗi khi tải sản phẩm liên quan:', err)
    }
}

const addToCart = () => {
    if (!product.value) return;
    try {
        store.dispatch('cart/addProductToCart', product.value);
        Toast.success('Đã thêm sản phẩm vào giỏ hàng!', { theme: "colored" });
    } catch (err) {
        console.error('Lỗi khi thêm vào giỏ hàng:', err);
        Toast.error('Có lỗi xảy ra, vui lòng thử lại.', { theme: "colored" });
    }
}

onMounted(() => {
    readCategories()
    readProductDetail()
})

watch(() => route.params.id, () => {
    readProductDetail()
})
</script>

<template>
    <div v-if="product" class="container my-5">
        <div class="row g-4">
            <div class="col-md-6">
                <div class="border rounded p-3 bg-white shadow-sm">
                    <img :src="product.image[0]" class="img-fluid w-100 rounded mb-3 main-img" alt="product" />
                    <div class="d-flex gap-2">
                        <img v-for="(img, idx) in product.image" :key="idx" :src="img" class="img-thumbnail small-img"
                            alt="gallery" />
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="p-3">
                    <h2 class="fw-bold mb-2">{{ product.name }}</h2>

                    <p class="text-muted mb-1">
                        Danh mục:
                        {{categories.find(c => c.id === product.categoryId)?.nameCategory || "Không có"}}
                    </p>

                    <div class="mb-3">
                        <span class="text-muted text-decoration-line-through me-2">
                            {{ Number(product.price).toLocaleString('vi-VN') }} ₫
                        </span>
                        <span class="fw-bold text-danger fs-4">
                            {{ Number(product.discount).toLocaleString('vi-VN') }} ₫
                        </span>
                        <span class="badge bg-success ms-2">
                            -{{ Math.round(100 - (product.discount / product.price) * 100) }}%
                        </span>
                    </div>


                    <div class="mt-4 d-flex gap-3">
                        <button @click="addToCart" class="btn btn-dark px-4 py-2">
                            <i class="fa fa-shopping-cart me-2"></i>Thêm vào giỏ hàng
                        </button>

                        <button @click="toggleWishlist" class="btn px-4 py-2"
                            :class="isFavorited ? 'btn-danger' : 'btn-outline-danger'">
                            <i class="fa me-2" :class="isFavorited ? 'fa-heart-crack' : 'fa-heart'"></i>
                            {{ isFavorited ? 'Bỏ yêu thích' : 'Yêu thích' }}
                        </button>
                    </div>
                    <div class="mt-4">
                        <h3>Mô tả sản phẩm</h3>

                        <p class="text-secondary">{{ product.description }}</p>
                    </div>

                </div>
            </div>
        </div>
        <!-- bình luận -->
        <div class="mt-5">
            <h4 class="fw-bold mb-3 border-bottom pb-2">Bình luận</h4>
            <div class="fb-comments" :data-href="`http://localhost:5173/productDetail/${product.id}`" data-width="100%"
                data-numposts="5"></div>
        </div>
        <!-- Sản phẩm liên quan -->
        <div v-if="relatedProducts.length" class="mt-5">
            <h4 class="fw-bold mb-3 border-bottom pb-2">Sản phẩm liên quan</h4>
            <div class="related-products">
                <div v-for="item in relatedProducts" :key="item.id" class="related-card">
                    <router-link :to="`/productDetail/${item.id}`">
                        <img :src="item.image[0]" class="related-img" alt="related" />
                    </router-link>
                    <div class="related-body">
                        <h6 class="related-title text-truncate">{{ item.name }}</h6>
                        <p class="related-price mb-0">
                            {{ Number(item.discount).toLocaleString('vi-VN') }} ₫
                        </p>
                        <router-link :to="`/productDetail/${item.id}`" class="btn btn-primary">
                            Xem chi tiết
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <p v-else class="text-center text-muted mt-5">Loading Product...</p>
</template>

<style scoped>
.main-img {
    height: 400px;
    object-fit: cover;
}

.small-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    cursor: pointer;
    transition: 0.3s;
}

.small-img:hover {
    transform: scale(1.05);
    border-color: #000;
}

.hover-card {
    transition: 0.3s;
}

.hover-card:hover {
    transform: translateY(-5px);
}

@media (max-width: 768px) {
    .main-img {
        height: 300px;
    }
}

.related-products {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
}

.related-card {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.related-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
}

.related-img {
    width: 100%;
    height: 220px;
    object-fit: cover;
}

.related-body {
    padding: 15px;
    text-align: center;
    flex-grow: 1;
}

.related-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #222;
    min-height: 40px;
}

.related-price {
    color: #d32f2f;
    font-weight: bold;
    font-size: 16px;
}
</style>