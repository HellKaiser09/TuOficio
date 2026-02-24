import { estaLogueado, cerrarSesion, actualizarNavbar } from './auth.js'

const API_URL = 'http://localhost:3000/api'
const id = localStorage.getItem('id')
const token = localStorage.getItem('token')

let servicios = []
let certificaciones = []

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
    document.getElementById('ubicacion-texto').textContent = `${data.ciudad || ''}, ${data.colonia || ''}`
    document.getElementById('descripcion').value = data.descripcion || ''
    document.getElementById('ciudad').value = data.ciudad || ''
    document.getElementById('colonia').value = data.colonia || ''
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

  // Agregar servicio
  document.getElementById('btn-agregar-servicio').addEventListener('click', () => {
    const input = document.getElementById('nuevo-servicio')
    const valor = input.value.trim()
    if (!valor) return
    servicios.push(valor)
    renderTags('servicios-lista', servicios, 'servicio')
    input.value = ''
  })

  // Agregar certificación
  document.getElementById('btn-agregar-cert').addEventListener('click', () => {
    const input = document.getElementById('nueva-certificacion')
    const valor = input.value.trim()
    if (!valor) return
    certificaciones.push(valor)
    renderTags('certificaciones-lista', certificaciones, 'certificacion')
    input.value = ''
  })

  // Preview foto
  document.getElementById('foto-input').addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      document.getElementById('foto-preview').src = ev.target.result
    }
    reader.readAsDataURL(file)
  })

  
  document.getElementById('btn-guardar').addEventListener('click', guardarCambios)
}

async function guardarCambios() {
  const btn = document.getElementById('btn-guardar')
  btn.textContent = 'Guardando...'
  btn.disabled = true

  try {
    const body = {
      descripcion: document.getElementById('descripcion').value,
      ciudad: document.getElementById('ciudad').value,
      colonia: document.getElementById('colonia').value,
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
      `${body.ciudad}, ${body.colonia}`

  } catch (error) {
    alert('Error de conexión')
  } finally {
    btn.innerHTML = `Guardar cambios <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 0-2-2V5a2 2 0 0 0 2-2h11l5 5v11a2 2 0 0 0-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`
    btn.disabled = false
  }
}