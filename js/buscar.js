import { actualizarNavbar } from './auth.js'
import { API_URL } from './config.js'

document.addEventListener('DOMContentLoaded', () => {
  actualizarNavbar()

  // Leer parámetros de URL
  const urlParams = new URLSearchParams(window.location.search)
  const oficioParam = urlParams.get('oficio')
  const estadoParam = urlParams.get('estado')

  if (oficioParam) {
    document.getElementById('input-oficio').value = oficioParam
    const textoSpan = document.getElementById('dropdown-texto')
    if (textoSpan) textoSpan.textContent = oficioParam
    // Marcar item como seleccionado si coincide
    document.querySelectorAll('#dropdown-lista .dropdown-item').forEach(item => {
      if (item.dataset.value.toLowerCase() === oficioParam.toLowerCase()) {
        item.classList.add('seleccionado')
      }
    })
  }

  if (estadoParam) {
    document.getElementById('input-estado').value = estadoParam
  }

  cargarProfesionales()
  configurarEventos()
})

function obtenerFiltros() {
  const oficio = document.getElementById('input-oficio').value.trim()
  const estado = document.getElementById('input-estado').value.trim()
  const disponible = document.getElementById('check-disponible').checked
  const verificado = document.getElementById('check-verificados').checked

  const btnCalifActivo = document.querySelector('.boton-filtro.activo[data-calif]')
  const calificacion_min = btnCalifActivo ? btnCalifActivo.dataset.calif : ''

  const btnPrecioActivo = document.querySelector('.boton-filtro.activo[data-precio-max]')
  const precio_max = btnPrecioActivo ? btnPrecioActivo.dataset.precioMax : ''

  return { oficio, estado, disponible, calificacion_min, precio_max, verificado }
}
async function cargarProfesionales() {
  console.log('cargarProfesionales ejecutándose')
  const lista = document.getElementById('lista-tarjetas')
  lista.innerHTML = '<p style="padding:1rem;color:#64748b">Cargando profesionales...</p>'

  const { oficio, estado, disponible, calificacion_min, precio_max, verificado } = obtenerFiltros()

  const params = new URLSearchParams()
  if (oficio) params.append('oficio', oficio)
  if (estado) params.append('estado', estado)
  if (disponible) params.append('disponible', 'true')
  if (verificado) params.append('verificado', 'true')
  if (calificacion_min) params.append('calificacion_min', calificacion_min)
  if (precio_max) params.append('precio_max', precio_max)

  const url = `${API_URL}/profesionales${params.toString() ? '?' + params.toString() : ''}`

  try {
const res = await fetch(url)
const profesionales = await res.json()
console.log('Profesionales:', profesionales)

    document.getElementById('contador').textContent = profesionales.length
    lista.innerHTML = ''

    if (!profesionales.length) {
      lista.innerHTML = '<p style="padding:2rem;color:#64748b;text-align:center">No se encontraron profesionales con esos filtros.</p>'
      return
    }

    profesionales.forEach(pro => lista.appendChild(crearTarjeta(pro)))

  } catch (error) {
    lista.innerHTML = '<p style="padding:1rem;color:red">Error al cargar profesionales.</p>'
  }
}

function crearTarjeta(pro) {
  const nombreEncoded = encodeURIComponent(pro.nombre)
  const foto = pro.foto_url ||
    `https://ui-avatars.com/api/?name=${nombreEncoded}&background=4f46e5&color=fff`

  const disponibilidadTexto = pro.disponible ? 'Disponible hoy' : 'No disponible'
  const disponibilidadClase = pro.disponible ? 'texto-verde' : 'texto-rojo'

  const precio = pro.precio_min && pro.precio_max
    ? `$${pro.precio_min} - $${pro.precio_max}/hr`
    : 'Precio a consultar'

  const serviciosTags = pro.servicios?.length
    ? pro.servicios.slice(0, 3).map(s => `<span>${s.nombre}</span>`).join('')
    : ''

  const a = document.createElement('a')
  a.href = `/pages/profesional.html?id=${pro.id}`
  a.className = 'tarjeta-pro'
  a.innerHTML = `
    <div class="tarjeta-grid">
      <div class="pro-imagen-wrapper">
        <img src="${foto}" alt="${pro.nombre}" class="pro-foto">
        <div class="badge-verificado">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
            <path d="m9 11 3 3L22 4"></path>
          </svg>
        </div>
      </div>
      <div class="pro-info">
        <div class="pro-header">
          <h3 class="pro-nombre">${pro.nombre}</h3>
          <p class="pro-titulo">${pro.oficio}</p>
        </div>
        <div class="pro-meta">
          <div class="ubicacion">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${pro.estado || ''}, ${pro.municipio || ''}
          </div>
        </div>
        <p class="pro-bio">${pro.descripcion || 'Sin descripción.'}</p>
        <div class="pro-tags">${serviciosTags}</div>
      </div>
      <div class="pro-accion">
        <div class="precio">${precio}</div>
        <div class="disponibilidad ${disponibilidadClase}">${disponibilidadTexto}</div>
        <button class="boton-perfil">Ver perfil</button>
      </div>
    </div>
  `
  return a
}

