import { db, serverTimestamp, arrayUnion } from "@/libs/firebase";

export default {
    name: "machineModule",
    namespaced: true,
    state: {
        products: [],
    },
    mutations: {
        addProducts(state, payload) {
            state.products = Object.keys(
                state.products
                    .concat(payload)
                    .reduce((acc, x) => ({ ...acc, [x]: 1 }), {})
            );
        },
    },
    actions: {
        addProductsToDB({ commit }, payload) {
            return db
                .collection("products")
                .doc("products")
                .update({ products: arrayUnion(...payload) })
                .then((res) => commit("addProducts", payload));
        },
        fetchProducts({ commit }) {
            return db
                .collection("products")
                .doc("products")
                .get()
                .then((res) => {
                    let arr = res.data().products;

                    commit("addProducts", arr);

                    return arr;
                });
        },
        createMachineToDB({ commit }, payload) {
            return db
                .collection("machines")
                .doc(payload.id)
                .set(
                    { ...payload, createdAt: serverTimestamp() },
                    { merge: true }
                );
        },
        updateMachineToDB(ctx, { id, ...payload }) {
            payload.updatedAt = serverTimestamp();

            return db.collection("machines").doc(`${id}`).update(payload);
        },
        fetchMachinesFromDB() {
            return db
                .collection("machines")
                .get()
                .then((res) => {
                    let arr = [];

                    res.forEach((x) => arr.push(x.data()));

                    return arr;
                });
        },
        // fetchMachineById({ commit }, { uid }) {
        //     return db
        //         .collection("machines")
        //         .doc(`${uid}`)
        //         .get()
        //         .then((doc) => {
        //             if (doc.exists) {
        //                 return doc.data();
        //             } else {
        //                 throw { message: "Machine not found." };
        //             }
        //         });
        // },
    },
};
