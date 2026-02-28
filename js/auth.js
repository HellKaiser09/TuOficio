import { API_URL } from './config.js'

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

function buildAccionesHTML() {
  if (estaLogueado()) {
    const tipo = localStorage.getItem('tipo')
    const href = tipo === 'profesional'
      ? '/pages/mi-perfil-profesional.html'
      : '/pages/mi-perfil-cliente.html'
    return `
      <a class="btn btn-transp" href="${href}">Mi Perfil</a>
      <button class="btn btn-outline btn-cerrar-sesion">Cerrar sesión</button>
    `
  }
  return `
    <a class="btn btn-transp" href="/pages/inicioSesion.html">Iniciar sesión</a>
    <a class="btn btn-outline" href="/pages/formsProfesional.html">Registrarse</a>
  `
}

export function actualizarNavbar() {
  const accionesDesktop = document.querySelector('.acciones-desktop')
  if (!accionesDesktop) return

  accionesDesktop.innerHTML = buildAccionesHTML()

  
  const accionesMobile = document.getElementById('mobile-acciones')
  if (accionesMobile) accionesMobile.innerHTML = buildAccionesHTML()

  
  document.querySelectorAll('.btn-cerrar-sesion').forEach(btn => {
    btn.addEventListener('click', cerrarSesion)
  })
}

function configurarMenuMovil() {
  const btn = document.querySelector('.mobile-menu-btn')
  if (!btn) return

  // Crear panel
  const panel = document.createElement('div')
  panel.className = 'mobile-nav-panel'
  panel.id = 'mobile-nav-panel'

 
  const navDesktop = document.querySelector('.nav-desktop')
  if (navDesktop) {
    navDesktop.querySelectorAll('a.nav-link').forEach(link => {
      panel.appendChild(link.cloneNode(true))
    })
  }

 
  const sep = document.createElement('div')
  sep.className = 'mobile-nav-divider'
  panel.appendChild(sep)

  
  const accionesMobile = document.createElement('div')
  accionesMobile.id = 'mobile-acciones'
  accionesMobile.className = 'mobile-acciones'
  accionesMobile.innerHTML = buildAccionesHTML()
  panel.appendChild(accionesMobile)

  document.body.appendChild(panel)

  
  panel.querySelectorAll('.btn-cerrar-sesion').forEach(b => {
    b.addEventListener('click', cerrarSesion)
  })

  // Toggle al hacer click en el botón hamburguesa
  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    const abierto = panel.classList.toggle('abierto')
    btn.setAttribute('aria-expanded', abierto)
  })

  // Cerrar al hacer click en un enlace o botón dentro del panel
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) {
      panel.classList.remove('abierto')
      btn.setAttribute('aria-expanded', 'false')
    }
  })

  // Cerrar al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !btn.contains(e.target)) {
      panel.classList.remove('abierto')
      btn.setAttribute('aria-expanded', 'false')
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  actualizarNavbar()
  configurarMenuMovil()
})