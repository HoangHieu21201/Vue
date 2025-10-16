<script setup>
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const store = useStore();
const router = useRouter();

const cart = computed(() => store.getters['cart/cartItems']);
const subtotal = computed(() => store.getters['cart/cartTotal']);

const customerName = ref('');
const customerAddress = ref('');
const customerPhone = ref('');
const customerNote = ref('');
const paymentMethod = ref('cod');

const couponCode = ref('');
const appliedCoupon = ref(null);
const discountAmount = ref(0);

const shippingFee = computed(() => {
    return subtotal.value >= 200000 ? 0 : 30000;
});

const finalTotal = computed(() => {
    const totalAfterDiscount = subtotal.value - discountAmount.value;
    return totalAfterDiscount > 0 ? totalAfterDiscount + shippingFee.value : shippingFee.value;
});

const applyCoupon = async () => {
    if (!couponCode.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu mã giảm giá',
            text: 'Vui lòng nhập mã giảm giá trước khi áp dụng.',
            confirmButtonColor: '#000'
        });
        return;
    }
    try {
        const { data: coupons } = await axios.get(`http://localhost:3000/coupons?code=${couponCode.value}`);
        const coupon = coupons[0];

        if (coupon) {
            const now = new Date();
            const expiryDate = new Date(coupon.expiry_date);
            if (now > expiryDate) {
                Swal.fire({
                    icon: 'error',
                    title: 'Mã giảm giá đã hết hạn!',
                    text: 'Vui lòng chọn mã khác.',
                    confirmButtonColor: '#000'
                });
                appliedCoupon.value = null;
                discountAmount.value = 0;
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Áp dụng thành công!',
                    text: `Bạn được giảm ${coupon.discount}% trên tổng đơn hàng.`,
                    confirmButtonColor: '#000'
                });
                appliedCoupon.value = coupon;
                discountAmount.value = (subtotal.value * coupon.discount) / 100;
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Mã giảm giá không hợp lệ!',
                text: 'Vui lòng kiểm tra lại mã.',
                confirmButtonColor: '#000'
            });
            appliedCoupon.value = null;
            discountAmount.value = 0;
        }
    } catch (error) {
        console.error("Lỗi khi áp dụng coupon:", error);
        Swal.fire({
            icon: 'error',
            title: 'Có lỗi xảy ra!',
            text: 'Không thể áp dụng mã giảm giá. Vui lòng thử lại sau.',
            confirmButtonColor: '#000'
        });
    }
};

onMounted(() => {
    sessionStorage.removeItem('pendingOrderId');

    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedUser) {
        customerName.value = loggedUser.fullname || '';
        customerAddress.value = loggedUser.address || '';
        customerPhone.value = loggedUser.phone || '';
    }
});

// >> MỚI: Hàm cập nhật (trừ) số lượng tồn kho
const updateStock = async (items) => {
    try {
        const stockUpdates = items.map(async (item) => {
            const { data: product } = await axios.get(`http://localhost:3000/products/${item.id}`);
            const newQuantity = product.quantity - item.quantity;

            return axios.patch(`http://localhost:3000/products/${item.id}`, {
                quantity: newQuantity >= 0 ? newQuantity : 0 // Đảm bảo số lượng không âm
            });
        });
        await Promise.all(stockUpdates);
    } catch (error) {
        console.error("Lỗi nghiêm trọng khi cập nhật tồn kho:", error);
        // Cần có cơ chế báo lỗi cho admin ở đây nếu cần
    }
};
const sendOrderConfirmationEmail = async (order) => {
    try {
        // Thêm email của người dùng vào order data để gửi đi
        const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (loggedUser && loggedUser.email) {
            order.customerInfo.email = loggedUser.email;
        } else {
            // Nếu không có email, không gửi
            console.warn("Không tìm thấy email khách hàng, không thể gửi mail.");
            return;
        }

        await axios.post('http://localhost:3002/send-order-email', order);
    } catch (error) {
        // Việc gửi mail thất bại không nên ảnh hưởng tới trải nghiệm người dùng
        console.error("Gửi email xác nhận thất bại, nhưng đơn hàng đã được tạo:", error);
    }
};
const placeOrder = async () => {
    if (!customerName.value || !customerAddress.value || !customerPhone.value) {
        Swal.fire({
            icon: 'warning',
            title: 'Thiếu thông tin!',
            text: 'Vui lòng điền đầy đủ thông tin giao hàng.',
            confirmButtonColor: '#000'
        });
        return;
    }

    const loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedUser) {
        Swal.fire({
            icon: 'info',
            title: 'Chưa đăng nhập!',
            text: 'Bạn cần đăng nhập để đặt hàng.',
            confirmButtonText: 'Đăng nhập ngay',
            confirmButtonColor: '#000'
        }).then(() => {
            router.push('/login');
        });
        return;
    }

    const orderData = {
        userId: loggedUser.id,
        customerInfo: {
            name: customerName.value,
            address: customerAddress.value,
            phone: customerPhone.value,
            note: customerNote.value
        },
        items: JSON.parse(JSON.stringify(cart.value)),
        subtotal: subtotal.value,
        shippingFee: shippingFee.value,
        discount: {
            code: appliedCoupon.value?.code || "Không có",
            amount: discountAmount.value
        },
        total: finalTotal.value,
        paymentMethod: paymentMethod.value,
        status: 'Chờ xác nhận',
        createdAt: new Date().toISOString()
    };

    // Xử lý chung việc tạo đơn hàng và trừ kho
    try {
        let newOrder;
        if (paymentMethod.value === 'vnpay') {
            orderData.status = 'Chờ thanh toán';
        }

        const response = await axios.post('http://localhost:3000/orders', orderData);
        newOrder = response.data;

        await updateStock(orderData.items);

        // >> GỌI HÀM GỬI EMAIL NGAY SAU KHI TẠO ĐƠN HÀNG
        await sendOrderConfirmationEmail(newOrder);
        // Xử lý riêng cho từng phương thức thanh toán
        if (paymentMethod.value === 'cod') {
            Swal.fire({
                icon: 'success',
                title: 'Đặt hàng thành công!',
                text: 'Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang chờ xác nhận.',
                confirmButtonColor: '#000',
                confirmButtonText: 'Xem trạng thái đơn hàng'
            }).then(() => {
                store.dispatch('cart/deleteAllCart');
                router.push({
                    name: 'OrderStatus',
                    query: { status: 'success', orderId: newOrder.id }
                });
            });
        } else if (paymentMethod.value === 'vnpay') {
            sessionStorage.setItem('pendingOrderId', newOrder.id);
            const paymentPayload = {
                orderId: newOrder.id,
                amount: finalTotal.value,
                orderDescription: `Thanh toan cho don hang #${newOrder.id}`,
            };
            const { data } = await axios.post('http://localhost:3001/create_payment_url', paymentPayload);
            if (data.url) {
                window.location.href = data.url;
            } else {
                // Xử lý lỗi nếu không tạo được URL
                throw new Error("Không thể tạo URL thanh toán!");
            }
        }
    } catch (error) {
        console.error("Lỗi khi đặt hàng:", error);
        Swal.fire({
            icon: 'error',
            title: 'Đặt hàng thất bại!',
            text: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
            confirmButtonColor: '#000'
        });
        // Logic hoàn kho nếu cần thiết (tùy vào luồng nghiệp vụ)
    }
};
</script>

