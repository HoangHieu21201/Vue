<template>
    <div class="container my-5">
        <!-- Giới thiệu thương hiệu -->
        <div class="text-center mb-5">
            <h2 class="fw-bold">Về Chúng Tôi</h2>
            <p class="text-muted mx-auto" style="max-width: 600px;">
                Chúng tôi là một đội ngũ trẻ đam mê công nghệ và thời trang, với sứ mệnh mang đến cho bạn
                trải nghiệm mua sắm hiện đại, nhanh chóng và chất lượng nhất.
            </p>
        </div>

        <!-- Ảnh + mô tả -->
        <div class="row align-items-center mb-5">
            <div class="col-md-6 mb-4 mb-md-0">
                <img src="https://images.unsplash.com/photo-1521335629791-ce4aec67dd53?auto=format&fit=crop&w=800&q=80"
                    class="img-fluid rounded shadow-sm" alt="about" />
            </div>
            <div class="col-md-6">
                <h4 class="fw-bold mb-3">Tầm nhìn & Sứ mệnh</h4>
                <p class="text-muted">
                    Chúng tôi mong muốn trở thành nền tảng thương mại điện tử hàng đầu, mang lại sự tiện lợi
                    và đáng tin cậy cho khách hàng Việt Nam. Từng sản phẩm đều được chọn lọc kỹ lưỡng, đảm bảo
                    chất lượng và giá trị tốt nhất cho người dùng.
                </p>
                <ul class="list-unstyled mt-3">
                    <li><i class="fa fa-check text-success me-2"></i>Sản phẩm chất lượng cao</li>
                    <li><i class="fa fa-check text-success me-2"></i>Giá cả cạnh tranh, minh bạch</li>
                    <li><i class="fa fa-check text-success me-2"></i>Giao hàng nhanh chóng, an toàn</li>
                    <li><i class="fa fa-check text-success me-2"></i>Dịch vụ chăm sóc khách hàng tận tâm</li>
                </ul>
            </div>
        </div>

        <!-- Đội ngũ -->
        <div class="text-center mb-4">
            <h4 class="fw-bold mb-3">Đội Ngũ Của Chúng Tôi</h4>
            <p class="text-muted">Những người đứng sau thương hiệu của bạn 💪</p>
        </div>

        <div class="row g-4 justify-content-center">
            <div class="col-6 col-md-4 col-lg-3" v-for="(member, index) in team" :key="index">
                <div class="card border-0 shadow-sm text-center rounded-4 p-3 h-100">
                    <img :src="member.img" class="rounded-circle mx-auto mb-3" width="100" height="100" />
                    <h6 class="fw-bold">{{ member.name }}</h6>
                    <p class="text-muted small mb-1">{{ member.role }}</p>
                    <div class="social-links">
                        <a href="#" class="text-dark me-2"><i class="fab fa-facebook"></i></a>
                        <a href="#" class="text-dark me-2"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="text-dark"><i class="fab fa-github"></i></a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Liên hệ -->
        <div class="text-center mt-5">
            <h5 class="fw-bold mb-3">Liên hệ với chúng tôi</h5>
            <p class="text-muted mb-1">
                <i class="fa fa-envelope me-2"></i>support@minhstore.vn
            </p>
            <p class="text-muted mb-1">
                <i class="fa fa-phone me-2"></i>0123 456 789
            </p>
            <p class="text-muted mb-0">
                <i class="fa fa-map-marker me-2"></i>TP. Hồ Chí Minh, Việt Nam
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const team = ref([
    {
        name: 'Minh gió tai',
        role: 'Founder & Developer',
        img: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
    },
    {
        name: 'Hà My',
        role: 'UI/UX Designer',
        img: 'https://cdn-icons-png.flaticon.com/512/921/921071.png'
    },
    {
        name: 'Khánh Duy',
        role: 'Marketing Lead',
        img: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
    },
    {
        name: 'An Nhiên',
        role: 'Customer Support',
        img: 'https://cdn-icons-png.flaticon.com/512/921/921071.png'
    }
])
</script>

<style scoped>
img {
    object-fit: cover;
}

.card img {
    transition: 0.3s ease;
}

.card:hover img {
    transform: scale(1.05);
}

.card:hover {
    transform: translateY(-4px);
    transition: 0.3s;
}
</style>
