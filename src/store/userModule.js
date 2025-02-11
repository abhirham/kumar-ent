import { db, serverTimestamp } from "@/libs/firebase";

export default {
    name: "userModule",
    namespaced: true,
    state: () => ({
        user: {},
    }),
    mutations: {
        setUser(state, payload) {
            state.user = payload;
        },
        updateUser(state, payload) {
            state.user = { ...state.user, ...payload };
        },
    },
    actions: {
        createUserToDB({ commit }, payload) {
            return db
                .collection("users")
                .doc(payload.uid)
                .set(
                    { payload, createdAt: serverTimestamp() },
                    { merge: true }
                );
        },
        updateUserToDB(ctx, { uid, ...payload }) {
            payload.updatedAt = serverTimestamp();

            return db.collection("users").doc(`${uid}`).update(payload);
        },
        fetchUserById({ commit }, { uid }) {
            return db
                .collection("users")
                .doc(`${uid}`)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        return doc.data();
                    } else {
                        throw { message: "User not found." };
                    }
                })
                .catch((e) => {
                    console.log(e);
                    throw e.message;
                });
        },
        updateCourseProgress({ commit, state, dispatch }, { dataToUpdate }) {
            return db
                .collection("users")
                .doc(state.user.uid)
                .update({ purchasedCourses: dataToUpdate })
                .then((res) => {
                    commit("updateUser", { purchasedCourses: dataToUpdate });
                });
        },
    },
};
