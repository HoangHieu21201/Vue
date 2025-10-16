<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const orders = ref([]);
const selectedOrder = ref(null);

const fetchOrders = async () => {
    try {
        const { data } = await axios.get('http://localhost:3000/orders?_sort=createdAt&_order=desc');
        orders.value = data;
    } catch (error) {
        console.error('Không thể tải danh sách đơn hàng:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi tải dữ liệu!',
            text: 'Không thể tải danh sách đơn hàng, vui lòng thử lại sau.',
            confirmButtonColor: '#000'
        });
    }
};

onMounted(fetchOrders);

// Cập nhật trạng thái đơn hàng
const updateStatus = async (order, newStatus) => {
    try {
        await axios.patch(`http://localhost:3000/orders/${order.id}`, { status: newStatus });
        order.status = newStatus;

        Swal.fire({
            icon: 'success',
            title: 'Cập nhật thành công!',
            text: `Đơn hàng #${order.id} đã chuyển sang trạng thái "${newStatus}".`,
            showConfirmButton: false,
            timer: 1500
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        Swal.fire({
            icon: 'error',
            title: 'Cập nhật thất bại!',
            text: 'Vui lòng thử lại sau.',
            confirmButtonColor: '#000'
        });
    }
};

// Xóa đơn hàng
const deleteOrder = async (orderId) => {
    Swal.fire({
        title: 'Xác nhận xoá?',
        text: 'Bạn có chắc chắn muốn XÓA vĩnh viễn đơn hàng này không?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Xoá',
        cancelButtonText: 'Huỷ'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:3000/orders/${orderId}`);
                orders.value = orders.value.filter(order => order.id !== orderId);
                Swal.fire({
                    icon: 'success',
                    title: 'Đã xoá!',
                    text: `Đơn hàng #${orderId} đã được xoá thành công.`,
                    showConfirmButton: false,
                    timer: 1500
                });
            } catch (error) {
                console.error('Lỗi khi xóa đơn hàng:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể xóa đơn hàng, vui lòng thử lại.',
                    confirmButtonColor: '#000'
                });
            }
        }
    });
};

// Xem chi tiết
const showOrderDetails = (order) => {
    selectedOrder.value = order;
};
</script>

<template>
    <div class="container-fluid p-4">
        <h3 class="fw-bold mb-4">Quản lý Đơn hàng</h3>

        <div class="table-responsive bg-white p-3 rounded shadow-sm">
            <table class="table table-bordered table-hover align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Mã ĐH</th>
                        <th>Khách hàng</th>
                        <th>Địa chỉ</th>
                        <th>Tổng tiền</th>
                        <th>Thanh toán</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                        <th class="text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="orders.length === 0">
                        <td colspan="8" class="text-center text-muted py-4">
                            <i class="fa fa-box-open fa-2x mb-2"></i><br>
                            Chưa có đơn hàng nào.
                        </td>
                    </tr>

                    <tr v-for="order in orders" :key="order.id">
                        <td class="fw-bold">#{{ order.id }}</td>
                        <td>
                            <div>{{ order.customerInfo?.name || order.customerName }}</div>
                            <small class="text-muted">{{ order.customerInfo?.phone || order.customerPhone }}</small>
                        </td>
                        <td>
                            <small class="text-muted">{{ order.customerInfo?.address || order.customerAddress }}</small>
                        </td>
                        <td class="text-danger fw-semibold">{{ order.total.toLocaleString('vi-VN') }} ₫</td>
                        <td>
                            <span v-if="order.paymentMethod === 'cod'" class="badge bg-info text-dark">COD</span>
                            <span v-else-if="order.paymentMethod === 'vnpay'" class="badge bg-warning text-dark">VNPay</span>
                        </td>
                        <td>
                            <small class="text-muted">{{ new Date(order.createdAt).toLocaleString('vi-VN') }}</small>
                        </td>
                        <td>
                            <span class="badge" :class="{
                                'bg-success': order.status === 'Đã giao' || order.status === 'Đã thanh toán',
                                'bg-primary': order.status === 'Đang giao',
                                'bg-warning text-dark': order.status === 'Chờ xác nhận' || order.status === 'Chờ thanh toán',
                                'bg-danger': order.status === 'Thanh toán thất bại',
                                'bg-secondary': order.status === 'Đã hủy'
                            }">
                                {{ order.status }}
                            </span>
                        </td>
                        <td class="text-center">
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-info" data-bs-toggle="modal"
                                    data-bs-target="#orderDetailsModal" @click="showOrderDetails(order)">
                                    Chi tiết
                                </button>
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

        <!-- Modal chi tiết đơn hàng -->
        <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content" v-if="selectedOrder">
                    <div class="modal-header">
                        <h5 class="modal-title" id="orderDetailsModalLabel">Chi tiết đơn hàng #{{ selectedOrder.id }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <h6><strong>Thông tin khách hàng</strong></h6>
                                <p class="mb-1"><strong>Tên:</strong> {{ selectedOrder.customerInfo?.name || selectedOrder.customerName }}</p>
                                <p class="mb-1"><strong>SĐT:</strong> {{ selectedOrder.customerInfo?.phone || selectedOrder.customerPhone }}</p>
                                <p class="mb-1"><strong>Địa chỉ:</strong> {{ selectedOrder.customerInfo?.address || selectedOrder.customerAddress }}</p>
                                <p v-if="selectedOrder.customerInfo?.note" class="mb-0"><strong>Ghi chú:</strong> <em>{{ selectedOrder.customerInfo.note }}</em></p>
                            </div>
                            <div class="col-md-6">
                                <h6><strong>Thông tin thanh toán</strong></h6>
                                <p class="mb-1"><strong>Tạm tính:</strong> {{ selectedOrder.subtotal.toLocaleString('vi-VN') }} ₫</p>
                                <p class="mb-1"><strong>Phí vận chuyển:</strong> {{ selectedOrder.shippingFee.toLocaleString('vi-VN') }} ₫</p>
                                <p class="mb-1 text-success" v-if="selectedOrder.discount && selectedOrder.discount.amount > 0">
                                    <strong>Giảm giá ({{ selectedOrder.discount.code }}):</strong>
                                    -{{ selectedOrder.discount.amount.toLocaleString('vi-VN') }} ₫
                                </p>
                                <hr class="my-2">
                                <p class="mb-1 fw-bold"><strong>Tổng cộng:</strong>
                                    <span class="text-danger fs-5">{{ selectedOrder.total.toLocaleString('vi-VN') }} ₫</span>
                                </p>
                            </div>
                        </div>
                        <hr>
                        <h6><strong>Sản phẩm trong đơn hàng</strong></h6>
                        <ul class="list-group">
                            <li v-for="item in selectedOrder.items" :key="item.id"
                                class="list-group-item d-flex align-items-center">
                                <img :src="item.image[0]" class="rounded me-3" style="width: 50px; height: 50px; object-fit: cover;">
                                <div class="flex-grow-1">
                                    <div class="fw-semibold small">{{ item.name }}</div>
                                    <small class="text-muted">SL: {{ item.quantity }} x {{ item.discount.toLocaleString('vi-VN') }} ₫</small>
                                </div>
                                <span class="fw-semibold small">{{ (item.quantity * item.discount).toLocaleString('vi-VN') }} ₫</span>
                            </li>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
