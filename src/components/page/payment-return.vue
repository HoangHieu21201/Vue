<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import axios from 'axios';

const route = useRoute();
const store = useStore();
const message = ref('Đang xử lý kết quả thanh toán...');
const status = ref('processing');
const orderId = ref(null);

const updateOrderStatus = async (id, newStatus, note) => {
    try {
        const { data: order } = await axios.get(`http://localhost:3000/orders/${id}`);
        order.status = newStatus;
        order.paymentInfo = note;
        await axios.put(`http://localhost:3000/orders/${id}`, order);
    } catch (error) {
        console.error(`Lỗi khi cập nhật đơn hàng #${id}:`, error);
    }
};

const deleteOrder = async (id) => {
    try {
        await axios.delete(`http://localhost:3000/orders/${id}`);
    } catch (error) {
        console.error(`Lỗi khi xoá đơn hàng #${id}:`, error);
    }
};

onMounted(() => {
    const query = route.query;
    orderId.value = query.vnp_TxnRef;

    if (query.vnp_ResponseCode === '00') {
        status.value = 'success';
        message.value = `Giao dịch thành công! Cảm ơn bạn đã mua hàng.`;
        updateOrderStatus(orderId.value, 'Đã thanh toán', 'Thanh toán thành công qua VNPay.');
        store.dispatch('cart/deleteAllCart'); 
    }
    else {
        status.value = 'failed';
        message.value = `Giao dịch đã bị hủy. Sản phẩm của bạn vẫn còn trong giỏ hàng.`;
        deleteOrder(orderId.value);
    }
});
</script>

<template>
    <div class="container my-5">
        <div class="card shadow-sm border-0">
            <div class="card-body text-center p-5">
                <i v-if="status === 'success'" class="fa fa-check-circle text-success fa-4x mb-3"></i>
                <i v-else-if="status === 'failed'" class="fa fa-times-circle text-danger fa-4x mb-3"></i>

                <h2 v-if="status === 'success'" class="fw-bold">Thanh toán thành công!</h2>
                <h2 v-else-if="status === 'failed'" class="fw-bold">Thanh toán thất bại</h2>

                <p class="text-muted fs-5 mt-3">{{ message }}</p>
                <p v-if="orderId && status === 'success'" class="text-muted">Mã đơn hàng của bạn là: <strong>#{{ orderId }}</strong></p>

                <div class="mt-4">
                    <router-link to="/shop" class="btn btn-dark me-2">Tiếp tục mua sắm</router-link>
                    <router-link v-if="status === 'failed'" to="/cart" class="btn btn-outline-dark">Quay về giỏ hàng</router-link>
                    <router-link v-else to="/order-history" class="btn btn-outline-dark">Xem lịch sử đơn hàng</router-link>
                </div>
            </div>
        </div>
    </div>
</template>