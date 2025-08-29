
// This file is intentionally left blank.
// All Firebase connectivity has been removed in favor of a mock data implementation.
// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
 apiKey: "AIzaSyArunzWNoZIH3O9X7-iaKVZ5FNDlICK3p4",
  authDomain: "vivamove-d80cb.firebaseapp.com",
  projectId: "vivamove-d80cb",
  storageBucket: "vivamove-d80cb.firebasestorage.app",
  messagingSenderId: "273897562311",
  appId: "1:273897562311:web:657f044183e3cb28579ee2",
  measurementId: "G-3QHJW03S41"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
