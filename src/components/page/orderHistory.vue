<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const orders = ref([]);
const user = ref(null);

onMounted(async () => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedUser) {
        user.value = loggedUser;
        try {
            // Sắp xếp đơn hàng theo ngày tạo mới nhất
            const response = await fetch(`http://localhost:3000/orders?userId=${loggedUser.id}&_sort=createdAt&_order=desc`);
            orders.value = await response.json();
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    }
});

const cancelOrder = async (orderId) => {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
        try {
            const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Đã hủy' })
            });
            if (response.ok) {
                const order = orders.value.find(o => o.id === orderId);
                if (order) order.status = 'Đã hủy';
            }
        } catch (error) {
            console.error('Failed to cancel order:', error);
        }
    }
};

const reOrder = async (oldOrder) => {
    if (!user.value) return alert('Vui lòng đăng nhập!');

    if (confirm('Bạn có muốn đặt lại đơn hàng này với thông tin và sản phẩm tương tự?')) {
        const newOrder = {
            userId: user.value.id,
            customerName: oldOrder.customerName,
            customerAddress: oldOrder.customerAddress,
            customerPhone: oldOrder.customerPhone,
            items: oldOrder.items,
            total: oldOrder.total, 
            status: 'Chờ xác nhận', 
            createdAt: new Date().toISOString() 
        };

        try {
            const response = await fetch('http://localhost:3000/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder)
            });

            if (response.ok) {
                const createdOrder = await response.json();
                orders.value.unshift(createdOrder);
                alert('Đã đặt lại đơn hàng thành công! Đơn hàng mới đang chờ được xác nhận.');
            } else {
                alert('Đặt lại đơn hàng thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Failed to re-order:', error);
            alert('Có lỗi xảy ra khi đặt lại đơn hàng.');
        }
    }
};
</script>

<template>
    <div class="order-history container">
        <h2 class="page-title">📦 Lịch sử đơn hàng</h2>

        <div v-if="!user" class="no-user">
            <p>Vui lòng đăng nhập để xem lịch sử đơn hàng.</p>
        </div>

        <div v-else-if="orders.length === 0" class="no-orders">
            <i class="fas fa-box-open fa-3x mb-3"></i>
            <p>Bạn chưa có đơn hàng nào.</p>
            <router-link to="/shop" class="btn-shop">Tiếp tục mua sắm</router-link>
        </div>

        <div v-else class="orders-wrapper">
            <div v-for="order in orders" :key="order.id" class="order-card">
                <div class="order-header">
                    <div>
                        <h5>Đơn hàng #{{ order.id }}</h5>
                        <p class="date">Ngày đặt: {{ new Date(order.createdAt).toLocaleString('vi-VN') }}</p>
                    </div>
                    <span class="status" :class="{
                        'status-success': order.status === 'Đã giao',
                        'status-pending': order.status === 'Đang giao' || order.status === 'Chờ xác nhận',
                        'status-cancel': order.status === 'Đã hủy'
                    }">{{ order.status }}</span>
                </div>

                <div class="order-products">
                    <div v-for="item in order.items" :key="item.id" class="product-item">
                        <img :src="item.image?.[0] || 'https://via.placeholder.com/100x100?text=No+Image'"
                            alt="product image" class="product-image" />
                        <div class="product-info">
                            <h6 class="product-name">{{ item.name }}</h6>
                            <p class="product-desc text-muted">{{ item.description?.slice(0, 60) }}...</p>
                            <p class="product-meta">
                                Số lượng: {{ item.quantity }} |
                                Giá: <span class="text-danger fw-bold">
                                    {{ item.discount?.toLocaleString('vi-VN') }}₫
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="order-footer">
                    <div class="order-summary">
                        <p class="fw-semibold">Tổng tiền:</p>
                        <p class="total text-danger fw-bold">
                            {{ order.total.toLocaleString('vi-VN') }}₫
                        </p>
                    </div>
                    <div class="order-actions">
                        <button v-if="order.status === 'Chờ xác nhận'" @click="cancelOrder(order.id)"
                            class="btn btn-cancel">
                            <i class="fas fa-times me-1"></i> Hủy đơn
                        </button>
                        <button v-if="order.status === 'Đã hủy' || order.status === 'Đã giao'" @click="reOrder(order)"
                            class="btn btn-reorder">
                            <i class="fas fa-redo me-1"></i> Mua lại
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Container */
.order-history {
    max-width: 950px;
    margin: 40px auto;
    padding: 0 15px;
}

.page-title {
    text-align: center;
    font-weight: 700;
    font-size: 26px;
    margin-bottom: 35px;
    color: #1a1a1a;
}

/* Empty states */
.no-user,
.no-orders {
    text-align: center;
    background: #f8f9fa;
    border-radius: 14px;
    padding: 60px 20px;
    color: #666;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

.btn-shop {
    display: inline-block;
    margin-top: 15px;
    background: #007bff;
    color: white;
    padding: 10px 18px;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
}

.btn-shop:hover {
    background: #0056b3;
}

/* Order card */
.order-card {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 25px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.order-card:hover {
    transform: translateY(-3px);
}

/* Header */
.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f7f9fc;
    padding: 16px 22px;
    border-bottom: 1px solid #eee;
}

.order-header h5 {
    margin: 0;
    font-weight: 600;
}

.date {
    font-size: 13px;
    color: #888;
}

.status {
    padding: 6px 12px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
}

.status-success {
    background: #e8f9f1;
    color: #1e8a47;
}

.status-pending {
    background: #fff6e5;
    color: #d18b00;
}

.status-cancel {
    background: #ffeaea;
    color: #c0392b;
}

/* Product list */
.order-products {
    padding: 15px 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.product-item {
    display: flex;
    gap: 15px;
    align-items: flex-start;
}

.product-image {
    width: 90px;
    height: 90px;
    border-radius: 8px;
    object-fit: cover;
    background: #f0f0f0;
    border: 1px solid #ddd;
}

.product-info {
    flex-grow: 1;
}

.product-name {
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 5px;
}

.product-meta {
    font-size: 14px;
    color: #555;
}

.product-desc {
    font-size: 13px;
    color: #777;
}

/* Footer */
.order-footer {
    background: #fafafa;
    border-top: 1px solid #eee;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.order-summary {
    font-size: 15px;
}

.btn {
    border: none;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
}

.btn-cancel {
    background: #ffe6e6;
    color: #d32f2f;
}

.btn-cancel:hover {
    background: #ffcccc;
}

.btn-reorder {
    background: #e6f0ff;
    color: #2f5fd7;
}

.btn-reorder:hover {
    background: #d4e3ff;
}

/* Responsive */
@media (max-width: 600px) {
    .order-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}
</style>