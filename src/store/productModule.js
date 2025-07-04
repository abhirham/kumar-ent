import { db, serverTimestamp } from "@/libs/firebase";

export default {
    name: "productModule",
    namespaced: true,
    state: {
        products: {},
    },
    mutations: {
        setProducts(state, payload) {
            state.products = payload;
        },
    },
    actions: {
        updateProducts({ commit }, products) {
            return db
                .collection("products")
                .doc("products")
                .set({ products })
                .then((res) => commit("setProducts", products));
        },

        fetchProducts({ commit }) {
            return db
                .collection("products")
                .doc("products")
                .get()
                .then((res) => {
                    if (!res.exists) return {};

                    return res.data().products;
                })
                .then((res) => {
                    commit("setProducts", res);

                    return res;
                });
        },
    },
};
