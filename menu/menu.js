    // Mostrar u ocultar menú hamburguesa
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');
    
    menuToggle.addEventListener('click', () => {
      menu.classList.toggle('active');
    });

    // Mostrar solo la sección seleccionada
    function mostrarSeccion(id) {
      const secciones = document.querySelectorAll('.section');
      secciones.forEach(sec => sec.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      
      // Ocultar el menú después de seleccionar (solo en móviles)
      if (window.innerWidth < 768) {
        menu.classList.remove('active');
      }
    }

    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
        menu.classList.remove('active');
      }
    });

    // Simular datos para las tarjetas de estadísticas
    function actualizarEstadisticas() {
      // En una aplicación real, aquí se cargarían datos del servidor
      console.log("Actualizando estadísticas...");
    }

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
      actualizarEstadisticas();
    });