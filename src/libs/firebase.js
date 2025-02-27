import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";
import { serverTimestamp, FieldValue, arrayUnion } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDNBhrRCNqek2BPqjpRLjtLE1C7c-PqWbg",
    authDomain: "kumar-ent.firebaseapp.com",
    projectId: "kumar-ent",
    storageBucket: "kumar-ent.firebasestorage.app",
    messagingSenderId: "798171020621",
    appId: "1:798171020621:web:240054d6d57f61eab40b04",
    measurementId: "G-1CL8MBC6YM",
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();

export const auth = firebase.auth();

export const storageRef = firebase.storage().ref();

export { serverTimestamp, FieldValue, arrayUnion };

export default firebase;
