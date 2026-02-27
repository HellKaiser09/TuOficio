import { estaLogueado, cerrarSesion, actualizarNavbar } from './auth.js'

const API_URL = 'http://localhost:3000/api'
const id = localStorage.getItem('id')
const token = localStorage.getItem('token')

let servicios = []
let certificaciones = []
let fotoFile = null  // archivo de foto pendiente de subir
let oficioActual = ''

// ── Sugerencias predefinidas por oficio ────────────────────────────────────────
const SUGERENCIAS = {
  servicios: {
    Plomeria:       ['Reparación de fugas', 'Instalación de tuberías', 'Destapado de drenajes', 'Instalación de calentadores', 'Cambio de llaves y válvulas', 'Detección de fugas', 'Reparación de baños'],
    Electricista:   ['Instalación eléctrica', 'Cambio de cableado', 'Instalación de contactos', 'Tableros eléctricos', 'Iluminación LED', 'Instalación de abanicos', 'Revisión de cortocircuitos'],
    Pintores:       ['Pintura interior', 'Pintura exterior', 'Pintura de fachada', 'Estuco y texturizado', 'Pintura de muebles', 'Impermeabilización', 'Barnizado'],
    Carpinteria:    ['Fabricación de muebles', 'Reparación de puertas', 'Diseño de closets', 'Instalación de pisos', 'Trabajos en madera', 'Cocinas integrales', 'Reparación de ventanas'],
    Jardineria:     ['Poda de árboles', 'Diseño de jardines', 'Mantenimiento de césped', 'Instalación de riego', 'Control de plagas', 'Trasplante de plantas', 'Limpieza de jardín'],
    Limpieza:       ['Limpieza profunda', 'Limpieza de oficinas', 'Lavado de tapicería', 'Limpieza de ventanas', 'Desinfección de espacios', 'Limpieza post-construcción', 'Limpieza de alfombras'],
    'Mecánica':     ['Afinación de motor', 'Cambio de aceite', 'Frenos y suspensión', 'Diagnóstico automotriz', 'Reparación de transmisión', 'Cambio de clutch', 'Revisión general'],
    Clases:         ['Clases de matemáticas', 'Inglés conversacional', 'Clases de música', 'Preparación para exámenes', 'Clases de computación', 'Apoyo escolar', 'Clases de programación'],
    Mantenimiento:  ['Mantenimiento preventivo', 'Reparación general', 'Instalación de equipos', 'Mantenimiento de HVAC', 'Reparación de electrodomésticos', 'Soldadura', 'Trabajos de albañilería'],
  },
  certificaciones: {
    Plomeria:       ['Instalador certificado CONAGUA', 'Plomería residencial certificada', 'Manejo de gas LP', 'Certificación SEMARNAT', 'Técnico en sistemas hidráulicos'],
    Electricista:   ['Certificado CFE', 'Instalador eléctrico NOM-001', 'Técnico en baja tensión', 'Certificación ANCE', 'Instalaciones industriales certificadas'],
    Pintores:       ['Aplicador certificado COMIMSA', 'Manejo seguro de solventes', 'Técnico en recubrimientos industriales', 'Certificado en impermeabilización'],
    Carpinteria:    ['Técnico en carpintería CONALEP', 'Manejo de CNC certificado', 'Diseño de interiores', 'Seguridad en taller certificada'],
    Jardineria:     ['Jardinero paisajista certificado', 'Manejo integrado de plagas', 'Técnico forestal', 'Certificación en sistemas de riego'],
    Limpieza:       ['Técnico en saneamiento', 'Manejo de productos químicos certificado', 'Limpieza industrial certificada', 'HACCP para limpieza'],
    'Mecánica':     ['Mecánico certificado ASE', 'Técnico en sistemas de inyección', 'Diagnóstico computarizado', 'Certificado en sistemas híbridos'],
    Clases:         ['Licenciatura en Educación', 'Certificado TOEFL/IELTS instructor', 'Título universitario', 'Diplomado en pedagogía'],
    Mantenimiento:  ['Técnico en mantenimiento industrial', 'Certificado en seguridad e higiene', 'Operador de maquinaria pesada', 'Soldadura certificada AWS'],
  }
}

function obtenerSugerencias(tipo, query = '') {
  const lista = SUGERENCIAS[tipo][oficioActual] || []
  if (!query) return lista
  return lista.filter(s => s.toLowerCase().includes(query.toLowerCase()))
}

// ── Validación de texto libre ──────────────────────────────────────────────────
function validarTextoTag(valor) {
  if (valor.length < 4)            return 'Demasiado corto (mínimo 4 caracteres)'
  if (valor.length > 80)           return 'Demasiado largo (máximo 80 caracteres)'
  if (/^\d+$/.test(valor))         return 'No puede ser solo números'
  if (/^[^a-záéíóúüñA-Z]+$/i.test(valor)) return 'Debe contener letras'
  if (/(.)\1{3,}/.test(valor))     return 'Texto no válido (caracteres repetidos)'
  return null
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!estaLogueado() || localStorage.getItem('tipo') !== 'profesional') {
    window.location.href = '/pages/inicioSesion.html'
    return
  }

  actualizarNavbar()
  await cargarPerfil()
  configurarEventos()
})

