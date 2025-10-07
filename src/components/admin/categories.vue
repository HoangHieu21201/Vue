<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const category = ref([]);
const selectedId = ref(null)
const selectedName = ref("")
const form = ref({ nameCategory: "", image: "" })

const fetchCategory = async () => {
    try {
        const res = await axios.get('http://localhost:3000/categories');
        category.value = res.data
    } catch (err) {
        console.error("Fetch posts error:", err)
    }
}

const askDelete = (id, name) => {
    selectedId.value = id
    selectedName.value = name
}

const confirmDelete = async () => {
    if (!selectedId.value) return
    try {
        await axios.delete(`http://localhost:3000/categories/${selectedId.value}`)
        category.value = category.value.filter(c => c.id !== selectedId.value)
        selectedId.value = null
        selectedName.value = ""
        Swal.fire({
            icon: 'success',
            title: 'Xoá danh mục thành công',
            text: `Bạn đã xoá danh mục thành công`,
            showConfirmButton: true,
            confirmButtonColor: '#000'
        })
    } catch (err) {
        console.error("Delete category error:", err)
    }
}

const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            form.value.image = event.target.result;
        };
        reader.readAsDataURL(file);
    }
};

const addCategory = async () => {
    if (form.value.nameCategory === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu tên danh mục!',
            text: 'Vui lòng nhập tên danh mục',
            timer: 2000,
            showConfirmButton: false
        })
    } else if (form.value.image === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu hình ảnh!',
            text: 'Vui lòng tải lên ảnh danh mục',
            timer: 2000,
            showConfirmButton: false
        })
    } else {
        try {
            const res = await axios.post('http://localhost:3000/categories', form.value)
            category.value.push(res.data)
            Swal.fire({
                icon: 'success',
                title: 'Tạo danh mục thành công',
                text: `Bạn đã tạo danh mục thành công`,
                showConfirmButton: true,
                confirmButtonColor: '#000'
            })
            resetForm()
        } catch (err) {
            console.error("Add category error:", err)
        }
    }

}

const askEdit = (item) => {
    selectedId.value = item.id
    form.value.nameCategory = item.nameCategory
    form.value.image = item.image
}

const handleEditImage = (e) => {
    const file = e.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
            form.value.image = event.target.result
        }
        reader.readAsDataURL(file)
    }
}

const editCategory = async () => {
    if (!selectedId.value) return

    try {
        const res = await axios.put(`http://localhost:3000/categories/${selectedId.value}`, form.value)

        const index = category.value.findIndex((c) => c.id === selectedId.value)
        if (index !== -1) {
            category.value[index] = res.data
        }

        Swal.fire({
            icon: 'success',
            title: 'Sửa danh mục thành công',
            text: `Bạn đã sửa danh mục ${form.value.nameCategory} thành công`,
            showConfirmButton: true,
            confirmButtonColor: '#000'
        })

        selectedId.value = null
        form.value = { nameCategory: '', image: '' }
    } catch (err) {
        console.error('Edit category error:', err)
    }
}

const resetForm = () => {
    form.value = {
        nameCategory: "",
        image: ""
    }
    selectedId.value = null
    selectedName.value = ""
}

onMounted(fetchCategory)
</script>

<template>
    <div class="container py-5">
        <div class="card shadow-lg rounded-4 p-4">
            <h3 class="text-center mb-4">Quản lý danh mục</h3>

            <!-- Form thêm danh mục -->
            <form @submit.prevent="addCategory">
                <div class="input-group mb-3">
                    <input v-model="form.nameCategory" type="text" class="form-control"
                        placeholder="Nhập tên danh mục..." />
                    <input type="file" class="form-control" accept="image/*" @change="handleImageUpload" />
                    <button type="submit" class="btn btn-dark">Thêm</button>
                </div>
            </form>

            <!-- Bảng danh mục -->
            <table class="table table-hover text-center">
                <thead class="table-light">
                    <tr>
                        <th>#</th>
                        <th>Ảnh Danh Mục</th>
                        <th>Tên danh mục</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="category.length" v-for="items, index in category" :key="items.id">
                        <td>{{ index + 1 }}</td>
                        <td><img :src="items.image" alt="" width="120px"></td>
                        <td>{{ items.nameCategory }}</td>
                        <td>
                            <button class="btn btn-outline-warning btn-sm me-2" @click="askEdit(items)"
                                data-bs-toggle="modal" data-bs-target="#editModal"><i class="fa fa-edit"></i></button>
                            <button @click="askDelete(items.id, items.nameCategory)"
                                class="btn btn-outline-danger btn-sm" data-bs-toggle="modal"
                                data-bs-target="#deleteModal"><i class="fa fa-trash"></i></button>
                        </td>
                    </tr>
                    <tr v-else>
                        <td colspan="8" class="text-center text-muted py-3">
                            Chưa có sản phẩm nào
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Modal Sửa -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content rounded-4">
                <div class="modal-header">
                    <h5 class="modal-title">Sửa danh mục</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input v-model="form.nameCategory" type="text" class="form-control" value="Tên danh mục cũ">
                    <input type="file" class="form-control mb-2" accept="image/*" @change="handleEditImage" />

                    <div v-if="form.image" class="text-center mt-3">
                        <p class="fw-semibold">Ảnh hiện tại:</p>
                        <img :src="form.image" alt="preview" width="120" class="rounded shadow-sm" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    <button class="btn btn-primary" @click="editCategory" data-bs-dismiss="modal">Lưu</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Xoá -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content rounded-4">
                <div class="modal-header">
                    <h5 class="modal-title">Xác nhận xoá</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    Bạn có chắc chắn muốn xoá danh mục <b class="text-danger">{{ selectedName }}</b>?
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-bs-dismiss="modal">Huỷ</button>
                    <button class="btn btn-danger" @click="confirmDelete" data-bs-dismiss="modal">Xoá</button>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped></style>