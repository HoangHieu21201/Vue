<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { RouterLink } from 'vue-router';

const store = useStore();

const cart = computed(() => store.getters['cart/cartItems']);
const subtotal = computed(() => store.getters['cart/cartTotal']);
const total = computed(() => store.getters['cart/cartTotal']);

const decrease = (item) => {
    store.dispatch('cart/decreaseQuantity', item.id);
};

const increase = (item) => {
    store.dispatch('cart/increaseQuantity', item.id);
};

const deleteCartItem = (itemId) => {
    if (confirm('Bạn có chắc chắn muốn xoá sản phẩm này không?')) {
        store.dispatch('cart/deleteCart', itemId);
    }
};

const deleteAllCart = () => {
    if (confirm('Bạn có chắc chắn muốn xoá toàn bộ giỏ hàng không?')) {
        store.dispatch('cart/deleteAllCart');
    }
};
</script>


<template>
    <div class="container my-5">
        <h2 class="fw-bold mb-4 text-center">🛒 Giỏ hàng</h2>

        <div class="text-center text-muted py-5" v-if="!cart.length">
            <i class="fa fa-shopping-cart fa-3x mb-3"></i>
            <p>Giỏ hàng của bạn đang trống</p>
            <RouterLink to="/" class="btn btn-dark">Continue Shopping</RouterLink>
        </div>

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
                                <tr v-for="item in cart" :key="item.id">
                                    <td>
                                        <div class="d-flex align-items-center text-start">
                                            <img :src="item.image[0]" class="rounded me-3 border" width="70" />
                                            <div>
                                                <h6 class="mb-0">{{ item.name }}</h6>
                                                <small class="text-muted">Danh mục: {{ item.category }}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="text-danger fw-semibold">{{
                                            Number(item.discount).toLocaleString('vi-VN') }} ₫</span><br />
                                        <small class="text-muted text-decoration-line-through">{{
                                            Number(item.price).toLocaleString('vi-VN') }} ₫</small>
                                    </td>
                                    <td>
                                        <div class="input-group input-group-sm mx-auto" style="width: 120px;">
                                            <button @click="decrease(item)" class="btn btn-outline-dark">-</button>
                                            <input :value="item.quantity" type="number" class="form-control text-center"
                                                min="1" max="100" readonly />
                                            <button @click="increase(item)" class="btn btn-outline-dark">+</button>
                                        </div>
                                    </td>
                                    <td class="fw-semibold">{{ (item.discount * item.quantity).toLocaleString('vi-VN')
                                        }} ₫</td>
                                    <td>
                                        <button @click="deleteCartItem(item.id)" class="btn btn-sm btn-danger">
                                            <i class="fa fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="text-end mt-3" v-if="cart.length">
                    <button @click="deleteAllCart" class="btn btn-outline-danger btn-sm">
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
                            <span>{{ subtotal.toLocaleString('vi-VN') }} ₫</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Phí vận chuyển</span>
                            <span class="text-success">Miễn phí</span>
                        </div>
                        <hr />
                        <div class="d-flex justify-content-between fw-bold">
                            <span>Tổng cộng</span>
                            <span class="text-danger">{{ total.toLocaleString('vi-VN') }} ₫</span>
                        </div>
                        <RouterLink to="/checkout" class="btn btn-dark w-100 mt-4 fw-semibold">Thanh toán</RouterLink>
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

input[type="number"] {
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
</style>