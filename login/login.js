// login.js
import { auth, db } from "../database/firebase.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Inputs y botón
const usuarioInput = document.getElementById("usuario");
const contraseñaInput = document.getElementById("password");
const btnEntrar = document.querySelector("button");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  const type = contraseñaInput.type === "password" ? "text" : "password";
  contraseñaInput.type = type;

  // Cambiar icono según el estado
  togglePassword.innerHTML = type === "password"
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
         <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5.5 0-10-4-10-8s4.5-8 10-8a10.94 10.94 0 0 1 5.94 2.06"></path>
         <line x1="1" y1="1" x2="23" y2="23"></line>
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
         <path d="M1 12s4.5-8 11-8 11 8 11 8-4.5 8-11 8-11-8-11-8z"></path>
         <circle cx="12" cy="12" r="3"></circle>
       </svg>`;
});


// Función para login
async function Acceder() {
  const nombreUsuario = usuarioInput.value.trim();
  const contraseña = contraseñaInput.value.trim();

  if (!nombreUsuario || !contraseña) {
    alert("Por favor completa todos los campos.");
    return;
  }

  try {
    // Buscar usuario en Firestore
    const q = query(collection(db, "usuarios"), where("usuario", "==", nombreUsuario));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("Usuario no encontrado.");
      return;
    }

    // Obtener email desde Firestore o generar uno ficticio
    let email = querySnapshot.docs[0].data().email;
    if (!email) {
      email = `${nombreUsuario.replace(/\s+/g, '').toLowerCase()}@midominio.com`;
    }

    try {
      // Intentar login en Firebase Auth
      await signInWithEmailAndPassword(auth, email, contraseña);
    } catch (err) {
      // Si usuario no existe en Auth, lo creamos automáticamente
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-login-credentials") {
        await createUserWithEmailAndPassword(auth, email, contraseña);
      } else if (err.code === "auth/wrong-password") {
        alert("Contraseña incorrecta.");
        return;
      } else {
        throw err;
      }
    }

    // Login exitoso
    window.location.href = "./menu/menu.html";


  } catch (error) {
    console.error("Error al iniciar sesión:", error.code, error.message);
    alert("Ocurrió un error al iniciar sesión.");
  }
}

// Asignar función al botón
btnEntrar.addEventListener("click", Acceder);
