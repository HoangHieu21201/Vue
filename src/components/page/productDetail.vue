<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const Toast = useToast();
const product = ref(null);
const route = useRoute();
const router = useRouter();
const store = useStore();
const categories = ref([]);
const relatedProducts = ref([]);
const isFavorited = ref(false);
const selectedQuantity = ref(1);
const reviews = ref([]);

// >> MỚI: State cho sản phẩm bán chạy
const bestSellingProducts = ref([]);

const replyingToReviewId = ref(null);
const newReplyComment = ref('');

const averageRating = computed(() => {
    if (!reviews.value || reviews.value.length === 0) {
        return 0;
    }
    const totalRating = reviews.value.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / reviews.value.length) * 10) / 10;
});

const getReviews = async () => {
    if (!route.params.id) return;
    try {
        const response = await axios.get(`http://localhost:3000/reviews?productId=${route.params.id}&_expand=user`);
        reviews.value = response.data;
    } catch (error) {
        console.error("Lỗi khi tải đánh giá:", error);
    }
};

const toggleReplyForm = (reviewId) => {
    const user = getLoggedInUser();
    if (!user) {
        Toast.error('Bạn cần đăng nhập để trả lời đánh giá!', { theme: "colored" });
        router.push('/login');
        return;
    }
    if (replyingToReviewId.value === reviewId) {
        replyingToReviewId.value = null;
    } else {
        replyingToReviewId.value = reviewId;
        newReplyComment.value = '';
    }
};

const submitReply = async (reviewId) => {
    const user = getLoggedInUser();
    if (!user) {
        Toast.error('Bạn cần đăng nhập để gửi trả lời!', { theme: "colored" });
        return;
    }
    if (!newReplyComment.value.trim()) {
        Toast.warning('Vui lòng nhập nội dung trả lời.', { theme: "colored" });
        return;
    }
    try {
        const reviewToUpdate = reviews.value.find(r => r.id === reviewId);
        if (!reviewToUpdate) return;

        const newReply = {
            id: Date.now(),
            userId: user.id,
            user: {
                id: user.id,
                fullname: user.fullname,
            },
            comment: newReplyComment.value,
            createdAt: new Date().toISOString()
        };

        if (!reviewToUpdate.replies) {
            reviewToUpdate.replies = [];
        }
        reviewToUpdate.replies.push(newReply);

        await axios.patch(`http://localhost:3000/reviews/${reviewId}`, {
            replies: reviewToUpdate.replies
        });

        Toast.success('Gửi trả lời thành công!', { theme: "colored" });
        replyingToReviewId.value = null;
        newReplyComment.value = '';
    } catch (error) {
        console.error("Lỗi khi gửi trả lời:", error);
        Toast.error('Đã có lỗi xảy ra. Vui lòng thử lại.', { theme: "colored" });
    }
};

const increaseQuantity = () => {
    if (product.value && selectedQuantity.value < product.value.quantity) {
        selectedQuantity.value++;
    }
};

const decreaseQuantity = () => {
    if (selectedQuantity.value > 1) {
        selectedQuantity.value--;
    }
};

const getLoggedInUser = () => {
    const user = localStorage.getItem('loggedInUser');
    return user ? JSON.parse(user) : null;
};

const checkFavoriteStatus = async () => {
    if (!product.value) return;
    const user = getLoggedInUser();
    if (!user) {
        isFavorited.value = false;
        return;
    }
    try {
        const { data: userWishlists } = await axios.get(`http://localhost:3000/wishlist?userId=${user.id}`);
        if (userWishlists.length > 0) {
            const userWishlist = userWishlists[0];
            isFavorited.value = userWishlist.products.some(p => p.id === product.value.id);
        } else {
            isFavorited.value = false;
        }
    } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
        isFavorited.value = false;
    }
};

const isTogglingWishlist = ref(false);

const toggleWishlist = async () => {
    if (isTogglingWishlist.value || !product.value) return;
    const user = getLoggedInUser();
    if (!user) {
        Toast.error('Bạn cần đăng nhập để sử dụng chức năng này!', { theme: "colored" });
        router.push('/login');
        return;
    }
    isTogglingWishlist.value = true;
    try {
        const { data: userWishlists } = await axios.get(`http://localhost:3000/wishlist?userId=${user.id}`);
        let actionMessage = '';
        if (userWishlists.length > 0) {
            let userWishlist = userWishlists[0];
            const productIndex = userWishlist.products.findIndex(p => p.id === product.value.id);
            if (productIndex !== -1) {
                userWishlist.products.splice(productIndex, 1);
                actionMessage = 'Đã xóa khỏi danh sách yêu thích';
            } else {
                const { id, name, image, price, discount } = product.value;
                userWishlist.products.push({ id, name, image, price, discount });
                actionMessage = 'Đã thêm vào danh sách yêu thích';
            }
            await axios.put(`http://localhost:3000/wishlist/${userWishlist.id}`, userWishlist);
        } else {
            const { id, name, image, price, discount } = product.value;
            const newWishlist = {
                userId: user.id,
                products: [{ id, name, image, price, discount }]
            };
            await axios.post('http://localhost:3000/wishlist', newWishlist);
            actionMessage = 'Đã thêm vào danh sách yêu thích';
        }
        isFavorited.value = !isFavorited.value;
        if (isFavorited.value) {
            Toast.success(actionMessage, { theme: "colored" });
        } else {
            Toast.info(actionMessage, { theme: "colored" });
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật danh sách yêu thích:', error);
    } finally {
        isTogglingWishlist.value = false;
    }
};

const readProductDetail = async () => {
    try {
        const res = await axios.get(`http://localhost:3000/products/${route.params.id}`)
        product.value = res.data
        selectedQuantity.value = 1;
        if (product.value?.categoryId) {
            await readRelatedProducts(product.value.categoryId);
        }
        await checkFavoriteStatus();
        await getReviews();
    } catch (err) {
        console.error('Lỗi tải sản phẩm: ', err)
    }
}

const readCategories = async () => {
    try {
        const res = await axios.get(`http://localhost:3000/categories`)
        categories.value = res.data
    } catch (err) {
        console.error('Err: ', err)
    }
}

const readRelatedProducts = async (categoryId) => {
    try {
        const res = await axios.get(`http://localhost:3000/products?categoryId=${categoryId}`)
        relatedProducts.value = res.data.filter(p => p.id !== product.value.id)
    } catch (err) {
        console.error('Lỗi khi tải sản phẩm liên quan:', err)
    }
}

// >> MỚI: Hàm lấy sản phẩm bán chạy
const fetchBestSellingProducts = async () => {
    try {
        // 1. Lấy tất cả đơn hàng đã giao thành công
        const { data: orders } = await axios.get('http://localhost:3000/orders?status=Đã giao');

        // 2. Thống kê số lượng bán ra của mỗi sản phẩm
        const productSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (productSales[item.id]) {
                    productSales[item.id] += item.quantity;
                } else {
                    productSales[item.id] = item.quantity;
                }
            });
        });

        // 3. Sắp xếp và lấy ra 4 ID bán chạy nhất
        const sortedProducts = Object.entries(productSales).sort(([, a], [, b]) => b - a);
        const top4Ids = sortedProducts.slice(0, 4).map(([id]) => id);

        if (top4Ids.length === 0) return;

        // 4. Lấy thông tin chi tiết của 4 sản phẩm đó
        const productPromises = top4Ids.map(id => axios.get(`http://localhost:3000/products/${id}`));
        const productResponses = await Promise.all(productPromises);
        bestSellingProducts.value = productResponses.map(res => res.data);

    } catch (error) {
        console.error('Lỗi khi tải sản phẩm bán chạy:', error);
    }
};


const addToCart = () => {
    if (!product.value) return;
    try {
        const productToAdd = {
            ...product.value,
            quantity: selectedQuantity.value
        };
        store.dispatch('cart/addProductToCart', productToAdd);
        Toast.success(`Đã thêm sản phẩm vào giỏ hàng!`, { theme: "colored" });
    } catch (err) {
        console.error('Lỗi khi thêm vào giỏ hàng:', err);
        Toast.error('Có lỗi xảy ra, vui lòng thử lại.', { theme: "colored" });
    }
}

onMounted(() => {
    readCategories();
    readProductDetail();
    fetchBestSellingProducts(); // >> MỚI: Gọi hàm
})

