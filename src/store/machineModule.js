import { db, serverTimestamp, arrayUnion, Timestamp } from "@/libs/firebase";
import moment from "moment";

export default {
    name: "machineModule",
    namespaced: true,
    state: {
        products: [],
        machines: [],
    },
    mutations: {
        addProducts(state, payload) {
            state.products = Object.values(
                state.products
                    .concat(payload)
                    .reduce((acc, x) => ({ ...acc, [x.name]: x }), {})
            );
        },
        setMachines(state, payload) {
            state.machines = payload;
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
            payload.createdAt = payload.createdAt
                ? Timestamp.fromDate(new Date(payload.createdAt))
                : serverTimestamp();

            payload.createdBy = rootState.userModule.user.uid;

            return ref
                .set(payload)
                .then((res) => ref.get().then((res) => res.data()));
        },
        fetchReadings(_, { startDate, endDate }) {
            const startOfDay = moment(startDate).startOf("day").toDate();
            const endOfDay = moment(endDate).endOf("day").toDate();

            return db
                .collection("readings")
                .orderBy("machineId")
                .orderBy("createdAt")
                .where("createdAt", ">=", startOfDay)
                .where("createdAt", "<", endOfDay)
                .get()
                .then((res) => {
                    let arr = [];

                    res.forEach((x) => arr.push(x.data()));

                    return arr;
                });
        },
        fetchReadingsByMachine(_, { startDate, endDate, machineID }) {
            const startOfDay = moment(startDate).startOf("day").toDate();
            const endOfDay = moment(endDate).endOf("day").toDate();

            return db
                .collection("readings")
                .orderBy("machineId")
                .orderBy("createdAt")
                .where("machineId", "==", machineID)
                .where("createdAt", ">=", startOfDay)
                .where("createdAt", "<", endOfDay)
                .get()
                .then((res) => {
                    let arr = [];

                    res.forEach((x) => arr.push(x.data()));

                    return arr;
                });
        },
        fetchLatestReadingsBydMachine({}, { machineID }) {
            return db
                .collection("readings")
                .where("machineId", "==", machineID)
                .orderBy("createdAt", "desc")
                .limit(1)
                .get()
                .then((res) => {
                    if (res.empty) return null;

                    return res.docs[0].data();
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
        fetchMachinesFromDB({ commit }) {
            return db
                .collection("machines")
                .get()
                .then((res) => {
                    let arr = [];

                    res.forEach((x) => arr.push(x.data()));
                    commit("setMachines", arr);
                    return arr;
                });
        },
        deleteReadingById({ commit, state }, { id }) {
            return db.collection("readings").doc(id).delete();
        },
    },
};
