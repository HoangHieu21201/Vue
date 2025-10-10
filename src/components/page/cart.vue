<script setup>
import { ref } from 'vue';

const category = ref([])
const products = ref([])

const decrease = (item) => {
    if (item.quantity > 1) item.quantity--
}

const increase = (item) => {
    if (item.quantity < 100) item.quantity++
}
</script>

<template>
    <div class="container my-5">
        <h2 class="fw-bold mb-4 text-center">🛒 Your Cart</h2>

        <!-- Nếu giỏ hàng trống -->
        <div class="text-center text-muted py-5" v-if="false">
            <i class="fa fa-shopping-cart fa-3x mb-3"></i>
            <p>Giỏ hàng của bạn đang trống</p>
            <button class="btn btn-dark">Continue Shopping</button>
        </div>

        <!-- Danh sách sản phẩm -->
        <div class="row g-4" v-else>
            <div class="col-lg-8">
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-0">
                        <table class="table align-middle mb-0">
                            <thead class="table-dark text-center">
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody class="text-center">
                                <tr v-for="items in cart" :key="items.id">
                                    <td>
                                        <div class="d-flex align-items-center text-start">
                                            <img :src="items.image" class="rounded me-3 border" width="70" />
                                            <div>
                                                <h6 class="mb-0">{{ items.name }}</h6>
                                                <small class="text-muted">Danh mục: Thời trang</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="text-danger fw-semibold">{{
                                            Number(items.discount).toLocaleString('vi-VN') }} ₫</span><br />
                                        <small class="text-muted text-decoration-line-through">{{
                                            Number(items.price).toLocaleString('vi-VN') }} ₫</small>
                                    </td>
                                    <td>
                                        <div class="input-group input-group-sm mx-auto" style="width: 120px;">
                                            <button @click="decrease(items)" class="btn btn-outline-dark">-</button>
                                            <input v-model="items.quantity" type="number"
                                                class="form-control text-center" min="0" max="100" value="1" />
                                            <button @click="increase(items)" class="btn btn-outline-dark">+</button>
                                        </div>
                                    </td>
                                    <td class="fw-semibold">{{ (items.discount * items.quantity).toLocaleString('vi-VN')
                                    }} ₫</td>
                                    <td>
                                        <button @click="deleteCart(items.id)" class="btn btn-sm btn-danger">
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>  

                <div class="text-end mt-3" v-if="products.length">
                    <button class="btn btn-outline-danger btn-sm">
                        <i class="fa fa-trash me-1"></i> Xoá hết
                    </button>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <h5 class="fw-bold mb-3">Đơn hàng</h5>

                        <div class="d-flex justify-content-between mb-2">
                            <span>Tạm tính</span>
                            <span>450.000 ₫</span>
                        </div>

                        <div class="d-flex justify-content-between mb-2">
                            <span>Phí vận chuyển</span>
                            <span class="text-success">Miễn phí</span>
                        </div>

                        <hr />

                        <div class="d-flex justify-content-between fw-bold">
                            <span>Tổng cộng</span>
                            <span class="text-danger">450.000 ₫</span>
                        </div>

                        <button class="btn btn-dark w-100 mt-4 fw-semibold">Mua ngay</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
h2 {
    color: #222;
    letter-spacing: 0.5px;
}

table img {
    object-fit: cover;
    height: 70px;
}

input[type="text"] {
    border: 1px solid #ddd;
}

.card {
    border-radius: 12px;
    overflow: hidden;
    transition: 0.3s ease;
}

.card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>
