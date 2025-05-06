import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDQeTqA8c7ChSL3ky2LBbhxbqCPA_et80k",
    authDomain: "manovaani-bf5fd.firebaseapp.com",
    databaseURL: "https://manovaani-bf5fd-default-rtdb.firebaseio.com",
    projectId: "manovaani-bf5fd",
    storageBucket: "manovaani-bf5fd.firebasestorage.app",
    messagingSenderId: "104911376845",
    appId: "1:104911376845:web:7181cb81a759e0bbf77484",
    measurementId: "G-G63HRXR7E7"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth };