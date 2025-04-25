import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Configuración de Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyBqKemwkoDqqKq2sFaPwaKrPqUc7lWYRhA",
  authDomain: "proyectotitulo-7e4da.firebaseapp.com",
  projectId: "proyectotitulo-7e4da",
  storageBucket: "proyectotitulo-7e4da.firebasestorage.app",
  messagingSenderId: "882863701749",
  appId: "1:882863701749:web:8ca047ee954c519d7e0fbc",
  measurementId: "G-WNB2N2X8T9"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Declarar la variable exportable
export let analytics: any = null;

// Verificar si Analytics es compatible y luego inicializarlo
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
