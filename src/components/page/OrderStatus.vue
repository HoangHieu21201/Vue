<script setup>
// src/components/page/OrderStatus.vue
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const message = ref('Đang xử lý...');
const status = ref('processing');
const orderId = ref(null);

onMounted(() => {
    const query = route.query;
    status.value = query.status;
    orderId.value = query.orderId;

    if (status.value === 'success') {
        message.value = `Đặt hàng thành công! Cảm ơn bạn đã mua hàng.`;
    } else {
        message.value = `Đặt hàng thất bại. Đã có lỗi xảy ra, vui lòng thử lại sau.`;
    }
});
</script>

<template>
    <div class="container my-5">
        <div class="card shadow-sm border-0">
            <div class="card-body text-center p-5">
                <i v-if="status === 'success'" class="fa fa-check-circle text-success fa-4x mb-3"></i>
                <i v-else-if="status === 'failed'" class="fa fa-times-circle text-danger fa-4x mb-3"></i>

                <h2 v-if="status === 'success'" class="fw-bold">Đặt hàng thành công!</h2>
                <h2 v-else-if="status === 'failed'" class="fw-bold">Đặt hàng thất bại</h2>

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