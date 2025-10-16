<template>
    <div class="admin-layout d-flex flex-column min-vh-100 bg-light text-dark">
        <div class="d-flex flex-grow-1">
            <!-- Sidebar -->
            <aside class="sidebar bg-dark text-white p-3">
                <router-link class="navbar-brand d-flex align-items-center" to="/">
                    <img src="../assets/logovuong.jpg" alt="" width="30" style="border-radius: 50px; margin-right: 10px; margin-bottom: 10px;">
                    <span>figurecollector</span>
                </router-link>
                <ul class="list-unstyled d-flex flex-column gap-2">
                    <li>
                        <router-link to="/admin/user" class="nav-link" active-class="active-link">
                            👤 Tài khoản
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/admin/categories" class="nav-link" active-class="active-link">
                            📦 Danh mục
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/admin/product" class="nav-link" active-class="active-link">
                            <i class="fas fa-box"></i> Sản phẩm
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/admin/coupons" class="nav-link text-white" active-class="active-link" >
                            <i class="fas fa-tags me-2"></i>Coupons
                        </router-link>
                    </li>
                    <li class="nav-item">
                        <RouterLink to="/admin/orders" class="nav-link" active-class="active-link">
                            <i class="fas fa-receipt me-2"></i> Đơn hàng
                        </RouterLink>
                    </li>
                </ul>

                <div class="mt-auto text-center pt-4 border-top border-secondary">
                    <router-link to="/" class="btn btn-outline-light btn-sm w-100">
                        Trở về trang chủ
                    </router-link>
                </div>
            </aside>

            <!-- Main content -->
            <main class="flex-fill p-4 bg-white rounded-start shadow-sm">
                <router-view />

            </main>
        </div>

        <!-- Footer -->
        <footer class="admin-footer text-center py-3 mt-auto border-top">
            <p class="mb-0 small text-secondary">
                &copy; 2025 <b>figurecollector Admin</b> — Frontend.
            </p>
        </footer>
    </div>
</template>

<style scoped>
/* ====== GENERAL ====== */
.admin-layout {
    font-family: "Poppins", sans-serif;
    background-color: #f9f9f9;
}

/* ====== SIDEBAR ====== */
.sidebar {
    width: 230px;
    min-height: 100vh;
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    background: #111;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.nav-link {
    display: block;
    background-color: transparent;
    color: #ddd;
    font-weight: 500;
    border-radius: 8px;
    padding: 10px 12px;
    text-decoration: none;
    transition: 0.3s;
}

.nav-link:hover {
    background-color: #878787;
    color: #fff;
}

.active-link {
    background-color: #f8d210;
    color: #000 !important;
    font-weight: bold;
}

/* ====== MAIN CONTENT ====== */
main {
    background-color: #fff;
    border-radius: 12px;
    margin: 20px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}

/* ====== FOOTER ====== */
.admin-footer {
    background: #111;
    color: #bbb;
}

.admin-footer b {
    color: #f8d210;
}

/* ====== RESPONSIVE ====== */
@media (max-width: 991px) {
    .d-flex {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        height: auto;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        padding: 1rem;
    }

    .sidebar ul {
        flex-direction: row !important;
    }

    main {
        margin: 0;
        border-radius: 0;
    }
}
</style>
