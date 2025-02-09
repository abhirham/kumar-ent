<script setup>
import { RouterLink, RouterView } from "vue-router";
import HelloWorld from "./components/HelloWorld.vue";
import Navbar from "./components/Navbar.vue";
import "./assets/main.css";
</script>

<template>
    <div class="my-5 mx-auto container">
        <Navbar />
        <main class="m-5">
            <RouterView />
        </main>
    </div>
</template>
