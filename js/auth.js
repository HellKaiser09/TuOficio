const API_URL = 'http://localhost:3000/api'

export function guardarSesion(token, tipo, id) {
  localStorage.setItem('token', token)
  localStorage.setItem('tipo', tipo)
  localStorage.setItem('id', id)
}

export function cerrarSesion() {
  localStorage.removeItem('token')
  localStorage.removeItem('tipo')
  localStorage.removeItem('id')
  window.location.href = '/index.html'
}

export function estaLogueado() {
  return !!localStorage.getItem('token')
}

export function actualizarNavbar() {
  const accionesDesktop = document.querySelector('.acciones-desktop')
  if (!accionesDesktop) return

  if (estaLogueado()) {
    const tipo = localStorage.getItem('tipo')

    accionesDesktop.innerHTML = `
      <a class="btn btn-transp" href="${tipo === 'profesional' ? '/pages/mi-perfil-profesional.html' : '/pages/mi-perfil-cliente.html'}">
        Mi Perfil
      </a>
      <button class="btn btn-outline" id="btn-cerrar-sesion">
        Cerrar sesión
      </button>
    `
    document.getElementById('btn-cerrar-sesion')
      .addEventListener('click', cerrarSesion)

  } else {
    accionesDesktop.innerHTML = `
      <a class="btn btn-transp" href="/pages/inicioSesion.html">
        Iniciar sesión
      </a>
      <a class="btn btn-outline" href="/pages/registro.html">
        Registrarse
      </a>
    `
  }
}

document.addEventListener('DOMContentLoaded', actualizarNavbar)