import { db, serverTimestamp } from "@/libs/firebase";

export default {
    name: "companyModule",
    namespaced: true,
    state: {
        companies: {},
    },
    mutations: {
        setCompanies(state, payload) {
            state.companies = payload;
        },
    },
    actions: {
        createCompanyToDB({ commit }, payload) {
            let ref = db.collection("masterLocations").doc();

            return ref.set(
                { ...payload, createdAt: serverTimestamp(), id: ref.id },
                { merge: true }
            );
        },
        updateCompanyToDB(ctx, { id, ...payload }) {
            payload.updatedAt = serverTimestamp();

            return db
                .collection("masterLocations")
                .doc(`${id}`)
                .update(payload);
        },
        fetchCompaniesFromDB({ commit }) {
            return db
                .collection("masterLocations")
                .get()
                .then((res) => {
                    let obj = {};

                    res.forEach((x) => {
                        let data = x.data();

                        obj[data.id] = data;
                    });
                    commit("setCompanies", obj);
                    return obj;
                });
        },
    },
};
