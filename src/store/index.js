import { createStore } from 'vuex';
import cart from './modules/cart';
import wishlist from './modules/wishlist';

export default createStore({
  modules: {
    cart,
    wishlist
  }
});