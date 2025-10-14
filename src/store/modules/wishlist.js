import axios from 'axios';

const state = {
  items: JSON.parse(localStorage.getItem('wishlist') || '[]')
};

const mutations = {
  SET_WISHLIST(state, wishlist) {
    state.items = wishlist;
    localStorage.setItem('wishlist', JSON.stringify(state.items));
  },
  ADD_TO_WISHLIST(state, product) {
    if (!state.items.some(item => item.id === product.id)) {
      state.items.push(product);
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    }
  },
  REMOVE_FROM_WISHLIST(state, productId) {
    state.items = state.items.filter(item => item.id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(state.items));
  }
};

const actions = {
  async fetchWishlist({ commit }) {
    try {
      const res = await axios.get('http://localhost:3000/wishlist');
      commit('SET_WISHLIST', res.data);
    } catch (err) {
      console.error('Lỗi tải wishlist:', err);
    }
  },

  async addToWishlist({ commit }, product) {
    try {
      await axios.post('http://localhost:3000/wishlist', product);
      commit('ADD_TO_WISHLIST', product);
    } catch (err) {
      console.error('Không thể thêm vào wishlist:', err);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    }
  },

  async removeFromWishlist({ commit }, productId) {
    try {
      await axios.delete(`http://localhost:3000/wishlist/${productId}`);
      commit('REMOVE_FROM_WISHLIST', productId);
    } catch (err) {
      console.error('Không thể xóa khỏi wishlist:', err);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
