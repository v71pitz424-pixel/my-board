import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {

    apiKey: "AIzaSyAIFg74dPDvRvU2xnOAghboJqRayvS135s",

    authDomain:
    "my-board-780d9.firebaseapp.com",

    projectId:
    "my-board-780d9",

    storageBucket:
    "my-board-780d9.firebasestorage.app",

    messagingSenderId:
    "684629399074",

    appId:
    "1:684629399074:web:d4208e159b75b472485c7b"

};

const app =
    initializeApp(
        firebaseConfig
    );

export const db =
    getFirestore(app);