import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDN7xlnIw6bL9O73EAvxGvzqBY0pymnHs4",
  authDomain: "storyspark-490105-8d748.firebaseapp.com",
  projectId: "storyspark-490105-8d748",
  storageBucket: "storyspark-490105-8d748.firebasestorage.app",
  messagingSenderId: "149988503575",
  appId: "1:149988503575:web:b78389aa56183704d5ac52"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function ensureAuth() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  return auth.currentUser;
}
