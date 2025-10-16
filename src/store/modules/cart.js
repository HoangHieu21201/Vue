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
            const quantityToAdd = product.quantity || 1;
            productInCart.quantity += quantityToAdd;
        } else {
            state.cart.push({ ...product, quantity: product.quantity || 1 });
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
            const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
            if (!loggedUser) return;

            const { data } = await axios.get(`http://localhost:3000/cart?userId=${loggedUser.id}`);
            commit('SET_CART', data);
        } catch (err) {
            console.error('Lỗi khi tải giỏ hàng:', err);
        }
    },

    async addProductToCart({ commit, state, dispatch }, product) {
        const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!loggedUser) {
            alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
            return;
        }

        const productInCart = state.cart.find(item => item.id === product.id);
        const quantityToAdd = product.quantity || 1; 

        try {
            if (productInCart) {
                const newQuantity = productInCart.quantity + quantityToAdd;
                await axios.patch(`http://localhost:3000/cart/${productInCart.id}`, { quantity: newQuantity });
            } else {
                await axios.post('http://localhost:3000/cart', {
                    ...product,
                    quantity: quantityToAdd,
                    userId: loggedUser.id 
                });
            }
            await dispatch('fetchCart');
        } catch (err) {
            console.error('Lỗi khi thêm vào giỏ hàng:', err);
        }
    },

    async deleteCart({ commit }, productId) {
        try {
            await axios.delete(`http://localhost:3000/cart/${productId}`);
            commit('DELETE_CART', productId);
        } catch (err) {
            console.error('Lỗi khi xóa sản phẩm:', err);
        }
    },

    async deleteAllCart({ commit, state }) {
        try {
            const deletePromises = state.cart.map(item =>
                axios.delete(`http://localhost:3000/cart/${item.id}`)
            );
            await Promise.all(deletePromises);
            commit('DELETE_ALL_CART');
        } catch (error) {
            console.error('Lỗi khi xóa toàn bộ giỏ hàng:', error);
        }
    },

    async decreaseQuantity({ commit, state }, productId) {
        const item = state.cart.find(p => p.id === productId);
        if (item && item.quantity > 1) {
            try {
                await axios.patch(`http://localhost:3000/cart/${item.id}`, { quantity: item.quantity - 1 });
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
                await axios.patch(`http://localhost:3000/cart/${item.id}`, { quantity: item.quantity + 1 });
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
            // Sửa lại công thức tính tổng tiền cho đúng
            const price = product.discount || product.price; // Ưu tiên giá khuyến mãi
            return total + (price * product.quantity);
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