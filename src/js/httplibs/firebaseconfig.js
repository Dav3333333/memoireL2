// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0sQhkJIB-88rN97vQjT1-fM2-qQRjfw4",
  authDomain: "cacao-28037.firebaseapp.com",
  projectId: "cacao-28037",
  storageBucket: "cacao-28037.firebasestorage.app",
  messagingSenderId: "597216845163",
  appId: "1:597216845163:web:03bd2b1db0f09aac46802e",
  measurementId: "G-MDPT6YS8LK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
const analytics = getAnalytics(app);