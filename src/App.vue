<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import userLayout from './layout/userLayout.vue';

const store = useStore();

// Khi component được tạo, gọi action để tải giỏ hàng
onMounted(() => {
  store.dispatch('cart/fetchCart');
});
</script>

<template>
  <router-view></router-view>
</template>