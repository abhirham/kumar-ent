import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: () => import("../views/HomeView.vue"),
        },
        {
            path: "/admin",
            name: "admin",
            component: () => import("../views/AdminView.vue"),
            beforeEnter(to, from, next) {
                if (store.state.userModule.user.isAdmin) {
                    return next();
                }

                return next({ name: "home" });
            },
        },
    ],
});

export default router;
