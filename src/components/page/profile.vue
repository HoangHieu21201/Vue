<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const user = ref({
  id: null,
  fullname: '',
  gender: '',
  birthdate: '',
  email: '',
  phone: '',
  address: '',
  role: '',
  password: '',
  image: ''
})
const orders = ref([]);

onMounted(async () => {
  const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedUser) {
    user.value = loggedUser;
    // Fetch user's orders
    try {
      const response = await fetch(`http://localhost:3000/orders?userId=${loggedUser.id}`);
      orders.value = await response.json();
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  }
});

const saveChanges = async () => {
  if (!user.value.fullname || !user.value.email || !user.value.phone || !user.value.address) {
    return Swal.fire({
      icon: 'warning',
      title: 'Thiếu thông tin!',
      text: 'Vui lòng điền đầy đủ các trường bắt buộc.',
      confirmButtonColor: '#000'
    });
  }
  try {
    await axios.put(`http://localhost:3000/user/${user.value.id}`, user.value)
    localStorage.setItem('loggedInUser', JSON.stringify(user.value))

    Swal.fire({
      icon: 'success',
      title: 'Update complete!',
      text: 'Your personal information has been saved.',
      confirmButtonColor: '#000'
    })
  } catch (err) {
    console.error('Update error:', err)
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'Unable to update information, please try again.',
      confirmButtonColor: '#000'
    })
  }
}
</script>

<template>
  <div class="container py-5">
    <div class="card shadow-lg border-0 rounded-4 p-4 profile-card mx-auto" style="max-width: 800px;">
      <div class="d-flex align-items-center gap-4 flex-wrap">
        <div class="text-center flex-shrink-0">
          <img :src="'https://wiztree.co.uk/wp-content/uploads/2024/05/user-icon-1024x1024-dtzturco.png'" alt="avatar"
            class="rounded-circle border shadow-sm" width="140" height="140" />

        </div>

        <!-- Thông tin -->
        <div class="flex-grow-1">
          <h3 class="fw-bold mb-2">{{ user.fullname }}</h3>
          <p class="text-muted mb-1"><i class="fa fa-envelope me-2"></i>{{ user.email }}</p>
          <p class="text-muted mb-1"><i class="fa fa-phone me-2"></i>{{ user.phone }}</p>
          <p class="text-muted mb-1"><i class="fa fa-map-marker me-2"></i>{{ user.address }}</p>
          <p class="text-muted mb-1"><i class="fa fa-birthday-cake me-2"></i>{{ user.birthdate ? new
            Date().getFullYear() - new Date(user.birthdate).getFullYear() + ' Tuổi' : '' }}</p>
          <span class="badge bg-dark mt-2 text-uppercase" style="color: red;">{{ user.role }}</span>
        </div>
      </div>

      <hr class="my-4" />

      <!-- Form chỉnh sửa -->
      <div>
        <h5 class="fw-bold mb-3">Chỉnh sửa hồ sơ</h5>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Họ và tên</label>
            <input v-model="user.fullname" type="text" class="form-control" placeholder="Nhập họ tên" required/>
          </div>
          <div class="col-md-6">
            <label class="form-label">Email</label>
            <input v-model="user.email" type="email" class="form-control" placeholder="Nhập email" disabled required/>
          </div>
          <div class="col-md-6">
            <label class="form-label">Giới tính</label>
            <select v-model="user.gender" class="form-select">
              <option value="" disabled>Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Số điện thoại</label>
            <input v-model="user.phone" type="text" class="form-control" placeholder="Nhập số điện thoại" required/>
          </div>
          <div class="col-md-6">
            <label class="form-label">Ngày sinh</label>
            <input v-model="user.birthdate" type="date" class="form-control" required/>
          </div>
          <div class="col-md-6">
            <label class="form-label" >Địa chỉ</label>
            <input v-model="user.address" type="text" class="form-control" placeholder="Nhập địa chỉ" required/>
          </div>
          <!-- <div class="col-md-6">
            <label class="form-label">New Password</label>
            <input v-model="user.password" type="password" class="form-control" placeholder="Nhập mật khẩu mới" />
          </div> -->
        </div>

        <div class="mt-4 d-flex gap-3">
          <button class="btn btn-success px-4 py-2" @click="saveChanges">
            <i class="fa fa-save me-2"></i>Lưu hồ sơ
          </button>
          <!-- <button class="btn btn-outline-dark px-4 py-2">
            <i class="fa fa-times me-2"></i>Cancel
          </button> -->
          <RouterLink to="/order-history" class="btn btn-primary fw-semibold">
            <i class="fas fa-receipt me-2"></i> Xem lịch sử đơn hàng
          </RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.profile-card {
  background: #fff;
}

img {
  object-fit: cover;
  transition: 0.3s ease;
}

img:hover {
  transform: scale(1.03);
}

input:focus {
  border-color: #000 !important;
  box-shadow: none;
}

.btn-dark:hover {
  background-color: #222 !important;
}
</style>
