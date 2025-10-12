// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "../router/index.js";
import store from "./store"; // 👈 [QUAN TRỌNG] Phải import store ở đây

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

const app = createApp(App);

app.use(router);
app.use(store);

app.mount("#app");