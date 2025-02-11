import firebase, { auth } from "@/libs/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

const erroCodeToMessageObj = {
    "auth/email-already-in-use": "Email is already in use. Please Login",
    "auth/invalid-credential": "",
};

let emailAppend = "@ke.com";

export default {
    name: "authModule",
    namespaced: true,
    state: () => ({}),
    mutations: {},
    actions: {
        async signupWithEmailAndPW({ commit, dispatch }, { phone, password }) {
            try {
                await createUserWithEmailAndPassword(
                    auth,
                    `${phone}${emailAppend}`,
                    password
                );

                await dispatch(
                    "userModule/updateUserToDB",
                    { uid: phone, passwordSet: true },
                    {
                        root: true,
                    }
                );
            } catch (error) {
                let message = erroCodeToMessageObj[error.code];

                if (message !== undefined) {
                    throw message;
                }

                commit(
                    "notificationModule/setAlert",
                    {
                        alertMessage: error.message,
                        error: true,
                    },
                    { root: true }
                );
            }
        },
        signInWithEmailAndPassword({ commit }, { phone, password }) {
            auth.signInWithEmailAndPassword(
                `${phone}${emailAppend}`,
                password
            ).catch((error) => {
                commit(
                    "notificationModule/setAlert",
                    {
                        alertMessage: "Invalid Credentials.",
                        error: true,
                    },
                    { root: true }
                );
            });
        },
        signout() {
            return auth.signOut().catch((error) => {
                commit(
                    "notificationModule/setAlert",
                    {
                        alertMessage:
                            "Something went wrong. Please refresh the page.",
                        error: true,
                    },
                    { root: true }
                );
            });
        },
    },
};
