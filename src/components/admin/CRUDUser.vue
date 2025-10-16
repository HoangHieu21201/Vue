<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const users = ref([])
const formUser = ref({ fullname: "", email: "", phone: "", address: "", role: "", password: "", status: "active" })
const isEditing = ref(false)
const editingId = ref(null)
const loggedInUser = ref(JSON.parse(localStorage.getItem('loggedInUser')))

const readUser = async () => {
  try {
    const res = await axios.get('http://localhost:3000/user')
    users.value = res.data
  } catch (err) {
    console.log("Fetch posts error:", err)
  }
}

const removeUser = async (id) => {
  if (id === loggedInUser.value?.id) {
    Swal.fire('Thao tác bị từ chối', 'Bạn không thể tự xoá tài khoản của mình!', 'error')
    return;
  }

  Swal.fire({
    title: 'Bạn có chắc chắn muốn xoá?',
    text: `User có ID: ${id} sẽ bị xoá vĩnh viễn!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xoá',
    cancelButtonText: 'Huỷ',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/user/${id}`)
        users.value = users.value.filter(u => u.id !== id)
        Swal.fire('Đã xoá!', 'Người dùng đã được xoá thành công.', 'success')
      } catch (err) {
        console.log(err)
        Swal.fire('Lỗi!', 'Có lỗi xảy ra khi xoá người dùng.', 'error')
      }
    }
  })
}

const toggleUserStatus = async (user) => {
  if (user.id === loggedInUser.value?.id) {
    Swal.fire('Thao tác bị từ chối', 'Bạn không thể tự thay đổi trạng thái tài khoản của mình!', 'error');
    return;
  }

  const newStatus = user.status === 'active' ? 'disabled' : 'active';
  const actionText = newStatus === 'disabled' ? 'vô hiệu hóa' : 'kích hoạt';

  try {
    await axios.patch(`http://localhost:3000/user/${user.id}`, { status: newStatus });
    const userInArray = users.value.find(u => u.id === user.id);
    if (userInArray) {
      userInArray.status = newStatus;
    }
    Swal.fire('Thành công', `Đã ${actionText} tài khoản.`, 'success');
  } catch (err) {
    console.error(`Lỗi khi ${actionText} tài khoản:`, err);
    Swal.fire('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại.', 'error');
  }
};

const submitForm = async () => {
  try {
    if (isEditing.value) {
      // Khi chỉnh sửa, không gửi lại email
      const { email, ...updateData } = formUser.value;
      await axios.put(`http://localhost:3000/user/${editingId.value}`, updateData)
      const index = users.value.findIndex(u => u.id === editingId.value)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...updateData }
      }
      Swal.fire('Thành công', 'Cập nhật người dùng thành công!', 'success')
    } else {
      const res = await axios.post('http://localhost:3000/user', formUser.value)
      users.value.push(res.data)
      Swal.fire('Thành công', 'Thêm người dùng mới thành công!', 'success')
    }
    resetForm()
  } catch (err) {
    console.log(err)
    Swal.fire('Lỗi', 'Có lỗi xảy ra.', 'error')
  }
}

const editUser = (user) => {
  isEditing.value = true
  editingId.value = user.id
  formUser.value = { ...user }
}

const resetForm = () => {
  isEditing.value = false
  editingId.value = null
  formUser.value = { fullname: "", email: "", phone: "", address: "", role: "", password: "", status: "active" }
}

onMounted(readUser)
</script>

<template>
  <div class="container-fluid p-4">
    <h3 class="mb-4">Quản lý người dùng</h3>

    <div class="row">
      <div class="col">
        <div class="table-responsive bg-white p-3 rounded shadow-sm">
          <table class="table table-hover align-middle">
            <thead class="table-dark">
              <tr>
                <th>ID</th>
                <th>Tên người dùng</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th class="text-center" style="width: 250px;">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.fullname }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="user.role === 'admin' ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ user.role }}
                  </span>
                </td>
                <td>
                  <span :class="user.status === 'active' ? 'badge bg-primary' : 'badge bg-danger'">
                    {{ user.status === 'active' ? 'Hoạt động' : 'Vô hiệu hoá' }}
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-primary me-2" @click="editUser(user)">Sửa</button>
                  <button class="btn btn-sm me-2" :class="user.status === 'active' ? 'btn-warning' : 'btn-info'"
                    @click="toggleUserStatus(user)" :disabled="user.id === loggedInUser?.id">
                    {{ user.status === 'active' ? 'Vô hiệu hoá' : 'Kích hoạt' }}
                  </button>
                  <button class="btn btn-sm btn-danger" @click="removeUser(user.id)"
                    :disabled="user.id === loggedInUser?.id">
                    Xoá
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="col">
      <form @submit.prevent="submitForm" class="bg-white p-4 rounded shadow-sm">
        <h5 class="mb-3 fw-bold">{{ isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới' }}</h5>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Họ và tên</label>
            <input v-model="formUser.fullname" type="text" class="form-control" placeholder="Nhập họ tên" required />
          </div>
          <div class="col-12">
            <label class="form-label">Email</label>
            <input v-model="formUser.email" type="email" class="form-control" placeholder="Nhập email" required
              :disabled="isEditing" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Số điện thoại</label>
            <input v-model="formUser.phone" type="text" class="form-control" placeholder="Nhập SĐT" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Địa chỉ</label>
            <input v-model="formUser.address" type="text" class="form-control" placeholder="Nhập địa chỉ" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Mật khẩu</label>
            <input v-model="formUser.password" type="password" class="form-control"
              placeholder="Để trống nếu không đổi" />
          </div>
          <div v-if="!isEditing || (isEditing && formUser.id !== loggedInUser?.id)" class="col-md-6">
            <label class="form-label">Quyền</label>
            <select class="form-select" v-model="formUser.role" required>
              <option disabled value="">-- Chọn quyền --</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div class="mt-4">
          <button type="submit" class="btn btn-dark px-4 me-2">
            {{ isEditing ? 'Lưu thay đổi' : 'Thêm người dùng' }}
          </button>
          <button type="button" class="btn btn-outline-secondary px-4" @click="resetForm">
            Huỷ
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
h3 {
  color: #222;
}

.table th {
  font-weight: 600;
}

.btn:disabled,
input:disabled {
  cursor: not-allowed;
  opacity: 0.65;
  background-color: #e9ecef;
}
</style>