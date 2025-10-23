// Importar Firebase desde CDN para navegador
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

// Configuración de tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyCIQBCWlci-4eMuSDxvaTJpq3C9EFZK3zs",
  authDomain: "financierate-36155.firebaseapp.com",
  projectId: "financierate-36155",
  storageBucket: "financierate-36155.appspot.com", // CORREGIDO
  messagingSenderId: "474334436091",
  appId: "1:474334436091:web:801e897b34b684ca66ee5e",
  measurementId: "G-DMXXNKNDQQ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Exportar todo
export { app, db, auth, storage, firebaseConfig };
