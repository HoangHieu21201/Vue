import axios from 'axios';

const state = {
    cart: []
};

const mutations = {
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

    async addProductToCart({ dispatch }, product) {
        try {
            await axios.post('http://localhost:3000/cart', { ...product, quantity: 1 });
            dispatch('fetchCart');
        } catch (err) {
            console.error('Lỗi khi thêm sản phẩm:', err);
        }
    },

    async deleteCart({ commit }, productId) {
        try {
            await axios.delete(`http://localhost:3000/cart/${productId}`);
            commit('DELETE_CART', productId);
        } catch (err) {
            console.error('Lỗi khi xoá sản phẩm:', err);
        }
    },
    async deleteAllCart({ commit }) {
        try {
            const { data: cartItems } = await axios.get('http://localhost:3000/cart');

            if (cartItems.length === 0) {
                commit('DELETE_ALL_CART');
                return;
            }

            const deletePromises = cartItems.map(item =>
                axios.delete(`http://localhost:3000/cart/${item.id}`)
            );

            await Promise.all(deletePromises);

        } catch (error) {
            console.error('Lỗi khi xóa toàn bộ giỏ hàng:', error);
        } finally {
            commit('DELETE_ALL_CART');
        }
    },

    async decreaseQuantity({ commit, state }, productId) {
        const item = state.cart.find(p => p.id === productId);
        if (item && item.quantity > 1) {
            try {
                await axios.patch(`http://localhost:3000/cart/${productId}`, { quantity: item.quantity - 1 });
                commit('DECREASE_QUANTITY', productId);
            } catch (err) {
                console.error('Lỗi khi giảm số lượng:', err);
            }
        }
    },

    async increaseQuantity({ commit, state }, productId) {
        const item = state.cart.find(p => p.id === productId);
        if (item) {
            try {
                await axios.patch(`http://localhost:3000/cart/${productId}`, { quantity: item.quantity + 1 });
                commit('INCREASE_QUANTITY', productId);
            } catch (err) {
                console.error('Lỗi khi tăng số lượng:', err);
            }
        }
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