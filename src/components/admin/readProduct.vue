<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const product = ref(null)
const categories = ref([])
const route = useRoute()

const readProduct = async () => {
    try {
        const res = await axios.get(`http://localhost:3000/products/${route.params.id}`)
        product.value = res.data
    } catch (err) {
        console.error("Err: ", err)
    }
}

const readCategories = async () => {
    try {
        const res = await axios.get(`http://localhost:3000/categories`)
        categories.value = res.data
    } catch (err) {
        console.error("Err: ", err)
    }
}

onMounted(() => {
    readProduct()
    readCategories()
})
</script>

<template>
    <div v-if="product" class="container py-5">
        <div class="card shadow-lg border-0 rounded-4 p-4">
            <!-- Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="fw-bold text-dark mb-0">
                    <i class="fa fa-box me-2 text-primary"></i>Chi tiết sản phẩm
                </h3>
                <button @click="$router.back()" class="btn btn-outline-dark">
                    <i class="fa fa-arrow-left me-2"></i>Quay lại
                </button>
            </div>

            <!-- Nội dung -->
            <div class="row g-4">
                <!-- Ảnh -->
                <div class="col-md-5 text-center">
                    <div class="main-image mb-3">
                        <img :src="product.image?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'"
                            alt="Ảnh sản phẩm" class="img-fluid rounded-4 border"
                            style="max-height: 300px; object-fit: cover;" />
                    </div>
                    <div class="d-flex justify-content-center flex-wrap gap-2">
                        <img v-for="(img, idx) in product.image" :key="idx" :src="img" class="thumb border rounded"
                            style="width: 70px; height: 70px; object-fit: cover; cursor: pointer;" />
                    </div>
                </div>

                <!-- Thông tin -->
                <div class="col-md-7">
                    <h4 class="fw-bold mb-3"> {{ product.name }}</h4>
                    <div class="mb-3">
                        <span class="text-muted">Danh mục:</span>
                        <strong> {{(categories.find(c => c.id === product.categoryId)?.nameCategory) ?? "Không có"
                            }}</strong>
                    </div>

                    <div class="mb-3">
                        <span class="text-muted">Trạng thái:</span>
                        <span class="badge bg-success rounded-pill ms-2"> {{ product.status }}</span>
                    </div>

                    <div class="mb-3">
                        <span class="text-muted">Giá gốc:</span>
                        <strong class="text-dark"> {{ Number(product.price).toLocaleString('vi-VN') }} ₫</strong>
                    </div>

                    <div class="mb-3">
                        <span class="text-muted">Giá khuyến mãi:</span>
                        <strong class="text-danger"> {{ Number(product.discount).toLocaleString('vi-VN') }} ₫</strong>
                        <small class="text-muted"> -{{ Math.round(100 - (product.discount / product.price) * 100)
                            }}%</small>
                    </div>

                    <div class="mb-3">
                        <span class="text-muted">Số lượng:</span>
                        <strong> {{ product.quantity }}</strong>
                    </div>

                    <hr />

                    <div>
                        <h6 class="fw-bold mb-2">Mô tả sản phẩm</h6>
                        <p class="text-muted" style="white-space: pre-line;">
                            {{ product.description }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    background: #fff;
}

.thumb:hover {
    transform: scale(1.05);
    transition: 0.2s ease;
    border-color: #000 !important;
}

.btn-outline-dark:hover {
    background: #000;
    color: #fff;
    transition: 0.2s ease;
}
</style>
