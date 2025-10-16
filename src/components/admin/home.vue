<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { useToast } from 'vue-toastification'; // >> MỚI: Import toast để thông báo

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Toast = useToast(); // >> MỚI: Khởi tạo toast
const orders = ref([]);
const products = ref([]);
const lowStockProducts = ref([]);

// >> MỚI: State để lưu số lượng cần thêm cho mỗi sản phẩm
const quantityToAdd = ref({});

const chartData = ref({
    labels: [],
    datasets: []
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
        },
        title: {
            display: true,
            text: 'Doanh thu hàng tháng (Trạng thái: Đã giao)',
            font: {
                size: 18
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: function (value) {
                    return value.toLocaleString('vi-VN') + ' ₫';
                }
            }
        }
    }
};

const totalRevenue = computed(() => {
    return orders.value
        .filter(order => order.status === 'Đã giao')
        .reduce((sum, order) => sum + order.total, 0);
});

const fetchOrders = async () => {
    try {
        const { data } = await axios.get('http://localhost:3000/orders');
        orders.value = data;
        processRevenueData(data);
    } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
    }
};

const fetchProducts = async () => {
    try {
        const { data } = await axios.get('http://localhost:3000/products');
        products.value = data;
        checkStockLevels(data);
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
    }
};

const processRevenueData = (ordersData) => {
    const monthlyRevenue = {};
    const completedOrders = ordersData.filter(order => order.status === 'Đã giao');

    completedOrders.forEach(order => {
        const month = new Date(order.createdAt).toLocaleString('vi-VN', { month: 'long', year: 'numeric' });
        if (!monthlyRevenue[month]) {
            monthlyRevenue[month] = 0;
        }
        monthlyRevenue[month] += order.total;
    });

    const sortedMonths = Object.keys(monthlyRevenue).sort((a, b) => {
        const [monthAStr, yearA] = a.replace('Tháng ', '').split(' năm ');
        const [monthBStr, yearB] = b.replace('Tháng ', '').split(' năm ');
        const monthA = parseInt(monthAStr, 10);
        const monthB = parseInt(monthBStr, 10);
        return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });

    chartData.value = {
        labels: sortedMonths,
        datasets: [
            {
                label: 'Doanh thu',
                backgroundColor: '#42A5F5',
                borderColor: '#1E88E5',
                borderWidth: 1,
                data: sortedMonths.map(month => monthlyRevenue[month])
            }
        ]
    };
};

const checkStockLevels = (productsData) => {
    lowStockProducts.value = productsData.filter(product => product.quantity <= 5);
    // >> MỚI: Khởi tạo giá trị rỗng cho các input số lượng
    lowStockProducts.value.forEach(p => {
        if (!quantityToAdd.value[p.id]) {
            quantityToAdd.value[p.id] = null;
        }
    });
};

// >> MỚI: Hàm để thêm số lượng tồn kho
const addStock = async (product) => {
    const amount = quantityToAdd.value[product.id];

    if (!amount || amount <= 0) {
        Toast.error("Vui lòng nhập số lượng hợp lệ!", { theme: "colored" });
        return;
    }

    try {
        const newQuantity = product.quantity + amount;

        // Gửi request PATCH để chỉ cập nhật số lượng
        await axios.patch(`http://localhost:3000/products/${product.id}`, {
            quantity: newQuantity
        });

        // Cập nhật lại danh sách sản phẩm và danh sách cảnh báo
        await fetchProducts();

        Toast.success(`Đã cập nhật số lượng cho sản phẩm "${product.name}"!`, { theme: "colored" });
        quantityToAdd.value[product.id] = null; // Reset input

    } catch (error) {
        console.error("Lỗi khi cập nhật số lượng:", error);
        Toast.error("Có lỗi xảy ra, vui lòng thử lại.", { theme: "colored" });
    }
};


onMounted(() => {
    fetchOrders();
    fetchProducts();
});
</script>

<template>
    <div class="container-fluid p-4">
        <h2 class="mb-4 fw-bold">Bảng điều khiển</h2>

        <div class="row g-4 mb-4">
            <div class="col-md-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body text-center">
                        <i class="fa fa-dollar-sign fa-3x text-success mb-3"></i>
                        <h5 class="card-title">Tổng doanh thu</h5>
                        <p class="card-text fs-4 fw-bold">{{ totalRevenue.toLocaleString('vi-VN') }} ₫</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body text-center">
                        <i class="fa fa-box-open fa-3x text-primary mb-3"></i>
                        <h5 class="card-title">Tổng sản phẩm</h5>
                        <p class="card-text fs-4 fw-bold">{{ products.length }}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body text-center">
                        <i class="fa fa-receipt fa-3x text-info mb-3"></i>
                        <h5 class="card-title">Tổng đơn hàng</h5>
                        <p class="card-text fs-4 fw-bold">{{ orders.length }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="card shadow-sm border-0 mb-4">
            <div class="card-body">
                <div style="height: 400px;">
                    <Bar v-if="chartData.labels.length" :data="chartData" :options="chartOptions" />
                    <p v-else class="text-center text-muted">Không có dữ liệu doanh thu để hiển thị.</p>
                </div>
            </div>
        </div>

        <div class="card shadow-sm border-0">
            <div class="card-header bg-warning text-dark">
                <h5 class="mb-0 fw-bold"><i class="fa fa-exclamation-triangle me-2"></i>Sản phẩm sắp hết hàng (Tồn kho
                    &lt;= 5)</h5>
            </div>
            <div class="card-body">
                <div v-if="lowStockProducts.length > 0" class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Hình ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th class="text-center">Tồn kho</th>
                                <th class="text-center" style="width: 220px;">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="product in lowStockProducts" :key="product.id">
                                <td>
                                    <img :src="product.image[0]" :alt="product.name"
                                        style="width: 50px; height: 50px; object-fit: cover;" class="rounded">
                                </td>
                                <td>{{ product.name }}</td>
                                <td class="text-center">
                                    <span class="badge bg-danger fs-6">{{ product.quantity }}</span>
                                </td>
                                <td>
                                    <div class="input-group">
                                        <input type="number" class="form-control form-control-sm"
                                            placeholder="Số lượng" v-model.number="quantityToAdd[product.id]" min="10">
                                        <button class="btn btn-sm btn-primary" @click="addStock(product)">
                                            <i class="fa fa-plus"></i> Thêm
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="alert alert-success mb-0">
                    Tuyệt vời! Không có sản phẩm nào sắp hết hàng.
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    border-radius: 15px;
}

.card-header {
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
}
</style>