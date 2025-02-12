<template>
    <Alerts />
    <Navbar />
    <main class="m-5">
        <RouterView v-if="user.uid" />
        <Login v-else />
    </main>
</template>

<script>
import { RouterView } from "vue-router";
import { emailAppend } from "@/constants";
import Navbar from "./components/Navbar.vue";
import Alerts from "./components/Alerts.vue";
import "./assets/main.css";
import { auth } from "@/libs/firebase";
import Login from "./views/Login.vue";

export default {
    components: { Login, Navbar, Alerts },
    data() {
        return {
            showLogin: true,
        };
    },
    computed: {
        user() {
            return this.$store.state.userModule.user;
        },
    },
    mounted() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.$store
                    .dispatch("userModule/fetchUserById", {
                        uid: user.email.replace(emailAppend, ""),
                    })
                    .then((res) => {
                        this.$store.commit("userModule/setUser", res);
                    });
            } else {
                this.$store.commit("userModule/setUser", {});
            }
        });
    },
};
</script>
