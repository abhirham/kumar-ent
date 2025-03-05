import { db, serverTimestamp, arrayUnion } from "@/libs/firebase";

export default {
    name: "machineModule",
    namespaced: true,
    state: {
        products: [],
    },
    mutations: {
        addProducts(state, payload) {
            state.products = Object.values(
                state.products
                    .concat(payload)
                    .reduce((acc, x) => ({ ...acc, [x.name]: x }), {})
            );
        },
    },
    actions: {
        addProductsToDB({ commit }, payload) {
            return db
                .collection("products")
                .doc("products")
                .set({ products: arrayUnion(...payload) }, { merge: true })
                .then((res) => commit("addProducts", payload));
        },
        addReadings({ rootState }, payload) {
            let ref = db.collection("readings").doc();

            payload.id = ref.id;
            payload.createdAt = serverTimestamp();
            payload.createdBy = rootState.userModule.user.uid;

            return ref.set(payload);
        },
        fetchReadings() {
            return db
                .collection("readings")
                .orderBy("createdAt")
                .get()
                .then((res) => {
                    let arr = [];

                    res.forEach((x) => arr.push(x.data()));

                    return arr;
                });
        },
        fetchProducts({ commit }) {
            return db
                .collection("products")
                .doc("products")
                .get()
                .then((res) => {
                    if (!res.exists) return [];

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
