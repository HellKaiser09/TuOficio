import { guardarSesion } from './auth.js'
import { API_URL } from './config.js'

// ── Validaciones ──────────────────────────────────────
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function mostrarErrorCampo(inputId, mensaje) {
  const input = document.getElementById(inputId)
  input.classList.add('campo-error')
  let span = input.closest('.input-group').querySelector('.msg-error-campo')
  if (!span) {
    span = document.createElement('span')
    span.className = 'msg-error-campo'
    input.closest('.input-group').appendChild(span)
  }
  span.textContent = mensaje
}

function limpiarErrorCampo(inputId) {
  const input = document.getElementById(inputId)
  input.classList.remove('campo-error')
  const span = input.closest('.input-group')?.querySelector('.msg-error-campo')
  if (span) span.remove()
}

function validarLogin(email, password) {
  let valido = true

  limpiarErrorCampo('email')
  limpiarErrorCampo('password')

  if (!REGEX_EMAIL.test(email)) {
    mostrarErrorCampo('email', 'Ingresa un correo válido. Ej: usuario@dominio.com')
    valido = false
  }

  if (password.length < 6) {
    mostrarErrorCampo('password', 'La contraseña debe tener al menos 8 caracteres')
    valido = false
  }

  return valido
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form')
  const btnSubmit = document.querySelector('.btn-submit')

  // ─── Ver/ocultar contraseña ─────────────────────────
  const toggleBtn = document.querySelector('.toggle-password')
  const passwordInput = document.getElementById('password')

  toggleBtn.addEventListener('click', () => {
    const esPassword = passwordInput.type === 'password'
    passwordInput.type = esPassword ? 'text' : 'password'
    toggleBtn.innerHTML = esPassword
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>`
  })

  // Validar email en tiempo real al salir del campo
  document.getElementById('email').addEventListener('blur', () => {
    const val = document.getElementById('email').value.trim()
    if (val && !REGEX_EMAIL.test(val)) {
      mostrarErrorCampo('email', 'Correo inválido. Ej: usuario@dominio.com')
    } else {
      limpiarErrorCampo('email')
    }
  })

  // ─── Olvidé mi contraseña ───────────────────────────
  const forgotLink = document.querySelector('.forgot-link')
  forgotLink.addEventListener('click', async (e) => {
    e.preventDefault()

  const email = document.getElementById('email').value.trim()
    if (!email) {
      mostrarError('Escribe tu correo primero para recuperar tu contraseña')
      return
    }
    if (!REGEX_EMAIL.test(email)) {
      mostrarErrorCampo('email', 'Ingresa un correo válido antes de recuperar la contraseña')
      return
    }

    forgotLink.textContent = 'Enviando...'

    try {
      const response = await fetch(`${API_URL}/auth/recuperar-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      mostrarMensaje('Revisa tu correo para recuperar tu contraseña', 'success')
    } catch (error) {
      mostrarError('Error al enviar el correo, intenta de nuevo')
    } finally {
      forgotLink.textContent = '¿Olvidaste tu contraseña?'
    }
  })

  // ─── Submit Login ───────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    limpiarMensajes()
    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value

    if (!validarLogin(email, password)) return

    btnSubmit.textContent = 'Cargando...'
    btnSubmit.disabled = true

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        mostrarError(data.error || 'Credenciales incorrectas')
        return
      }

      guardarSesion(data.token, data.tipo, data.id)

    if (data.tipo === 'profesional') {
    window.location.href = '/pages/mi-perfil-profesional.html'
    } else {
    window.location.href = '/pages/mi-perfil-cliente.html'
    }   
    } catch (error) {
      mostrarError('Error de conexión, intenta de nuevo')
    } finally {
      btnSubmit.textContent = 'Iniciar Sesión'
      btnSubmit.disabled = false
    }
  })
})

function mostrarMensaje(mensaje, tipo) {
  limpiarMensajes()
  const el = document.createElement('p')
  el.className = 'error-msg'
  el.style.cssText = `
    font-size: 14px; 
    margin-top: 8px; 
    text-align: center;
    color: ${tipo === 'success' ? 'green' : 'red'};
  `
  el.textContent = mensaje
  document.querySelector('.login-form').appendChild(el)
}

function mostrarError(mensaje) {
  mostrarMensaje(mensaje, 'error')
}

function limpiarMensajes() {
  const prev = document.querySelector('.error-msg')
  if (prev) prev.remove()
}