// src/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAFTLpCb50DK7v5ZeyoHK_q2vejMCfU_9A",
  authDomain: "squirrel-fe1cf.firebaseapp.com",
  projectId: "squirrel-fe1cf",
  storageBucket: "squirrel-fe1cf.firebasestorage.app",
  messagingSenderId: "692108966134",
  appId: "1:692108966134:web:99143b51106c53d5bf54d7",
  measurementId: "G-TML024554Q",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;