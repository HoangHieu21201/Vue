<script setup>
import { ref } from 'vue';

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
                                <tr v-for="item in 3" :key="n">
                                    <td>
                                        <div class="d-flex align-items-center text-start">
                                            <img src="https://down-vn.img.susercontent.com/file/sg-11134201-7rbmj-m1cj7n2e9b2g8c"
                                                class="rounded me-3 border" width="70" />
                                            <div>
                                                <h6 class="mb-0">Áo Thun Nam Basic</h6>
                                                <small class="text-muted">Danh mục: Thời trang</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="text-danger fw-semibold">150.000 ₫</span><br />
                                        <small class="text-muted text-decoration-line-through">200.000 ₫</small>
                                    </td>
                                    <td>
                                        <div class="input-group input-group-sm mx-auto" style="width: 120px;">
                                            <button @click="decrease(item)" class="btn btn-outline-dark">-</button>
                                            <input v-model="item.quantity" type="number"
                                                class="form-control text-center" min="0" max="100" value="1" />
                                            <button @click="increase(item)" class="btn btn-outline-dark">+</button>
                                        </div>
                                    </td>
                                    <td class="fw-semibold">150.000 ₫</td>
                                    <td>
                                        <button class="btn btn-sm btn-danger">
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="text-end mt-3">
                    <button class="btn btn-outline-danger btn-sm">
                        <i class="fa fa-trash me-1"></i> Delete All
                    </button>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <h5 class="fw-bold mb-3">Order Summary</h5>

                        <div class="d-flex justify-content-between mb-2">
                            <span>Provisional</span>
                            <span>450.000 ₫</span>
                        </div>

                        <div class="d-flex justify-content-between mb-2">
                            <span>Shipping Fee</span>
                            <span class="text-success">Miễn phí</span>
                        </div>

                        <hr />

                        <div class="d-flex justify-content-between fw-bold">
                            <span>Total</span>
                            <span class="text-danger">450.000 ₫</span>
                        </div>

                        <button class="btn btn-dark w-100 mt-4 fw-semibold">Pay Now</button>
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