async function cargarPerfil() {
  try {
    const res = await fetch(`${API_URL}/profesionales/${id}`)
    const data = await res.json()

    // Info básica
    document.getElementById('perfil-nombre').textContent = data.nombre
    document.getElementById('perfil-oficio').textContent = data.oficio
    oficioActual = data.oficio || ''
    document.getElementById('ubicacion-texto').textContent = `${data.estado || ''}, ${data.municipio || ''}`
    document.getElementById('descripcion').value = data.descripcion || ''
    document.getElementById('estado').value = data.estado || ''
    document.getElementById('municipio').value = data.municipio || ''
    document.getElementById('precio_min').value = data.precio_min || ''
    document.getElementById('precio_max').value = data.precio_max || ''
    document.getElementById('horario').value = data.horario || ''

    // Disponibilidad
    const disponible = data.disponible
    document.getElementById('disponible').checked = disponible
    document.getElementById('disponible-texto').textContent = disponible ? 'Disponible hoy' : 'No disponible'
    document.getElementById('badge-disponible').textContent = disponible ? 'Disponible' : 'No disponible'
    document.getElementById('badge-disponible').className = `perfil-badge ${disponible ? 'badge-verde' : 'badge-rojo'}`

    // Foto
    if (data.foto_url) {
    document.getElementById('foto-preview').src = data.foto_url
    } else {
    const nombreEncoded = encodeURIComponent(data.nombre)
    document.getElementById('foto-preview').src = 
        `https://ui-avatars.com/api/?name=${nombreEncoded}&background=4f46e5&color=fff`
    }

    // Servicios y certificaciones
    servicios = data.servicios?.map(s => s.nombre) || []
    certificaciones = data.certificaciones?.map(c => c.nombre) || []
    renderTags('servicios-lista', servicios, 'servicio')
    renderTags('certificaciones-lista', certificaciones, 'certificacion')

    // Calificación
    document.getElementById('calificacion-valor').textContent = data.calificacion_promedio || '--'
    document.getElementById('calificacion-total').textContent = data.total_reviews ? `(${data.total_reviews} reseñas)` : ''

    // Link perfil público
    document.getElementById('link-ver-perfil').href = `/pages/profesional.html?id=${id}`

  } catch (error) {
    console.error('Error cargando perfil:', error)
  }
}

function renderTags(contenedorId, lista, tipo) {
  const contenedor = document.getElementById(contenedorId)
  contenedor.innerHTML = ''
  lista.forEach((item, index) => {
    const tag = document.createElement('span')
    tag.className = 'tag-item'
    tag.innerHTML = `
      ${item}
      <button class="tag-eliminar" data-index="${index}" data-tipo="${tipo}">×</button>
    `
    contenedor.appendChild(tag)
  })

  // Eventos para eliminar tags
  contenedor.querySelectorAll('.tag-eliminar').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index)
      if (tipo === 'servicio') servicios.splice(idx, 1)
      else certificaciones.splice(idx, 1)
      renderTags(contenedorId, tipo === 'servicio' ? servicios : certificaciones, tipo)
    })
  })
}

function configurarEventos() {
  // Toggle disponibilidad
  document.getElementById('disponible').addEventListener('change', (e) => {
    const activo = e.target.checked
    document.getElementById('disponible-texto').textContent = activo ? 'Disponible hoy' : 'No disponible'
    document.getElementById('badge-disponible').textContent = activo ? 'Disponible' : 'No disponible'
    document.getElementById('badge-disponible').className = `perfil-badge ${activo ? 'badge-verde' : 'badge-rojo'}`
  })

  // ── Agregar servicio ────────────────────────────────────────────────────────
  configurarInputTag({
    inputId: 'nuevo-servicio',
    btnId: 'btn-agregar-servicio',
    sugerenciasId: 'sugerencias-servicio',
    tipo: 'servicios',
    lista: servicios,
    listaId: 'servicios-lista',
    tipoTag: 'servicio'
  })

  // ── Agregar certificación ───────────────────────────────────────────────────
  configurarInputTag({
    inputId: 'nueva-certificacion',
    btnId: 'btn-agregar-cert',
    sugerenciasId: 'sugerencias-cert',
    tipo: 'certificaciones',
    lista: certificaciones,
    listaId: 'certificaciones-lista',
    tipoTag: 'certificacion'
  })

  // Preview foto + guardar referencia al archivo
  document.getElementById('foto-input').addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return
    fotoFile = file  // guardar para subir al guardar
    const reader = new FileReader()
    reader.onload = (ev) => {
      document.getElementById('foto-preview').src = ev.target.result
    }
    reader.readAsDataURL(file)
  })

  document.getElementById('btn-guardar').addEventListener('click', guardarCambios)
}

