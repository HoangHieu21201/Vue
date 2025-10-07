<template>
    <div class="admin-layout d-flex flex-column min-vh-100 bg-light text-dark">
        <div class="d-flex flex-grow-1">
            <!-- Sidebar -->
            <aside class="sidebar bg-dark text-white p-3">
                <router-link class="navbar-brand d-flex align-items-center" to="/">
                    <img src="https://www.accuratereviews.com/wp-content/uploads/2021/07/outfit-logo-padding.png"
                        alt="logo" width="110" class="me-2" />
                </router-link>
                <ul class="list-unstyled d-flex flex-column gap-2">
                    <li>
                        <router-link to="/admin/user" class="nav-link" active-class="active-link">
                            👤 Users
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/admin/categories" class="nav-link" active-class="active-link">
                            📦 Categories
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/admin/product" class="nav-link" active-class="active-link">
                            📦 Products
                        </router-link>
                    </li>
                </ul>

                <div class="mt-auto text-center pt-4 border-top border-secondary">
                    <router-link to="/" class="btn btn-outline-light btn-sm w-100">
                        ← Back to User Site
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
                &copy; 2025 <b>OutfitVN Admin</b> — All rights reserved.
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
    background-color: #222;
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
