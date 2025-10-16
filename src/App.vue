<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import userLayout from './layout/userLayout.vue';
import { toast } from "vue3-toastify";
// import "vue3-toastify/dist/index.css";
toast.success("Thành công", { theme: "colored" });



const store = useStore();

// Khi component được tạo, gọi action để tải giỏ hàng
onMounted(() => {
  store.dispatch('cart/fetchCart');
});
</script>

<template>
  <router-view></router-view>
</template>

<!-- <style scoped>
.Toastify__toast--success {
  background: #28a745 !important;
  color: #fff !important;
}

.Toastify__toast--error {
  background: #dc3545 !important;
  color: #fff !important;
}

.Toastify__toast--info {
  background: #17a2b8 !important;
}

.Toastify__toast--warning {
  background: #ffc107 !important;
}
</style> -->
