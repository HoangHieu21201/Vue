// src/store/index.js
import { createStore } from 'vuex';
import cart from './modules/cart'; // 👈 Đảm bảo đã import module cart

export default createStore({
  modules: {
    cart // 👈 Và đăng ký module ở đây
  }
});