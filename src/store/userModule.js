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
                    { ...payload, createdAt: serverTimestamp() },
                    { merge: true }
                );
        },
        updateUserToDB(ctx, { uid, ...payload }) {
            payload.updatedAt = serverTimestamp();

            return db.collection("users").doc(`${uid}`).update(payload);
        },
        fetchUsersFromDB() {
            return db
                .collection("users")
                .get()
                .then((res) => {
                    let arr = [];

                    res.forEach((x) => arr.push(x.data()));

                    return arr;
                });
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
                });
        },
    },
};
