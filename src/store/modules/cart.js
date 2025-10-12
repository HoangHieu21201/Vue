const state = {
    cart: []
};

const getters = {
    cartItems: state => state.cart,
    cartTotal: state => {
        return state.cart.reduce((total, product) => {
            return total + product.discount * product.quantity;
        }, 0);
    }
};

const actions = {
    addProductToCart({ commit }, product) {
        commit('ADD_TO_CART', product);
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

const mutations = {
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

export default {
    state,
    getters,
    actions,
    mutations
};