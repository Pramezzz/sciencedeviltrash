import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyBdQ0Pqfx_Gt8HPVeimJzpe3Q7Y0PMdDw",
    authDomain: "plastic-sort-game.firebaseapp.com",
    projectId: "plastic-sort-game",
    storageBucket: "plastic-sort-game.firebasestorage.app",
    messagingSenderId: "1037077455834",
    appId: "1:1037077455834:web:b52f9cc5ffcbb7bb3f856e3"
};


const app =
    initializeApp(firebaseConfig);


const db =
    getFirestore(app);


export { db };