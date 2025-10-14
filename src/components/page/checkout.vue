<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const cart = computed(() => store.getters['cart/cartItems']);
const total = computed(() => store.getters['cart/cartTotal']);

const customerName = ref('');
const customerAddress = ref('');
const customerPhone = ref('');

const placeOrder = async () => {
    if (!customerName.value || !customerAddress.value || !customerPhone.value) {
        alert('Vui lòng điền đầy đủ thông tin giao hàng.');
        return;
    }

    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedUser) {
        router.push('/login');
        return;
    }

    const order = {
        userId: loggedUser.id,
        customerName: customerName.value,
        customerAddress: customerAddress.value,
        customerPhone: customerPhone.value,
        items: cart.value,
        total: total.value,
        status: 'Chờ xác nhận',
        createdAt: new Date().toISOString()
    };

    try {
        console.log('Order placed:', order);
        
        await fetch('http://localhost:3000/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });


        store.dispatch('cart/deleteAllCart');
        alert('Đặt hàng thành công!');
        router.push('/profile'); 
    } catch (error) {
        console.error('Failed to place order:', error);
        alert('Đặt hàng thất bại, vui lòng thử lại.');
    }
};
</script>

<template>
    <div class="container my-5">
        <h2 class="fw-bold mb-4 text-center">Thanh toán</h2>
        <div class="row g-4">
            <div class="col-lg-7">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <h5 class="fw-bold mb-3">Thông tin giao hàng</h5>
                        <form @submit.prevent="placeOrder">
                            <div class="mb-3">
                                <label for="customerName" class="form-label">Họ và tên</label>
                                <input type="text" v-model="customerName" class="form-control" id="customerName" required>
                            </div>
                            <div class="mb-3">
                                <label for="customerAddress" class="form-label">Địa chỉ</label>
                                <input type="text" v-model="customerAddress" class="form-control" id="customerAddress" required>
                            </div>
                            <div class="mb-3">
                                <label for="customerPhone" class="form-label">Số điện thoại</label>
                                <input type="tel" v-model="customerPhone" class="form-control" id="customerPhone" required>
                            </div>
                            <button type="submit" class="btn btn-dark w-100 fw-semibold">Đặt hàng (COD)</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-lg-5">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <h5 class="fw-bold mb-3">Đơn hàng của bạn</h5>
                        <div v-for="item in cart" :key="item.id" class="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <h6 class="mb-0 small">{{ item.name }}</h6>
                                <small class="text-muted">SL: {{ item.quantity }}</small>
                            </div>
                            <span class="fw-semibold small">{{ (item.discount * item.quantity).toLocaleString('vi-VN') }} ₫</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between fw-bold">
                            <span>Tổng cộng</span>
                            <span class="text-danger">{{ total.toLocaleString('vi-VN') }} ₫</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>