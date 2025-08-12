
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword
} from "firebase/auth";
import type { User } from 'firebase/auth';

export const firebaseConfig = {
  "projectId": "viva-move",
  "appId": "1:997059442824:web:d60cc73cfc7a0a54fc873d",
  "storageBucket": "viva-move.firebasestorage.app",
  "apiKey": "AIzaSyCnh0gRKh4eoINH2Aw9B5YeMMqq5wWpEu4",
  "authDomain": "viva-move.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "997059442824"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { 
    auth, 
    provider,
    signInWithEmailAndPassword
};
export type { User };
