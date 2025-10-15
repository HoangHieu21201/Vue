
import { createApp } from "vue";
import App from "./App.vue";
import router from "../router/index.js";
import store from "./store";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const app = createApp(App);
const options = {
    position: "top-right",
    timeout: 4000, // Thông báo tự tắt sau 4 giây
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
};
app.use(router);
app.use(store);
app.use(Toast, options);
app.mount("#app");