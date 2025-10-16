<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

const selectedName = ref("");
const selectedId = ref(null);
const category = ref([]);
const products = ref([]);
const form = ref({
    name: "",
    price: "",
    discount: "",
    quantity: "",
    status: "",
    description: "",
    categoryId: "",
    image: []
});

// ✅ Lấy danh mục
const readCategory = async () => {
    try {
        const res = await axios.get('http://localhost:3000/categories');
        category.value = res.data;
    } catch (err) {
        console.error('Lỗi lấy danh mục:', err);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi tải danh mục!',
            text: 'Không thể tải danh mục sản phẩm.',
            confirmButtonColor: '#000'
        });
    }
};

// ✅ Lấy danh sách sản phẩm
const readProduct = async () => {
    try {
        const res = await axios.get('http://localhost:3000/products');
        products.value = res.data;
    } catch (err) {
        console.error('Lỗi lấy sản phẩm:', err);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi tải sản phẩm!',
            text: 'Không thể tải danh sách sản phẩm.',
            confirmButtonColor: '#000'
        });
    }
};

// ✅ Chọn sản phẩm để xoá
const askDelete = (id, name) => {
    selectedId.value = id;
    selectedName.value = name;
};

// ✅ Xác nhận xoá
const confirmDelete = async () => {
    if (!selectedId.value) return;

    const result = await Swal.fire({
        title: `Bạn có chắc muốn xoá "${selectedName.value}" không?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#000',
        cancelButtonColor: '#888',
        confirmButtonText: 'Xoá',
        cancelButtonText: 'Huỷ'
    });

    if (result.isConfirmed) {
        try {
            await axios.delete(`http://localhost:3000/products/${selectedId.value}`);
            products.value = products.value.filter(p => p.id !== selectedId.value);
            selectedId.value = null;
            selectedName.value = "";

            Swal.fire({
                icon: 'success',
                title: 'Đã xoá sản phẩm!',
                text: 'Sản phẩm đã được xoá thành công.',
                confirmButtonColor: '#000'
            });
        } catch (err) {
            console.error('Lỗi xoá:', err);
            Swal.fire({
                icon: 'error',
                title: 'Xoá thất bại!',
                text: 'Không thể xoá sản phẩm này.',
                confirmButtonColor: '#000'
            });
        }
    }
};

// ✅ Upload hình ảnh
const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files.length) return;
    form.value.image = [];

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            form.value.image.push(event.target.result);
        };
        reader.readAsDataURL(file);
    });
};

// ✅ Thêm sản phẩm
const addProduct = async () => {
    const f = form.value;
    if (!f.name || !f.price || !f.quantity || !f.status || !f.discount || !f.description || !f.categoryId || f.image.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin!',
            text: 'Vui lòng nhập đầy đủ các trường bắt buộc.',
            confirmButtonColor: '#000'
        });
        return;
    }

    try {
        const res = await axios.post('http://localhost:3000/products', f);
        products.value.push(res.data);

        Swal.fire({
            icon: 'success',
            title: 'Thêm sản phẩm thành công!',
            text: 'Sản phẩm đã được thêm vào danh sách.',
            confirmButtonColor: '#000'
        });
        resetForm();
    } catch (err) {
        console.error('Lỗi thêm:', err);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi khi lưu!',
            text: 'Không thể thêm sản phẩm.',
            confirmButtonColor: '#000'
        });
    }
};

// ✅ Chọn sản phẩm để sửa
const askEdit = (item) => {
    selectedId.value = item.id;
    form.value = { ...item };
};

// ✅ Upload lại ảnh khi sửa
const handleEditImage = (e) => {
    const files = e.target.files;
    if (!files.length) return;

    form.value.image = [];
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            form.value.image.push(event.target.result);
        };
        reader.readAsDataURL(file);
    });
};

