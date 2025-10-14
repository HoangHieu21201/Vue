<script setup>
import { ref, onMounted } from 'vue';

const orders = ref([]);

onMounted(async () => {
    try {
        const response = await fetch('http://localhost:3000/orders');
        orders.value = await response.json();
    } catch (error) {
        console.error('Failed to fetch orders:', error);
    }
});

const updateStatus = async (order, newStatus) => {
    try {
        await fetch(`http://localhost:3000/orders/${order.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        order.status = newStatus;
    } catch (error) {
        console.error('Failed to update status:', error);
    }
};

// 🆕 Thêm hàm xóa đơn hàng
const deleteOrder = async (orderId) => {
    if (confirm('Bạn có chắc chắn muốn XÓA vĩnh viễn đơn hàng này không?')) {
        try {
            const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                // Xóa đơn hàng khỏi danh sách hiển thị trên UI
                orders.value = orders.value.filter(order => order.id !== orderId);
            } else {
                 alert('Xóa đơn hàng thất bại.');
            }
        } catch (error) {
            console.error('Failed to delete order:', error);
            alert('Có lỗi xảy ra khi xóa đơn hàng.');
        }
    }
};
</script>

<template>
    <div class="container-fluid p-4">
        <h3 class="fw-bold mb-4">Quản lý Đơn hàng</h3>
        <div class="table-responsive">
            <table class="table table-bordered table-hover align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Khách hàng</th>
                        <th>Địa chỉ</th>
                        <th>Tổng tiền</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="order in orders" :key="order.id">
                        <td>{{ order.id }}</td>
                        <td>
                            <div>{{ order.customerName }}</div>
                            <small class="text-muted">{{ order.customerPhone }}</small>
                        </td>
                        <td>{{ order.customerAddress }}</td>
                        <td class="text-danger fw-semibold">{{ order.total.toLocaleString('vi-VN') }} ₫</td>
                        <td>{{ new Date(order.createdAt).toLocaleString('vi-VN') }}</td>
                        <td>
                            <span class="badge" :class="{
                                'bg-success': order.status === 'Đã giao',
                                'bg-primary': order.status === 'Đang giao',
                                'bg-warning text-dark': order.status === 'Chờ xác nhận',
                                'bg-secondary': order.status === 'Đã hủy'
                            }">
                                {{ order.status }}
                            </span>
                        </td>
                        <td>
                            <div class="btn-group">
                                <button @click="updateStatus(order, 'Đang giao')" class="btn btn-sm btn-outline-primary">Giao hàng</button>
                                <button @click="updateStatus(order, 'Đã giao')" class="btn btn-sm btn-outline-success">Hoàn thành</button>
                                <button @click="updateStatus(order, 'Đã hủy')" class="btn btn-sm btn-outline-secondary">Hủy</button>
                                <button @click="deleteOrder(order.id)" class="btn btn-sm btn-outline-danger">Xóa</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>