<template>
    <div class="notfound d-flex flex-column justify-content-center align-items-center text-center">
        <h1 class="display-1 fw-bold text-dark glitch">404</h1>
        <p class="lead text-secondary mb-4">
            Oops... The page you’re looking for doesn’t exist or has been moved 🕵️‍♂️
        </p>
        <router-link to="/" class="btn btn-dark px-4 py-2 rounded-pill fw-semibold">
            Back to Home
        </router-link>
    </div>
</template>

<style scoped>
.notfound {
    height: 100vh;
    background: linear-gradient(180deg, #ffffff, #f3f3f3);
    color: #222;
    font-family: 'Poppins', sans-serif;
}

.glitch {
    position: relative;
    color: #111;
    text-shadow: 2px 2px #999;
    animation: glitch 1.5s infinite;
}

@keyframes glitch {
    0% {
        text-shadow: 2px 2px #999;
    }

    20% {
        text-shadow: -2px -2px #ccc;
    }

    40% {
        text-shadow: 2px -2px #aaa;
    }

    60% {
        text-shadow: -2px 2px #bbb;
    }

    80% {
        text-shadow: 1px -1px #888;
    }

    100% {
        text-shadow: 2px 2px #999;
    }
}

.btn-dark {
    background-color: #111;
    border: none;
    transition: 0.3s;
}

.btn-dark:hover {
    background-color: #333;
    transform: translateY(-2px);
}
</style>