watch(() => route.params.id, () => {
    readProductDetail();
})
</script>

<template>
    <div v-if="product" class="container my-5">
        <div class="row g-4">
            <div class="col-md-6">
                <div class="border rounded p-3 bg-white shadow-sm">
                    <img :src="product.image[0]" class="img-fluid w-100 rounded mb-3 main-img" alt="product" />
                    <div class="d-flex gap-2">
                        <img v-for="(img, idx) in product.image" :key="idx" :src="img" class="img-thumbnail small-img"
                            alt="gallery" />
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="p-3">
                    <h2 class="fw-bold mb-2">{{ product.name }}</h2>

                    <p class="text-muted mb-1">
                        Danh mục:
                        {{ categories.find(c => c.id === product.categoryId)?.nameCategory || "Không có" }}
                    </p>

                    <div class="d-flex align-items-center mb-2">
                        <span class="text-warning me-2">
                            <i v-for="star in 5" :key="star" class="fa"
                                :class="star <= Math.round(averageRating) ? 'fa-star' : 'fa-star-o'"></i>
                        </span>
                        <span class="text-muted" v-if="reviews.length > 0">
                            {{ averageRating.toFixed(1) }} ({{ reviews.length }} đánh giá)
                        </span>
                    </div>

                    <div class="mb-3">
                        <span class="text-muted text-decoration-line-through me-2">
                            {{ Number(product.price).toLocaleString('vi-VN') }} ₫
                        </span>
                        <span class="fw-bold text-danger fs-4">
                            {{ Number(product.discount).toLocaleString('vi-VN') }} ₫
                        </span>
                        <span class="badge bg-success ms-2">
                            -{{ Math.round(100 - (product.discount / product.price) * 100) }}%
                        </span>
                    </div>

                    <div class="mt-4 mb-3">
                        <label for="quantity" class="form-label fw-bold">Số lượng:</label>
                        <div class="input-group quantity-selector" style="max-width: 150px;">
                            <button class="btn btn-outline-secondary" type="button" @click="decreaseQuantity">-</button>
                            <input type="text" class="form-control text-center" v-model.number="selectedQuantity"
                                readonly>
                            <button class="btn btn-outline-secondary" type="button" @click="increaseQuantity">+</button>
                        </div>
                        <div class="form-text mt-2">Còn lại {{ product.quantity }} sản phẩm</div>
                    </div>

                    <div class="mt-4 d-flex gap-3">
                        <button @click="addToCart" class="btn btn-dark px-4 py-2" :disabled="product.quantity === 0">
                            <i class="fa fa-shopping-cart me-2"></i>
                            {{ product.quantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng' }}
                        </button>
                        <button @click="toggleWishlist" class="btn px-4 py-2"
                            :class="isFavorited ? 'btn-danger' : 'btn-outline-danger'">
                            <i class="fa me-2" :class="isFavorited ? 'fa-heart-crack' : 'fa-heart'"></i>
                            {{ isFavorited ? 'Bỏ yêu thích' : 'Yêu thích' }}
                        </button>
                    </div>
                    <div class="mt-4">
                        <h3>Mô tả sản phẩm</h3>
                        <p class="text-secondary">{{ product.description }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-5">
            <h4 class="fw-bold mb-3 border-bottom pb-2">Đánh giá từ khách hàng</h4>
            <div v-if="reviews.length > 0" class="reviews-list">
                <div v-for="review in reviews" :key="review.id" class="review-item mb-4 border-bottom pb-3">
                    <div class="d-flex align-items-center mb-2">
                        <img src="https://wiztree.co.uk/wp-content/uploads/2024/05/user-icon-1024x1024-dtzturco.png"
                            class="rounded-circle me-3" width="45" height="45" alt="avatar">
                        <div>
                            <h6 class="mb-0 fw-semibold">{{ review.user?.fullname || 'Người dùng ẩn danh' }}</h6>
                            <small class="text-muted">{{ new Date(review.createdAt).toLocaleDateString('vi-VN')
                            }}</small>
                        </div>
                    </div>
                    <div class="mb-2">
                        <span class="text-warning">
                            <i v-for="star in 5" :key="star" class="fa"
                                :class="star <= review.rating ? 'fa-star' : 'fa-star-o'"></i>
                        </span>
                    </div>
                    <p class="mb-2 fst-italic">"{{ review.comment }}"</p>
                    <button @click="toggleReplyForm(review.id)" class="btn btn-sm btn-outline-primary mb-3">
                        <i class="fa fa-reply me-1"></i> Trả lời
                    </button>

                    <div v-if="replyingToReviewId === review.id" class="reply-form ps-4 mb-3">
                        <textarea v-model="newReplyComment" class="form-control form-control-sm" rows="2"
                            placeholder="Viết câu trả lời của bạn..."></textarea>
                        <button @click="submitReply(review.id)" class="btn btn-sm btn-primary mt-2">Gửi</button>
                    </div>

                    <div v-if="review.replies && review.replies.length > 0"
                        class="replies-list ps-4 border-start ms-3">
                        <div v-for="reply in review.replies" :key="reply.id" class="reply-item mb-3">
                            <div class="d-flex align-items-center mb-1">
                                <img src="https://cdn-icons-png.flaticon.com/512/6522/6522516.png"
                                    class="rounded-circle me-2" width="30" height="30" alt="avatar">
                                <div>
                                    <h6 class="mb-0 small fw-semibold">{{ reply.user?.fullname || 'Người dùng ẩn danh' }}
                                    </h6>
                                    <small class="text-muted">{{ new Date(reply.createdAt).toLocaleDateString('vi-VN')
                                    }}</small>
                                </div>
                            </div>
                            <p class="mb-0 small ps-4">{{ reply.comment }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="text-center p-4 bg-light rounded">
                <p class="text-muted mb-0">Chưa có đánh giá nào cho sản phẩm này.</p>
            </div>
        </div>

        <div v-if="relatedProducts.length" class="mt-5">
            <h4 class="fw-bold mb-3 border-bottom pb-2">Sản phẩm liên quan</h4>
            <div class="related-products">
                <div v-for="item in relatedProducts" :key="item.id" class="related-card">
                    <router-link :to="`/productDetail/${item.id}`">
                        <img :src="item.image[0]" class="related-img" alt="related" />
                    </router-link>
                    <div class="related-body">
                        <h6 class="related-title text-truncate">{{ item.name }}</h6>
                        <p class="related-price mb-0">
                            {{ Number(item.discount).toLocaleString('vi-VN') }} ₫
                        </p>
                        <router-link :to="`/productDetail/${item.id}`" class="btn btn-primary">
                            Xem chi tiết
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="bestSellingProducts.length > 0" class="mt-5">
            <h4 class="fw-bold mb-3 border-bottom pb-2">Sản phẩm bán chạy</h4>
            <div class="related-products">
                 <div v-for="item in bestSellingProducts" :key="item.id" class="related-card">
                    <router-link :to="`/productDetail/${item.id}`">
                        <img :src="item.image[0]" class="related-img" alt="related" />
                    </router-link>
                    <div class="related-body">
                        <h6 class="related-title text-truncate">{{ item.name }}</h6>
                        <p class="related-price mb-0">
                            {{ Number(item.discount).toLocaleString('vi-VN') }} ₫
                        </p>
                        <router-link :to="`/productDetail/${item.id}`" class="btn btn-primary">
                            Xem chi tiết
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <p v-else class="text-center text-muted mt-5">Loading Product...</p>
</template>

<style scoped>
.main-img {
    height: 400px;
    object-fit: cover;
}

.small-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    cursor: pointer;
    transition: 0.3s;
}

.small-img:hover {
    transform: scale(1.05);
    border-color: #000;
}

.quantity-selector input {
    background-color: #fff !important;
}

.hover-card {
    transition: 0.3s;
}

.hover-card:hover {
    transform: translateY(-5px);
}

@media (max-width: 768px) {
    .main-img {
        height: 300px;
    }
}

.related-products {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
}

.related-card {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.related-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
}

.related-img {
    width: 100%;
    height: 220px;
    object-fit: cover;
}

.related-body {
    padding: 15px;
    text-align: center;
    flex-grow: 1;
}

.related-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #222;
    min-height: 40px;
}

.related-price {
    color: #d32f2f;
    font-weight: bold;
    font-size: 16px;
}
</style>