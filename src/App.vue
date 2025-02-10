<template>
    <div class="my-5 mx-auto container">
        <Navbar />
        <main class="m-5">
            <Login v-if="showLogin" />
            <RouterView v-else />
        </main>
    </div>
</template>

<script>
import { RouterView } from "vue-router";
import Navbar from "./components/Navbar.vue";
import "./assets/main.css";
import { auth } from "@/libs/firebase";
import Login from "./views/Login.vue";

export default {
    components: { Login },
    data() {
        return {
            showLogin: true,
        };
    },
    mounted() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.showLogin = false;
                console.log("user logged in");
            } else {
                this.showLogin = true;
                console.log("user not logged in");
            }
        });
    },
};
</script>