function configurarEventos() {
  
  document.querySelector('.boton-buscar-principal').addEventListener('click', cargarProfesionales)

 
  document.getElementById('input-estado').addEventListener('keydown', e => {
    if (e.key === 'Enter') cargarProfesionales()
  })

  
  document.getElementById('input-estado').addEventListener('change', cargarProfesionales)


  const dropdown = document.getElementById('dropdown-oficio')
  const dropdownLista = document.getElementById('dropdown-lista')
  const dropdownTexto = document.getElementById('dropdown-texto')
  const inputOficio = document.getElementById('input-oficio')

  dropdown.addEventListener('click', (e) => {
    if (e.target.classList.contains('dropdown-item')) return
    dropdown.classList.toggle('abierto')
  })

  dropdownLista.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const valor = item.dataset.value
      inputOficio.value = valor
      dropdownTexto.textContent = valor || '¿Qué servicio necesitas?'
      dropdownLista.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('seleccionado'))
      item.classList.add('seleccionado')
      dropdown.classList.remove('abierto')
      cargarProfesionales()
    })
  })

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('abierto')
    }
  })

  // Filtros de calificación
  document.querySelectorAll('.boton-filtro[data-calif]').forEach(btn => {
    btn.addEventListener('click', () => {
      const estabaActivo = btn.classList.contains('activo')
      document.querySelectorAll('.boton-filtro[data-calif]').forEach(b => b.classList.remove('activo'))
      if (!estabaActivo) btn.classList.add('activo')
      cargarProfesionales()
    })
  })

  // Filtros de precio
  document.querySelectorAll('.boton-filtro[data-precio-max]').forEach(btn => {
    btn.addEventListener('click', () => {
      const estabaActivo = btn.classList.contains('activo')
      document.querySelectorAll('.boton-filtro[data-precio-max]').forEach(b => b.classList.remove('activo'))
      if (!estabaActivo) btn.classList.add('activo')
      cargarProfesionales()
    })
  })

  // Checkbox disponible hoy
  document.getElementById('check-disponible').addEventListener('change', cargarProfesionales)

  // Limpiar filtros
  document.querySelector('.boton-limpiar').addEventListener('click', () => {
    inputOficio.value = ''
    dropdownTexto.textContent = '¿Qué servicio necesitas?'
    dropdownLista.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('seleccionado'))
    document.getElementById('input-estado').value = ''
    document.getElementById('check-disponible').checked = false
    document.getElementById('check-verificados').checked = false
    document.querySelectorAll('.boton-filtro.activo').forEach(b => b.classList.remove('activo'))
    cargarProfesionales()
  })

  //  Menú de filtros móvil 
  const barraLateral = document.querySelector('.barra-lateral')
  const overlay = document.createElement('div')
  overlay.className = 'filtros-overlay'
  document.body.appendChild(overlay)

  function abrirFiltros() {
    barraLateral.classList.add('abierto')
    overlay.classList.add('visible')
    document.body.style.overflow = 'hidden'
  }

  function cerrarFiltrosPanel() {
    barraLateral.classList.remove('abierto')
    overlay.classList.remove('visible')
    document.body.style.overflow = ''
  }

  document.querySelector('.boton-filtros-movil').addEventListener('click', abrirFiltros)
  document.querySelector('.cerrar-filtros').addEventListener('click', cerrarFiltrosPanel)
  overlay.addEventListener('click', cerrarFiltrosPanel)

  // Cerrar automáticamente al aplicar un filtro en móvil
  document.querySelectorAll('.boton-filtro, #check-verificados, #check-disponible').forEach(el => {
    el.addEventListener('click', () => {
      if (window.innerWidth < 768) cerrarFiltrosPanel()
    })
  })
}