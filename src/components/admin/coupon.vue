<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const coupons = ref([]);
const editingCoupon = ref({ id: null, code: '', discount: 0, expiry_date: '' });
const isEditMode = ref(false);

const api = axios.create({ baseURL: 'http://localhost:3000' });

const getCoupons = async () => {
    try {
        const { data } = await api.get('/coupons');
        coupons.value = data;
    } catch (error) {
        console.error("Lỗi khi tải coupons:", error);
    }
};

const resetForm = () => {
    editingCoupon.value = { id: null, code: '', discount: 0, expiry_date: '' };
    isEditMode.value = false;
};

const saveCoupon = async () => {
    const couponData = { ...editingCoupon.value };
    try {
        if (isEditMode.value) {
            // Update
            await api.patch(`/coupons/${couponData.id}`, couponData);
        } else {
            // Create
            delete couponData.id;
            await api.post('/coupons', couponData);
        }
        resetForm();
        await getCoupons(); // Refresh list
        document.getElementById('couponModal').classList.remove('show');
        document.querySelector('.modal-backdrop').remove();

    } catch (error) {
        console.error("Lỗi khi lưu coupon:", error);
    }
};

const deleteCoupon = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xoá coupon này không?')) {
        try {
            await api.delete(`/coupons/${id}`);
            await getCoupons(); // Refresh list
        } catch (error) {
            console.error("Lỗi khi xoá coupon:", error);
        }
    }
};

const openAddModal = () => {
    resetForm();
};

const openEditModal = (coupon) => {
    isEditMode.value = true;
    editingCoupon.value = { ...coupon };
};

onMounted(getCoupons);
</script>

<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="fw-bold">Quản lý Coupon</h2>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#couponModal" @click="openAddModal">
                <i class="fa fa-plus me-2"></i>Thêm Coupon mới
            </button>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-body">
                <table class="table table-hover align-middle">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Mã Coupon</th>
                            <th>Giảm giá (%)</th>
                            <th>Ngày hết hạn</th>
                            <th class="text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="coupons.length === 0">
                            <td colspan="5" class="text-center text-muted">Chưa có coupon nào.</td>
                        </tr>
                        <tr v-for="coupon in coupons" :key="coupon.id">
                            <td>{{ coupon.id }}</td>
                            <td class="fw-semibold">{{ coupon.code }}</td>
                            <td>{{ coupon.discount }}%</td>
                            <td>{{ new Date(coupon.expiry_date).toLocaleDateString('vi-VN') }}</td>
                            <td class="text-center">
                                <button class="btn btn-sm btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#couponModal" @click="openEditModal(coupon)">
                                    <i class="fa fa-edit"></i> Sửa
                                </button>
                                <button class="btn btn-sm btn-outline-danger" @click="deleteCoupon(coupon.id)">
                                    <i class="fa fa-trash"></i> Xoá
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="modal fade" id="couponModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <form @submit.prevent="saveCoupon">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ isEditMode ? 'Chỉnh sửa Coupon' : 'Thêm Coupon mới' }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="code" class="form-label">Mã Coupon</label>
                            <input type="text" v-model="editingCoupon.code" class="form-control" id="code" required>
                        </div>
                        <div class="mb-3">
                            <label for="discount" class="form-label">Giảm giá (%)</label>
                            <input type="number" v-model="editingCoupon.discount" class="form-control" id="discount" required min="1" max="100">
                        </div>
                        <div class="mb-3">
                            <label for="expiry_date" class="form-label">Ngày hết hạn</label>
                            <input type="date" v-model="editingCoupon.expiry_date" class="form-control" id="expiry_date" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="resetForm">Đóng</button>
                        <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>