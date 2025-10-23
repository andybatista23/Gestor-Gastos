// ========================
// menu.js + app.js unificado
// ========================

// Import Firebase
import { db, auth } from "../database/firebase.js";
import { 
  collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

let currentUser = null;
let gastos = [];
let categorias = [];

// ========================
// Inicialización
// ========================
document.addEventListener('DOMContentLoaded', inicializarApp);

async function inicializarApp() {
  // Menu toggle móvil
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.querySelector('nav');
  menuToggle?.addEventListener('click', () => nav.classList.toggle('active'));

  // Navegación entre secciones
  document.querySelectorAll('nav li').forEach(li => {
    li.addEventListener('click', () => {
      const seccion = li.getAttribute('data-seccion');
      mostrarSeccion(seccion);
      if (window.innerWidth < 768) nav.classList.remove('active');
    });
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
      nav.classList.remove('active');
    }
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', cerrarSesion);

  // Formularios
  document.getElementById('gastoForm')?.addEventListener('submit', guardarGasto);
  document.getElementById('agregarCategoriaBtn')?.addEventListener('click', agregarCategoria);
  document.getElementById('agregarMonedasBtn')?.addEventListener('click', agregarMonedas);

  document.getElementById('fecha').valueAsDate = new Date();

  // Estado de autenticación
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      document.getElementById('userEmail').textContent = user.email;
      await cargarCategorias();
      await cargarGastos();
      await actualizarEstadisticas();
    } else {
      window.location.href = "login.html";
    }
  });
}

// ========================
// Mostrar secciones
// ========================
function mostrarSeccion(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  if (id === 'inicio') actualizarEstadisticas();
  if (id === 'gastos') cargarGastos();
  if (id === 'reportes') generarReportes();
}
window.mostrarSeccion = mostrarSeccion; // global

// ========================
// Gastos
// ========================
async function obtenerGastos() {
  if (!currentUser) return [];
  try {
    // Consulta solo por UID
    const q = query(
      collection(db, "gastos"),
      where("uid", "==", currentUser.uid)
    );
    const snapshot = await getDocs(q);
    gastos = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      fecha: d.data().fecha?.toDate() || new Date()
    }));
    // Ordenar localmente por fecha descendente
    gastos.sort((a, b) => b.fecha - a.fecha);
    return gastos;
  } catch (e) {
    console.error("Error obteniendo gastos:", e);
    return [];
  }
}

// Guardar gasto
async function guardarGasto(e) {
  e.preventDefault();
  const descripcion = document.getElementById('descripcion').value.trim();
  const monto = parseFloat(document.getElementById('monto').value);
  const tipo = document.getElementById('tipo').value;
  const categoria = document.getElementById('categoria').value;
  const fecha = document.getElementById('fecha').value;

  if (!descripcion || !monto || !tipo || !categoria || !fecha) {
    mostrarMensaje('Completa todos los campos', 'error');
    return;
  }

  try {
    await addDoc(collection(db, "gastos"), {
      uid: currentUser.uid,
      descripcion,
      monto,
      tipo,
      categoria,
      fecha: new Date(fecha),
      fechaCreacion: new Date()
    });
    mostrarMensaje('Movimiento guardado', 'exito');
    document.getElementById('gastoForm').reset();
    document.getElementById('fecha').valueAsDate = new Date();
    await cargarGastos();
    await actualizarEstadisticas();
  } catch (e) {
    mostrarMensaje('Error al guardar', 'error');
    console.error(e);
  }
}

// Eliminar gasto
async function eliminarGasto(id) {
  if (!confirm('¿Eliminar este movimiento?')) return;
  try {
    await deleteDoc(doc(db, "gastos", id));
    mostrarMensaje('Movimiento eliminado', 'exito');
    await cargarGastos();
    await actualizarEstadisticas();
  } catch (e) {
    mostrarMensaje('Error al eliminar', 'error');
    console.error(e);
  }
}

// ========================
// Categorías
// ========================
async function cargarCategorias() {
  if (!currentUser) return;
  try {
    const q = query(collection(db, "categorias"), where("uid", "==", currentUser.uid));
    const snapshot = await getDocs(q);
    categorias = snapshot.docs.map(d => d.data().nombre);
    const select = document.getElementById('categoria');
    select.innerHTML = '<option value="">Selecciona Categoría</option>';
    categorias.forEach(c => {
      const option = document.createElement('option');
      option.value = c;
      option.textContent = c;
      select.appendChild(option);
    });
  } catch (e) {
    console.error("Error cargando categorías:", e);
  }
}

async function agregarCategoria() {
  const nombre = document.getElementById('nuevaCategoria').value.trim();
  if (!nombre) return;
  try {
    await addDoc(collection(db, "categorias"), { uid: currentUser.uid, nombre });
    mostrarMensaje('Categoría agregada', 'exito');
    document.getElementById('nuevaCategoria').value = '';
    await cargarCategorias();
  } catch (e) {
    mostrarMensaje('Error al agregar categoría', 'error');
    console.error(e);
  }
}

// ========================
// Monedas
// ========================
async function agregarMonedas() {
  const valor = parseFloat(document.getElementById('nuevasMonedas').value);
  if (!valor || valor <= 0) return mostrarMensaje('Ingresa un valor válido', 'error');
  mostrarMensaje(`${valor.toFixed(2)} monedas agregadas`, 'exito');
  document.getElementById('nuevasMonedas').value = '';
}

// ========================
// Estadísticas
// ========================
async function actualizarEstadisticas() {
  gastos = await obtenerGastos();
  const totalGastos = gastos.filter(g => g.tipo==='gasto').reduce((s,g)=>s+g.monto,0);
  const totalIngresos = gastos.filter(g=>g.tipo==='ingreso').reduce((s,g)=>s+g.monto,0);
  const balance = totalIngresos - totalGastos;

  const container = document.getElementById('statsContainer');
  container.innerHTML = `
    <div class="stat-card"><div>Total Gastos</div><div>$${totalGastos.toFixed(2)}</div></div>
    <div class="stat-card"><div>Total Ingresos</div><div>$${totalIngresos.toFixed(2)}</div></div>
    <div class="stat-card"><div>Balance</div><div>${balance>=0?'+':'-'}$${Math.abs(balance).toFixed(2)}</div></div>
    <div class="stat-card"><div>Total Movimientos</div><div>${gastos.length}</div></div>
  `;
}

// Reportes placeholder
async function generarReportes() {
  await actualizarEstadisticas();
}

// ========================
// Utilidades
// ========================
function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString();
}

function mostrarMensaje(msg, tipo) {
  const mensaje = document.getElementById('mensaje');
  mensaje.textContent = msg;
  mensaje.className = `mensaje ${tipo}`;
  setTimeout(() => { mensaje.textContent=''; mensaje.className='mensaje'; }, 4000);
}

// ========================
// Logout
// ========================
async function cerrarSesion() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (e) {
    mostrarMensaje('Error al cerrar sesión', 'error');
    console.error(e);
  }
}
