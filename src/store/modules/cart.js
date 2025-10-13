// src/store/modules/cart.js
import axios from 'axios';

const state = {
    cart: []
};

// Mutation để cập nhật state
const mutations = {
    // Thêm mutation này
    SET_CART(state, cartData) {
        state.cart = cartData;
    },

    ADD_TO_CART(state, product) {
        const productInCart = state.cart.find(item => item.id === product.id);
        if (productInCart) {
            productInCart.quantity++;
        } else {
            state.cart.push({ ...product, quantity: 1 });
        }
    },
    DELETE_CART(state, id) {
        state.cart = state.cart.filter(item => item.id !== id);
    },
    DELETE_ALL_CART(state) {
        state.cart = [];
    },
    DECREASE_QUANTITY(state, id) {
        const productInCart = state.cart.find(item => item.id === id);
        if (productInCart && productInCart.quantity > 1) {
            productInCart.quantity--;
        }
    },
    INCREASE_QUANTITY(state, id) {
        const productInCart = state.cart.find(item => item.id === id);
        if (productInCart && productInCart.quantity < 100) {
            productInCart.quantity++;
        }
    }
};

const actions = {
    async fetchCart({ commit }) {
        try {
            const { data } = await axios.get('http://localhost:3000/cart');
            commit('SET_CART', data); 
        } catch (err) {
            console.error('Lỗi khi tải giỏ hàng:', err);
        }
    },

    async addProductToCart({ commit }, product) {
        try {
            await axios.post('http://localhost:3000/cart', { ...product, quantity: 1 });
            commit('ADD_TO_CART', product);
        } catch (err) {
            console.error('Lỗi khi thêm sản phẩm:', err);
        }
    },
    deleteCart({ commit }, id) {
        commit('DELETE_CART', id);
    },
    deleteAllCart({ commit }) {
        commit('DELETE_ALL_CART');
    },
    decreaseQuantity({ commit }, id) {
        commit('DECREASE_QUANTITY', id);
    },
    increaseQuantity({ commit }, id) {
        commit('INCREASE_QUANTITY', id);
    }
};

const getters = {
    cartItems: state => state.cart,
    cartTotal: state => {
        return state.cart.reduce((total, product) => {
            return total + product.discount * product.quantity;
        }, 0);
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};