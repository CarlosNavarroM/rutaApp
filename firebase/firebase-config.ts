// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyBqKemwkoDqqKq2sFaPwaKrPqUc7lWYRhA",
  authDomain: "proyectotitulo-7e4da.firebaseapp.com",
  projectId: "proyectotitulo-7e4da",
  storageBucket: "proyectotitulo-7e4da.firebasestorage.app",
  messagingSenderId: "882863701749",
  appId: "1:882863701749:web:8ca047ee954c519d7e0fbc",
  measurementId: "G-WNB2N2X8T9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);