<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold text-primary mb-0">🎟️ Quản lý Coupon</h2>
      <button class="btn btn-gradient" data-bs-toggle="modal" data-bs-target="#couponModal" @click="openAddModal">
        <i class="fa fa-plus me-2"></i> Thêm Coupon
      </button>
    </div>

    <div class="card shadow-lg border-0 rounded-4">
      <div class="card-body p-4">
        <table class="table table-hover align-middle">
          <thead class="table-primary">
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
              <td colspan="5" class="text-center text-muted py-4">Chưa có coupon nào.</td>
            </tr>
            <tr v-for="coupon in coupons" :key="coupon.id">
              <td>{{ coupon.id }}</td>
              <td class="fw-semibold text-uppercase">{{ coupon.code }}</td>
              <td>{{ coupon.discount }}%</td>
              <td>{{ formatDate(coupon.expiry_date) }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary me-2" data-bs-toggle="modal"
                  data-bs-target="#couponModal" @click="openEditModal(coupon)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(coupon.id)">
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="couponModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
          <form @submit.prevent="saveCoupon">
            <div class="modal-header bg-primary text-white rounded-top-4">
              <h5 class="modal-title">
                {{ isEditMode ? "Chỉnh sửa Coupon" : "Thêm Coupon mới" }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
              <div class="mb-3">
                <label for="code" class="form-label fw-semibold">Mã Coupon</label>
                <input type="text" v-model="editingCoupon.code" class="form-control form-control-lg" id="code" required />
              </div>
              <div class="mb-3">
                <label for="discount" class="form-label fw-semibold">Giảm giá (%)</label>
                <input type="number" v-model="editingCoupon.discount" class="form-control form-control-lg"
                  id="discount" required min="1" max="100" />
              </div>
              <div class="mb-3">
                <label for="expiry_date" class="form-label fw-semibold">Ngày hết hạn</label>
                <input type="date" v-model="editingCoupon.expiry_date" class="form-control form-control-lg"
                  id="expiry_date" required />
              </div>
            </div>
            <div class="modal-footer border-0 p-3">
              <button type="button" class="btn btn-secondary px-4" data-bs-dismiss="modal" @click="resetForm">
                Đóng
              </button>
              <button type="submit" class="btn btn-primary px-4">Lưu thay đổi</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const coupons = ref([]);
const editingCoupon = ref({ id: null, code: "", discount: 0, expiry_date: "" });
const isEditMode = ref(false);
const isSaving = ref(false);
const api = axios.create({ baseURL: "http://localhost:3000" });

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const getCoupons = async () => {
  try {
    const { data } = await api.get("/coupons");
    coupons.value = data;
  } catch {
    Swal.fire({
      icon: "error",
      title: "Lỗi tải dữ liệu!",
      text: "Không thể tải danh sách coupon.",
      confirmButtonColor: "#000",
    });
  }
};

const resetForm = () => {
  editingCoupon.value = { id: null, code: "", discount: 0, expiry_date: "" };
  isEditMode.value = false;
};

const saveCoupon = async () => {
  if (isSaving.value) return;
  isSaving.value = true;

  const data = { ...editingCoupon.value };

  if (!data.code.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Thiếu thông tin!",
      text: "Vui lòng nhập mã coupon.",
      confirmButtonColor: "#000",
    });
    isSaving.value = false;
    return;
  }

  if (data.discount < 1 || data.discount > 100) {
    Swal.fire({
      icon: "warning",
      title: "Giá trị không hợp lệ!",
      text: "Giảm giá phải nằm trong khoảng 1–100%.",
      confirmButtonColor: "#000",
    });
    isSaving.value = false;
    return;
  }

  try {
    let res;
    if (isEditMode.value) {
      res = await api.patch(`/coupons/${data.id}`, data);
      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công!",
        text: "Coupon đã được chỉnh sửa.",
        confirmButtonColor: "#000",
      });
    } else {
      delete data.id;
      res = await api.post("/coupons", data);
      Swal.fire({
        icon: "success",
        title: "Thêm coupon hoàn tất!",
        text: "Coupon mới đã được lưu.",
        confirmButtonColor: "#000",
      });
    }

    await getCoupons();
    resetForm();
    const modalEl = document.getElementById("couponModal");
    const bsModal =
      window.bootstrap?.Modal.getInstance(modalEl) ||
      (window.bootstrap ? new window.bootstrap.Modal(modalEl) : null);
    bsModal?.hide();
  } catch (err) {
    console.error("Lỗi khi lưu coupon:", err);
    Swal.fire({
      icon: "error",
      title: "Lỗi khi lưu coupon!",
      text: "Vui lòng thử lại.",
      confirmButtonColor: "#000",
    });
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = (id) => {
  Swal.fire({
    title: "Xác nhận xoá?",
    text: "Hành động này không thể hoàn tác!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Xoá ngay",
    cancelButtonText: "Huỷ",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.delete(`/coupons/${id}`);
        await getCoupons();
        Swal.fire({
          icon: "success",
          title: "Đã xoá!",
          text: "Coupon đã được xoá thành công.",
          confirmButtonColor: "#000",
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: "Lỗi khi xoá!",
          text: "Không thể xoá coupon này.",
          confirmButtonColor: "#000",
        });
      }
    }
  });
};

const openAddModal = () => resetForm();
const openEditModal = (coupon) => {
  isEditMode.value = true;
  editingCoupon.value = { ...coupon };
};

onMounted(getCoupons);
</script>

<style scoped>
.table {
  border-radius: 12px;
  overflow: hidden;
}

.btn-gradient {
  background: linear-gradient(45deg, #007bff, #00c4ff);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  transition: 0.3s;
}

.btn-gradient:hover {
  opacity: 0.9;
  transform: scale(1.03);
}

.modal-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.table-primary th {
  background-color: #007bff !important;
  color: white !important;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 4px rgba(0, 123, 255, 0.3);
}
</style>
