<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router'
import axios from 'axios';

const product = ref(null)
const route = useRoute()
const categories = ref([])
const relatedProducts = ref([])
const isFavorited = ref(false);

const checkFavoriteStatus = async () => {
    if (!product.value) return;
    try {
        const response = await axios.get('http://localhost:3000/wishlist/1');
        isFavorited.value = response.data.products.some(p => p.id === product.value.id);
    } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
        isFavorited.value = false;
    }
};

const toggleWishlist = async () => {
    if (!product.value) return;
    try {
        const { data: wishlist } = await axios.get('http://localhost:3000/wishlist/1');
        const productIndex = wishlist.products.findIndex(p => p.id === product.value.id);

        if (productIndex !== -1) {
            wishlist.products.splice(productIndex, 1);
            alert('Đã xóa khỏi danh sách yêu thích');
        } else {
            wishlist.products.push({
                id: product.value.id,
                name: product.value.name,
                image: product.value.image,
                price: product.value.price,
                discount: product.value.discount
            });
            alert('Đã thêm vào danh sách yêu thích');
        }

        await axios.put('http://localhost:3000/wishlist/1', wishlist);
        await checkFavoriteStatus(); // Cập nhật lại trạng thái nút bấm
    } catch (error) {
        console.error('Lỗi khi cập nhật danh sách yêu thích:', error);
        alert('Có lỗi xảy ra, vui lòng thử lại.');
    }
};

const readProductDetail = async () => {
    try {
        const res = await axios.get(`http://localhost:3000/products/${route.params.id}`)
        product.value = res.data
        if (product.value?.categoryId) {
            await readRelatedProducts(product.value.categoryId)
        }
        await checkFavoriteStatus();
    } catch (err) {
        console.error('Err: ', err)
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

const addToCart = async () => {
    if (!product.value) return;
    try {
        const { data: existingItems } = await axios.get(`http://localhost:3000/cart?id=${product.value.id}`);
        const existingItem = existingItems[0];
        if (existingItem) {
            await axios.patch(`http://localhost:3000/cart/${existingItem.id}`, {
                quantity: existingItem.quantity + 1
            });
            alert('Đã cập nhật số lượng sản phẩm trong giỏ hàng!');
        } else {
            const cartItem = {
                ...product.value,
                quantity: 1
            };
            await axios.post('http://localhost:3000/cart', cartItem);
            alert('Đã thêm sản phẩm vào giỏ hàng!');
        }
    } catch (err) {
        console.error('Lỗi khi thêm vào giỏ hàng:', err);
        alert('Có lỗi xảy ra, vui lòng thử lại.');
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

                    <p class="text-secondary">{{ product.description }}</p>

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
                </div>
            </div>
        </div>

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

/* ========== PHẦN SẢN PHẨM LIÊN QUAN ========== */
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
    /* Cố định chiều cao ảnh */
    object-fit: cover;
    /* Cắt ảnh cho đều */
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
    /* Giúp tiêu đề đều dòng */
}

.related-price {
    color: #d32f2f;
    font-weight: bold;
    font-size: 16px;
}
</style>