import { db, serverTimestamp } from "@/libs/firebase";

export default {
    name: "machineModule",
    namespaced: true,
    actions: {
        createMachineToDB({ commit }, payload) {
            return db
                .collection("machines")
                .doc(payload.uid)
                .set(
                    { ...payload, createdAt: serverTimestamp() },
                    { merge: true }
                );
        },
        updateMachineToDB(ctx, { uid, ...payload }) {
            payload.updatedAt = serverTimestamp();

            return db.collection("machines").doc(`${uid}`).update(payload);
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
