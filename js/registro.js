import { guardarSesion } from './auth.js'
import { API_URL } from './config.js'
let tipoActual = 'cliente'

// ── Validaciones ──────────────────────────────────────
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const REGEX_TELEFONO = /^\d{10}$/

function mostrarErrorCampo(inputId, mensaje) {
  const input = document.getElementById(inputId)
  if (!input) return
  input.classList.add('campo-error')
  let span = input.closest('.input-group')?.querySelector('.msg-error-campo')
  if (!span) {
    span = document.createElement('span')
    span.className = 'msg-error-campo'
    input.closest('.input-group').appendChild(span)
  }
  span.textContent = mensaje
}

function limpiarErrorCampo(inputId) {
  const input = document.getElementById(inputId)
  if (!input) return
  input.classList.remove('campo-error')
  const span = input.closest('.input-group')?.querySelector('.msg-error-campo')
  if (span) span.remove()
}

function validarRegistro(nombre, email, telefono, password) {
  let valido = true
  ;['nombre','email','telefono','password'].forEach(limpiarErrorCampo)

  if (nombre.trim().length < 2) {
    mostrarErrorCampo('nombre', 'Ingresa tu nombre completo')
    valido = false
  }

  if (!REGEX_EMAIL.test(email)) {
    mostrarErrorCampo('email', 'Correo inválido. Ej: usuario@dominio.com')
    valido = false
  }

  const telefonoLimpio = telefono.replace(/[\s\-().]/g, '')
  if (!REGEX_TELEFONO.test(telefonoLimpio)) {
    mostrarErrorCampo('telefono', 'El teléfono debe tener exactamente 10 dígitos')
    valido = false
  }

  if (password.length < 8) {
    mostrarErrorCampo('password', 'La contraseña debe tener al menos 8 caracteres')
    valido = false
  }

  return valido
}

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-btn')
  const camposProfesional = document.getElementById('campos-profesional')
  const form = document.getElementById('registro-form')
  const btnSubmit = document.querySelector('.btn-submit')

  // ─── Tabs ───────────────────────────────────────────
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      tipoActual = tab.dataset.tipo

      // Mostrar u ocultar campos de profesional
      camposProfesional.style.display = tipoActual === 'profesional' ? 'block' : 'none'

      // Campos requeridos dinámicos
      const camposExtra = camposProfesional.querySelectorAll('input, select')
      camposExtra.forEach(campo => {
        campo.required = tipoActual === 'profesional'
      })
    })
  })

  // Validar en tiempo real al salir de cada campo
  ;[['email', () => !REGEX_EMAIL.test(document.getElementById('email').value.trim()) && 'Correo inválido. Ej: usuario@dominio.com'],
    ['telefono', () => { const t = document.getElementById('telefono').value.replace(/[\s\-().]/g,''); return !REGEX_TELEFONO.test(t) && 'El teléfono debe tener 10 dígitos' }],
    ['password', () => document.getElementById('password').value.length < 8 && 'Mínimo 8 caracteres']
  ].forEach(([id, validar]) => {
    document.getElementById(id)?.addEventListener('blur', () => {
      const msg = validar()
      if (document.getElementById(id).value && msg) mostrarErrorCampo(id, msg)
      else limpiarErrorCampo(id)
    })
  })

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

  // ─── Submit ─────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nombre = document.getElementById('nombre').value
    const email = document.getElementById('email').value.trim()
    const telefono = document.getElementById('telefono').value.trim()
    const password = document.getElementById('password').value

    if (!validarRegistro(nombre, email, telefono, password)) {
      btnSubmit.textContent = 'Crear cuenta'
      btnSubmit.disabled = false
      return
    }

    btnSubmit.textContent = 'Creando cuenta...'
    btnSubmit.disabled = true

    try {
      let endpoint, body

      if (tipoActual === 'cliente') {
        endpoint = `${API_URL}/auth/registro/usuario`
        body = { nombre, email, telefono, password }
      } else {
        const oficio = document.getElementById('oficio').value
        const estado = document.getElementById('estado').value
        const municipio = document.getElementById('municipio').value
        const precio_min = parseInt(document.getElementById('precio_min').value)
        const precio_max = parseInt(document.getElementById('precio_max').value)

        if (precio_min && (precio_min < 50 || precio_min > 9999)) {
          mostrarError('El precio mínimo debe estar entre $50 y $9,999')
          return
        }
        if (precio_max && (precio_max < 50 || precio_max > 9999)) {
          mostrarError('El precio máximo debe estar entre $50 y $9,999')
          return
        }
        if (precio_min && precio_max && precio_min > precio_max) {
          mostrarError('El precio mínimo no puede ser mayor al máximo')
          return
        }

        endpoint = `${API_URL}/auth/registro/profesional`
        body = { nombre, email, telefono, password, oficio, estado, municipio, precio_min, precio_max }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        mostrarError(data.error || 'Error al crear la cuenta')
        return
      }

      // Login automático después del registro
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const loginData = await loginRes.json()
      guardarSesion(loginData.token, loginData.tipo, loginData.id)

    if (data.tipo === 'profesional') {
    window.location.href = '/pages/mi-perfil-profesional.html'
    } else {
    window.location.href = '/pages/mi-perfil-cliente.html'
    }

    } catch (error) {
      mostrarError('Error de conexión, intenta de nuevo')
    } finally {
      btnSubmit.textContent = 'Crear cuenta'
      btnSubmit.disabled = false
    }
  })
})

function mostrarError(mensaje) {
  const prev = document.querySelector('.error-msg')
  if (prev) prev.remove()

  const el = document.createElement('p')
  el.className = 'error-msg'
  el.style.cssText = 'color: red; font-size: 14px; margin-top: 8px; text-align: center;'
  el.textContent = mensaje
  document.getElementById('registro-form').appendChild(el)
}