<template>
    <div class="container my-5">
        <div class="row">
            <div class="col-lg-7">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body p-4">
                        <h4 class="fw-bold mb-4">Thông tin giao hàng</h4>
                        <form @submit.prevent="placeOrder">
                            <div class="mb-3">
                                <label for="customerName" class="form-label">Họ và tên</label>
                                <input type="text" v-model="customerName" id="customerName" class="form-control"
                                    required>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="customerPhone" class="form-label">Số điện thoại</label>
                                    <input type="tel" v-model="customerPhone" id="customerPhone" class="form-control"
                                        required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="customerAddress" class="form-label">Địa chỉ</label>
                                    <input type="text" v-model="customerAddress" id="customerAddress"
                                        class="form-control" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="customerNote" class="form-label">Ghi chú (tùy chọn)</label>
                                <textarea v-model="customerNote" id="customerNote" class="form-control"
                                    rows="3"></textarea>
                            </div>

                            <h5 class="fw-bold my-4">Phương thức thanh toán</h5>
                            <div class="list-group">
                                <label class="list-group-item list-group-item-action d-flex align-items-center">
                                    <input type="radio" v-model="paymentMethod" value="cod" name="paymentMethod"
                                        class="form-check-input me-3">
                                    Thanh toán khi nhận hàng (COD)
                                </label>
                                <label class="list-group-item list-group-item-action d-flex align-items-center">
                                    <input type="radio" v-model="paymentMethod" value="vnpay" name="paymentMethod"
                                        class="form-check-input me-3">
                                    Thanh toán qua VNPay
                                </label>
                            </div>

                            <button type="submit" class="btn btn-dark w-100 mt-4 fw-semibold py-2">
                                {{ paymentMethod === 'cod' ? 'ĐẶT HÀNG' : 'TIẾN HÀNH THANH TOÁN VNPAY' }}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div class="col-lg-5">
                <div class="card border-0 shadow-sm sticky-top" style="top: 20px;">
                    <div class="card-body p-4">
                        <h4 class="fw-bold mb-3">Tóm tắt đơn hàng</h4>
                        <div v-for="item in cart" :key="item.id" class="d-flex align-items-center mb-3">
                            <img :src="item.image[0]" class="rounded"
                                style="width: 60px; height: 60px; object-fit: cover;">
                            <div class="ms-3 flex-grow-1">
                                <h6 class="mb-0 small">{{ item.name }}</h6>
                                <small class="text-muted">SL: {{ item.quantity }}</small>
                            </div>
                            <span class="fw-semibold small">{{ (item.discount * item.quantity).toLocaleString('vi-VN')
                            }} ₫</span>
                        </div>
                        <hr>
                        <div class="input-group mb-3">
                            <input type="text" v-model="couponCode" class="form-control" placeholder="Nhập mã giảm giá">
                            <button class="btn btn-outline-secondary" type="button" @click="applyCoupon">Áp
                                dụng</button>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Tạm tính</span>
                            <span>{{ subtotal.toLocaleString('vi-VN') }} ₫</span>
                        </div>
                        <div v-if="discountAmount > 0" class="d-flex justify-content-between mb-2 text-success">
                            <span>Giảm giá ({{ appliedCoupon.code }})</span>
                            <span>- {{ discountAmount.toLocaleString('vi-VN') }} ₫</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Phí vận chuyển</span>
                            <span v-if="shippingFee > 0">{{ shippingFee.toLocaleString('vi-VN') }} ₫</span>
                            <span v-else class="text-success">Miễn phí</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between fw-bold fs-5">
                            <span>Tổng cộng</span>
                            <span class="text-danger">{{ finalTotal.toLocaleString('vi-VN') }} ₫</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>