// ── Lógica reutilizable para inputs de tags con sugerencias ────────────────────
function configurarInputTag({ inputId, btnId, sugerenciasId, tipo, lista, listaId, tipoTag }) {
  const input = document.getElementById(inputId)
  const btn = document.getElementById(btnId)
  const panelSugerencias = document.getElementById(sugerenciasId)

  function mostrarSugerencias(query = '') {
    const sugs = obtenerSugerencias(tipo, query).filter(s => !lista.includes(s))
    if (!sugs.length) { panelSugerencias.classList.remove('abierto'); return }

    panelSugerencias.innerHTML = sugs.map(s =>
      `<button type="button" class="sug-chip" data-valor="${s}">${s}</button>`
    ).join('')
    panelSugerencias.classList.add('abierto')

    panelSugerencias.querySelectorAll('.sug-chip').forEach(chip => {
      chip.addEventListener('mousedown', (e) => {
        e.preventDefault()
        agregarTag(chip.dataset.valor)
        input.value = ''
        panelSugerencias.classList.remove('abierto')
        input.focus()
      })
    })
  }

  function agregarTag(valor) {
    const v = valor.trim()
    if (!v) return
    // Validar solo si es escritura manual (no sugerencia)
    const esSugerencia = SUGERENCIAS[tipo][oficioActual]?.includes(v) ?? false
    if (!esSugerencia) {
      const error = validarTextoTag(v)
      if (error) { mostrarErrorInput(input, error); return }
    }
    if (lista.includes(v)) { mostrarErrorInput(input, 'Ya está en la lista'); return }
    lista.push(v)
    renderTags(listaId, lista, tipoTag)
    limpiarErrorInput(input)
  }

  input.addEventListener('focus', () => mostrarSugerencias(input.value))
  input.addEventListener('input', () => mostrarSugerencias(input.value))
  input.addEventListener('blur', () => setTimeout(() => panelSugerencias.classList.remove('abierto'), 150))
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); agregarTag(input.value); input.value = ''; panelSugerencias.classList.remove('abierto') }
    if (e.key === 'Escape') panelSugerencias.classList.remove('abierto')
  })

  btn.addEventListener('click', () => {
    agregarTag(input.value)
    input.value = ''
    panelSugerencias.classList.remove('abierto')
  })
}

function mostrarErrorInput(input, mensaje) {
  limpiarErrorInput(input)
  input.classList.add('input-error')
  const err = document.createElement('span')
  err.className = 'tag-error-msg'
  err.textContent = mensaje
  input.parentElement.appendChild(err)
  setTimeout(() => limpiarErrorInput(input), 3000)
}

function limpiarErrorInput(input) {
  input.classList.remove('input-error')
  input.parentElement.querySelector('.tag-error-msg')?.remove()
}

async function guardarCambios() {
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
  if (precio_min && precio_max && precio_min >= precio_max) {
    mostrarError('El precio mínimo debe ser menor al precio máximo')
    return
  }


  const btn = document.getElementById('btn-guardar')
  btn.textContent = 'Guardando...'
  btn.disabled = true

  try {
    if (fotoFile) {
      btn.textContent = 'Subiendo foto...'
      const formData = new FormData()
      formData.append('foto', fotoFile)

      const fotoRes = await fetch(`${API_URL}/profesionales/${id}/foto`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData  
      })

      const fotoData = await fotoRes.json()
      if (!fotoRes.ok) {
        alert('Error subiendo la foto: ' + (fotoData.error || 'Error desconocido'))
        return
      }

      fotoFile = null  
      btn.textContent = 'Guardando...'
    }

    const body = {
      descripcion: document.getElementById('descripcion').value,
      estado: document.getElementById('estado').value,
      municipio: document.getElementById('municipio').value,
      precio_min: document.getElementById('precio_min').value,
      precio_max: document.getElementById('precio_max').value,
      horario: document.getElementById('horario').value,
      disponible: document.getElementById('disponible').checked,
      servicios,
      certificaciones
    }

    const res = await fetch(`${API_URL}/profesionales/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Error al guardar')
      return
    }

    const mensaje = document.getElementById('mensaje-guardado')
    mensaje.style.display = 'block'
    setTimeout(() => mensaje.style.display = 'none', 3000)

    
    document.getElementById('ubicacion-texto').textContent =
      `${body.estado}, ${body.municipio}`

  } catch (error) {
    console.error('Error al guardar:', error)
    alert('Error: ' + error.message)
  } finally {
    btn.innerHTML = `Guardar cambios <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 0-2-2V5a2 2 0 0 0 2-2h11l5 5v11a2 2 0 0 0-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`
    btn.disabled = false
  }
}

function mostrarError(mensaje) {
  const btn = document.getElementById('btn-guardar')
  btn.innerHTML = `Guardar cambios <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 0-2-2V5a2 2 0 0 0 2-2h11l5 5v11a2 2 0 0 0-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`
  btn.disabled = false

  const div = document.createElement('div')
  div.textContent = '❌ ' + mensaje
  div.style.cssText = 'position:fixed;bottom:2rem;right:2rem;padding:1rem 1.5rem;background:#fee2e2;color:#dc2626;border-radius:0.75rem;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.1);z-index:9999;'
  document.body.appendChild(div)
  setTimeout(() => div.remove(), 3000)
}