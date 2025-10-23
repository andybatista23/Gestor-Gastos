// registro.js

// Importar Firebase desde CDN
import { db, auth } from "../database/firebase.js"; // ✅ con .js


import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Capturar el formulario y el mensaje
const formulario = document.getElementById("registro-form");
const mensaje = document.getElementById("mensaje");

if (formulario) {
  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById("nombre").value.trim();
    const usuario = document.getElementById("usuario").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validación básica
    if (!nombre || !usuario || !email || !password) {
      mostrarMensaje("Por favor, completa todos los campos.", "error");
      return;
    }

    if (password.length < 6) {
      mostrarMensaje("La contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      mostrarMensaje("Por favor, ingresa un email válido.", "error");
      return;
    }

    try {
      // Mostrar loading
      mostrarMensaje("Registrando usuario...", "cargando");

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar datos adicionales en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        nombre,
        usuario: usuario.toLowerCase(),
        email,
        fechaCreacion: new Date(),
        rol: "usuario",
        ultimoAcceso: new Date()
      });

      // Éxito
      mostrarMensaje("Usuario registrado correctamente ✅", "exito");
      formulario.reset();

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = "index.html"; // o la página que quieras
      }, 2000);

    } catch (error) {
      console.error("Error al registrar usuario:", error);
      
      // Manejo específico de errores de Firebase
      let mensajeError = "Error al registrar usuario";
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          mensajeError = "Este email ya está registrado";
          break;
        case 'auth/invalid-email':
          mensajeError = "El formato del email no es válido";
          break;
        case 'auth/weak-password':
          mensajeError = "La contraseña es demasiado débil";
          break;
        case 'auth/network-request-failed':
          mensajeError = "Error de conexión. Verifica tu internet";
          break;
        default:
          mensajeError = error.message || "Error desconocido";
      }
      
      mostrarMensaje(mensajeError, "error");
    }
  });
}

// Función para mostrar mensajes
function mostrarMensaje(texto, tipo) {
  if (mensaje) {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    
    // Auto-ocultar mensajes de éxito después de 5 segundos
    if (tipo === "exito") {
      setTimeout(() => {
        mensaje.textContent = "";
        mensaje.className = "mensaje";
      }, 5000);
    }
  }
}

// Validación en tiempo real
document.addEventListener('DOMContentLoaded', function() {
  const inputs = formulario?.querySelectorAll('input[required]');
  
  if (inputs) {
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validarCampo(this);
      });
      
      input.addEventListener('input', function() {
        limpiarError(this);
      });
    });
  }
});

function validarCampo(campo) {
  const valor = campo.value.trim();
  
  switch(campo.type) {
    case 'email':
      if (valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
        mostrarErrorCampo(campo, "Email no válido");
      }
      break;
    case 'password':
      if (valor && valor.length < 6) {
        mostrarErrorCampo(campo, "Mínimo 6 caracteres");
      }
      break;
    default:
      if (!valor) {
        mostrarErrorCampo(campo, "Este campo es requerido");
      }
  }
}

function mostrarErrorCampo(campo, mensaje) {
  // Remover error anterior
  limpiarError(campo);
  
  // Agregar clase de error
  campo.classList.add('error');
  
  // Crear elemento de error si no existe
  let errorElement = campo.parentNode.querySelector('.error-text');
  if (!errorElement) {
    errorElement = document.createElement('span');
    errorElement.className = 'error-text';
    campo.parentNode.appendChild(errorElement);
  }
  
  errorElement.textContent = mensaje;
}

function limpiarError(campo) {
  campo.classList.remove('error');
  const errorElement = campo.parentNode.querySelector('.error-text');
  if (errorElement) {
    errorElement.remove();
  }
}