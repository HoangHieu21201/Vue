<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axios from 'axios';
import { toast } from "vue3-toastify";
import Swal from 'sweetalert2'; // Thêm Swal để có thông báo đẹp hơn

const router = useRouter();
const store = useStore();
const orders = ref([]);
const user = ref(null);

const userReviews = ref([]);
const reviewingItemId = ref(null);
const newReview = ref({
    rating: 5,
    comment: ''
});

// >> SỬA LỖI: Thêm orderId vào hàm kiểm tra
// Bây giờ hàm sẽ kiểm tra xem sản phẩm trong đơn hàng cụ thể này đã được đánh giá chưa
const hasUserReviewed = (productId, orderId) => {
    return userReviews.value.some(review => review.productId === productId && review.orderId === orderId);
};

onMounted(async () => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedUser) {
        user.value = loggedUser;
        try {
            const ordersResponse = await axios.get(`http://localhost:3000/orders?userId=${loggedUser.id}&_sort=createdAt&_order=desc`);
            orders.value = ordersResponse.data;

            const reviewsResponse = await axios.get(`http://localhost:3000/reviews?userId=${loggedUser.id}`);
            userReviews.value = reviewsResponse.data;

        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error("Không thể tải lịch sử đơn hàng.");
        }
    }
});

const toggleReviewForm = (itemId) => {
    if (reviewingItemId.value === itemId) {
        reviewingItemId.value = null;
    } else {
        reviewingItemId.value = itemId;
        newReview.value.rating = 5;
        newReview.value.comment = '';
    }
};

// >> SỬA LỖI: Thêm orderId khi gửi đánh giá
const submitReview = async (item, orderId) => {
    if (!newReview.value.comment.trim()) {
        toast.warn("Vui lòng nhập bình luận của bạn.");
        return;
    }

    try {
        const reviewData = {
            fullname: user.value.fullname,
            productId: item.id,
            userId: user.value.id,
            orderId: orderId, // << Thêm orderId vào dữ liệu
            rating: newReview.value.rating,
            comment: newReview.value.comment,
            createdAt: new Date().toISOString()
        };
        const response = await axios.post('http://localhost:3000/reviews', reviewData);

        userReviews.value.push(response.data);
        reviewingItemId.value = null;
        toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");

    } catch (error) {
        console.error("Lỗi khi gửi đánh giá:", error);
        toast.error("Đã xảy ra lỗi, vui lòng thử lại.");
    }
};

// >> NÂNG CẤP: Hoàn kho khi người dùng hủy đơn
const restoreStock = async (items) => {
    try {
        const stockUpdates = items.map(async (item) => {
            const { data: product } = await axios.get(`http://localhost:3000/products/${item.id}`);
            const newQuantity = product.quantity + item.quantity;
            return axios.patch(`http://localhost:3000/products/${item.id}`, { quantity: newQuantity });
        });
        await Promise.all(stockUpdates);
    } catch (error) {
        console.error("Lỗi khi hoàn kho:", error);
    }
};

const cancelOrder = async (order) => {
    Swal.fire({
        title: 'Bạn chắc chắn muốn hủy?',
        text: "Bạn không thể hoàn tác hành động này!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Đồng ý hủy!',
        cancelButtonText: 'Không'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                // Hoàn lại số lượng sản phẩm
                await restoreStock(order.items);
                
                // Cập nhật trạng thái đơn hàng
                await axios.patch(`http://localhost:3000/orders/${order.id}`, { status: 'Đã hủy' });
                
                const orderInList = orders.value.find(o => o.id === order.id);
                if (orderInList) orderInList.status = 'Đã hủy';
                
                Swal.fire(
                    'Đã hủy!',
                    'Đơn hàng của bạn đã được hủy thành công.',
                    'success'
                )
            } catch (error) {
                console.error('Failed to cancel order:', error);
                Swal.fire(
                    'Thất bại!',
                    'Đã có lỗi xảy ra, vui lòng thử lại.',
                    'error'
                )
            }
        }
    })
};