// ✅ Cập nhật sản phẩm
const editProduct = async () => {
    if (!selectedId.value) return;

    try {
        const res = await axios.put(`http://localhost:3000/products/${selectedId.value}`, form.value);
        const index = products.value.findIndex(p => p.id === selectedId.value);
        if (index !== -1) products.value[index] = res.data;

        Swal.fire({
            icon: 'success',
            title: 'Cập nhật sản phẩm thành công!',
            text: 'Thông tin sản phẩm đã được cập nhật.',
            confirmButtonColor: '#000'
        });

        selectedId.value = null;
        resetForm();
    } catch (err) {
        console.error('Lỗi cập nhật:', err);
        Swal.fire({
            icon: 'error',
            title: 'Cập nhật thất bại!',
            text: 'Không thể cập nhật sản phẩm.',
            confirmButtonColor: '#000'
        });
    }
};

// ✅ Reset form
const resetForm = () => {
    form.value = {
        name: "",
        price: "",
        discount: "",
        quantity: "",
        status: "",
        description: "",
        categoryId: "",
        image: []
    };
    selectedId.value = null;
    selectedName.value = "";
};

onMounted(() => {
    readCategory();
    readProduct();
});
</script>

<template>
    <div class="container mt-5">
        <h2 class="text-center fw-bold mb-4">Quản Lý Sản Phẩm</h2>

        <!-- Nút thêm sản phẩm -->
        <div class="text-end mb-3">
            <button class="btn btn-dark px-3" data-bs-toggle="modal" data-bs-target="#addProductModal">
                <i class="fa fa-plus me-1"></i> Thêm sản phẩm
            </button>
        </div>

        <!-- Bảng sản phẩm -->
        <div class="table-responsive shadow-sm rounded-3">
            <table class="table table-bordered table-hover align-middle mb-0">
                <thead class="table-dark text-center">
                    <tr>
                        <th style="width: 5%;">#</th>
                        <th style="width: 12%;">Ảnh</th>
                        <th style="width: 18%;">Tên sản phẩm</th>
                        <th style="width: 10%;">Danh mục</th>
                        <th style="width: 10%;">Giá</th>
                        <th style="width: 12%;">Giá đã giảm</th>
                        <th style="width: 8%;">Số lượng</th>
                        <th style="width: 10%;">Trạng thái</th>
                        <th style="width: 15%;">Hành động</th>
                    </tr>
                </thead>
                <tbody class="text-center">
                    <tr v-if="products.length" v-for="i, index in products" :key="i.id">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <img v-for="(img, idx) in i.image" :key="idx" :src="img" alt="Ảnh" width="50"
                                class="rounded border" />
                        </td>
                        <td>{{ i.name }}</td>
                        <td>{{category.find(c => c.id === i.categoryId)?.nameCategory || "Không có"}}</td>
                        <td>{{ Number(i.price).toLocaleString('vi-VN') }} ₫</td>
                        <td>{{ Number(i.discount).toLocaleString('vi-VN') }} đ (-{{ Math.round(100 - (i.discount /
                            i.price) * 100) }}%)</td>
                        <td>{{ i.quantity }}</td>
                        <td><span class="badge" :class="i.status === 'Còn hàng' ? 'bg-success' : 'bg-danger'">{{
                            i.status }}</span></td>
                        <td>
                            <router-link :to="`/admin/readProduct/${i.id}`" class="btn btn-outline-info btn-sm me-2">
                                <i class="fa fa-eye"></i>
                            </router-link>
                            <button @click="askEdit(i)" class="btn btn-outline-warning btn-sm me-2"
                                data-bs-toggle="modal" data-bs-target="#editModal">
                                <i class="fa fa-edit"></i>
                            </button>
                            <button @click="askDelete(i.id, i.name)" class="btn btn-outline-danger btn-sm"
                                data-bs-toggle="modal" data-bs-target="#deleteModal">
                                <i class="fa fa-trash"></i>
                            </button>
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

        <!-- Modal thêm sản phẩm -->
        <div class="modal fade" id="addProductModal" tabindex="-1" aria-labelledby="addProductModalLabel"
            aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header bg-dark text-white">
                        <h5 class="modal-title">Thêm sản phẩm mới</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Tên sản phẩm</label>
                                    <input v-model="form.name" type="text" class="form-control"
                                        placeholder="Nhập tên sản phẩm" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Giá</label>
                                    <input v-model="form.price" type="number" min="20000" class="form-control"
                                        placeholder="Nhập giá" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Giá đã giảm</label>
                                    <input v-model="form.discount" type="number" min="0" class="form-control"
                                        placeholder="Nhập giá" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Số lượng</label>
                                     
                                    <input v-model="form.quantity" min="10" type="number" class="form-control"
                                        placeholder="Nhập số lượng" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Trạng thái</label>
                                    <select v-model="form.status" class="form-select">
                                        <option disabled value="">-- Chọn trạng thái --</option>
                                        <option value="Còn hàng">Còn hàng</option>
                                        <option value="Hết hàng">Hết hàng</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Danh mục</label>
                                    <select v-model="form.categoryId" class="form-select">
                                        <option selected>-- Chọn danh mục --</option>
                                        <option v-for="items in category" :value="items.id" :key="items.id">{{
                                            items.nameCategory }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-md-12">
                                    <label class="form-label">Mô tả</label>
                                    <textarea v-model="form.description" rows="3" class="form-control"
                                        placeholder="Nhập mô tả sản phẩm"></textarea>
                                </div>
                                <div class="col-md-12">
                                    <label class="form-label">Ảnh sản phẩm</label>
                                    <input multiple @change="handleImageUpload" type="file" class="form-control" />
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                        <button @click="addProduct" data-bs-dismiss="modal" type="button" class="btn btn-dark">Lưu sản
                            phẩm</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header bg-warning text-white">
                        <h5 class="modal-title">Sửa thông tin sản phẩm</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Tên sản phẩm</label>
                                    <input v-model="form.name" type="text" class="form-control"
                                        value="Áo Thun Nam Basic" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Giá</label>
                                    <input v-model="form.price" type="number" class="form-control" value="250000" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Giá đã giảm</label>
                                    <input v-model="form.discount" type="number" class="form-control" value="250000" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Số lượng</label>
                                    <input v-model="form.quantity" type="number" class="form-control" value="10" />
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Trạng thái</label>
                                    <select v-model="form.status" class="form-select">
                                        <option disabled value="">-- Chọn trạng thái --</option>
                                        <option value="Còn hàng">Còn hàng</option>
                                        <option value="Hết hàng">Hết hàng</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Danh mục</label>
                                    <select v-model="form.categoryId" class="form-select">
                                        <option selected>-- Chọn danh mục --</option>
                                        <option v-for="items in category" :value="items.id" :key="items.id">{{
                                            items.nameCategory }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-md-12">
                                    <label class="form-label">Mô tả</label>
                                    <textarea v-model="form.description" rows="3"
                                        class="form-control">Áo thun nam form rộng chất cotton mịn...</textarea>
                                </div>
                                <div class="col-md-12">
                                    <label class="form-label">Ảnh sản phẩm</label>

                                    <div class="d-flex flex-wrap gap-2 mb-2">
                                        <img v-for="(img, idx) in form.image" :key="idx" :src="img" width="70"
                                            class="rounded border" />
                                    </div>

                                    <input multiple @change="handleEditImage" type="file" class="form-control" />
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer border-0">
                        <button class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                        <button @click="editProduct" class="btn btn-warning text-white" data-bs-dismiss="modal">Lưu thay
                            đổi</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal xác nhận xoá -->
        <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">Xác nhận xoá</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center py-4">
                        <i class="fa fa-exclamation-triangle fa-2x text-danger mb-3"></i>
                        <p>Bạn có chắc muốn xoá <strong>{{ selectedName }}</strong> không?</p>
                    </div>
                    <div class="modal-footer border-0 justify-content-center">
                        <button class="btn btn-secondary" data-bs-dismiss="modal">Huỷ</button>
                        <button @click="confirmDelete" data-bs-dismiss="modal" class="btn btn-danger">Xoá</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
h2 {
    color: #222;
    letter-spacing: 0.5px;
}

.table-hover tbody tr:hover {
    background-color: #f8f9fa;
    transition: 0.3s;
}

.modal-content {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
