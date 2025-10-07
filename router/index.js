import { createRouter, createWebHistory } from "vue-router";

// layout
import userLayout from "../src/layout/userLayout.vue";
import adminLayout from "../src/layout/adminLayout.vue";

// user pages
import home from "../src/components/page/home.vue";
import about from "../src/components/page/about.vue";
import login from "../src/components/page/login.vue";
import register from "../src/components/page/Register.vue";
import shop from "../src/components/page/shop.vue";
import productDetail from "../src/components/page/productDetail.vue";
import profile from "../src/components/page/profile.vue";
import cart from "../src/components/page/cart.vue";

// admin pages
import categories from "../src/components/admin/categories.vue";
import CRUDUser from "../src/components/admin/CRUDUser.vue";
import product from "../src/components/admin/product.vue";
import readProduct from "../src/components/admin/readProduct.vue";

import NotFound from "../src/components/page/NotFound.vue";

const routes = [
  {
    path: "/",
    component: userLayout,
    children: [
      { path: "", component: home },
      { path: "about", component: about },
      { path: "login", component: login },
      { path: "register", component: register },
      { path: "shop", component: shop },
      { path: "productDetail/:id", component: productDetail },
      { path: "profile", component: profile },
      { path: "cart", component: cart },
    ],
  },
  {
    path: "/admin",
    component: adminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: "", redirect: "/admin/user" },
      { path: "user", component: CRUDUser },
      { path: "categories", component: categories },
      { path: "product", component: product },
      { path: "readProduct/:id", component: readProduct },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (to.meta.requiresAdmin) {
    if (!loggedUser) {
      next("/login"); 
    } else if (loggedUser.role !== "admin") {
      next("/404"); 
    } else {
      next(); 
    }
  } else {
    next(); 
  }
});

export default router;