const buyAgain = async (order) => {
    if (!order || !order.items || order.items.length === 0) {
        toast.warn('Đơn hàng này không có sản phẩm để mua lại.');
        return;
    }
    try {
        const addToCartPromises = order.items.map(item => {
            // Lấy thông tin mới nhất của sản phẩm để đảm bảo không bị lỗi thời
            return store.dispatch('cart/addProductToCart', { ...item });
        });

        await Promise.all(addToCartPromises);
        toast.success("Đã thêm các sản phẩm vào giỏ hàng!");
        router.push('/cart');
    } catch (error) {
        console.error('Đã xảy ra lỗi khi thực hiện mua lại:', error);
        toast.error('Đã xảy ra lỗi, vui lòng thử lại sau.');
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
                        'status-shipping': order.status === 'Đang giao',
                        'status-pending': order.status === 'Chờ xác nhận',
                        'status-cancel': order.status === 'Đã hủy' || order.status === 'Thanh toán thất bại'
                    }">{{ order.status }}</span>
                </div>

                <div class="order-products">
                    <div v-for="item in order.items" :key="item.id" class="product-item-wrapper">
                        <div class="product-item">
                            <img :src="item.image?.[0] || 'https://via.placeholder.com/100x100?text=No+Image'"
                                alt="product image" class="product-image" />
                            <div class="product-info">
                                <h6 class="product-name">{{ item.name }}</h6>
                                <p class="product-meta">
                                    Số lượng: {{ item.quantity }} |
                                    Giá: <span class="text-danger fw-bold">
                                        {{ (item.discount || item.price)?.toLocaleString('vi-VN') }}₫
                                    </span>
                                </p>
                                <div v-if="order.status === 'Đã giao'" class="mt-2">
                                     <button v-if="!hasUserReviewed(item.id, order.id)" @click="toggleReviewForm(item.id + order.id)" class="btn btn-review">
                                        <i class="fas fa-star me-1"></i> {{ reviewingItemId === (item.id + order.id) ? 'Đóng lại' : 'Viết đánh giá' }}
                                    </button>
                                    <span v-else class="text-success reviewed-badge">
                                        <i class="fas fa-check-circle me-1"></i> Đã đánh giá
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div v-if="reviewingItemId === (item.id + order.id)" class="review-form-container">
                            <form @submit.prevent="submitReview(item, order.id)">
                                <div class="mb-2">
                                    <label class="form-label">Xếp hạng:</label>
                                    <div>
                                        <select v-model.number="newReview.rating"
                                            class="form-select form-select-sm w-auto">
                                            <option value="5">5 sao ★★★★★</option>
                                            <option value="4">4 sao ★★★★☆</option>
                                            <option value="3">3 sao ★★★☆☆</option>
                                            <option value="2">2 sao ★★☆☆☆</option>
                                            <option value="1">1 sao ★☆☆☆☆</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-2">
                                    <label class="form-label">Bình luận:</label>
                                    <textarea v-model="newReview.comment" class="form-control form-control-sm" rows="3"
                                        placeholder="Sản phẩm này tuyệt vời như thế nào..."></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary btn-sm">Gửi đánh giá</button>
                            </form>
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
                         <button v-if="order.status === 'Chờ xác nhận'" @click="cancelOrder(order)" class="btn btn-cancel">
                            <i class="fas fa-times me-1"></i> Hủy đơn
                        </button>
                        <button v-if="order.status === 'Đã hủy' || order.status === 'Đã giao'" @click="buyAgain(order)"
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
    background: #000;
    color: white;
    padding: 10px 18px;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
}

.btn-shop:hover {
    background: #333;
}

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
.status-shipping {
    background: #e6f7ff;
    color: #006fbb;
}
.status-pending {
    background: #fff6e5;
    color: #d18b00;
}

.status-cancel {
    background: #ffeaea;
    color: #c0392b;
}

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
    font-weight: 600;
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

.btn-review {
    background-color: #ffc107;
    color: #212529;
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 600;
}

.btn-review:hover {
    background-color: #e0a800;
}

@media (max-width: 600px) {
    .order-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}

.product-item-wrapper {
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}

.product-item-wrapper:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.review-form-container {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    margin-top: 15px;
    border: 1px solid #dee2e6;
}

.reviewed-badge {
    font-weight: 600;
    padding: 6px 10px;
    border-radius: 6px;
    background-color: #e8f9f1;
}
</style>