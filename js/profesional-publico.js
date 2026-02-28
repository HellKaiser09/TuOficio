import { estaLogueado, actualizarNavbar } from './auth.js'
import { API_URL } from './config.js'
const params = new URLSearchParams(window.location.search)
const profesionalId = params.get('id')
let calificacionSeleccionada = 0

document.addEventListener('DOMContentLoaded', async () => {
  if (!profesionalId) {
    window.location.href = '/pages/buscar.html'
    return
  }

  actualizarNavbar()
  await cargarPerfil()
  await cargarReviews()
  configurarReviews()
})

async function cargarPerfil() {
  try {
    const res = await fetch(`${API_URL}/profesionales/${profesionalId}`)
    const data = await res.json()

    
    const nombreEncoded = encodeURIComponent(data.nombre)
    document.getElementById('pub-foto').src = data.foto_url ||
      `https://ui-avatars.com/api/?name=${nombreEncoded}&background=4f46e5&color=fff`

    
    document.getElementById('pub-nombre').textContent = data.nombre
    document.getElementById('pub-nombre-corto').textContent = data.nombre.split(' ')[0]
    document.getElementById('pub-oficio').textContent = data.oficio
    document.getElementById('pub-ubicacion').textContent = `${data.estado || ''}, ${data.municipio || ''}`
    document.getElementById('pub-descripcion').textContent = data.descripcion || 'Sin descripción.'
    document.getElementById('pub-horario-texto').textContent = data.horario || '--'

    
    document.getElementById('pub-calificacion').textContent = data.calificacion_promedio || '--'
    document.getElementById('pub-total-reviews').textContent =
      data.total_reviews ? `(${data.total_reviews} reseñas)` : ''

    
    if (data.precio_min && data.precio_max) {
      document.getElementById('pub-precio').innerHTML =
        `<strong>$${data.precio_min} - $${data.precio_max}/hr</strong>`
    }

    
    const dispEl = document.getElementById('pub-disponible')
    dispEl.textContent = data.disponible ? 'Disponible hoy' : 'No disponible'
    dispEl.className = `pub-disponible ${data.disponible ? 'disponible-si' : 'disponible-no'}`

    
    const serviciosEl = document.getElementById('pub-servicios')
    serviciosEl.innerHTML = ''
    data.servicios?.forEach(s => {
      const tag = document.createElement('span')
      tag.className = 'pub-tag'
      tag.textContent = s.nombre
      serviciosEl.appendChild(tag)
    })

    
    const certsEl = document.getElementById('pub-certificaciones')
    certsEl.innerHTML = ''
    if (data.certificaciones?.length) {
      data.certificaciones.forEach(c => {
        const item = document.createElement('div')
        item.className = 'cert-item'
        item.innerHTML = `<span class="cert-check">✓</span> ${c.nombre}`
        certsEl.appendChild(item)
      })
    } else {
      document.getElementById('card-certificaciones').style.display = 'none'
    }

    
    document.title = `${data.nombre} | Tu Oficio`

  } catch (error) {
    console.error('Error cargando perfil:', error)
  }
}

async function cargarReviews() {
  try {
    const res = await fetch(`${API_URL}/reviews/${profesionalId}`)
    const reviews = await res.json()

    const lista = document.getElementById('reviews-lista')

    if (!reviews.length) {
      lista.innerHTML = '<p class="sin-reviews">Aún no hay reseñas.</p>'
      return
    }

    lista.innerHTML = ''
    reviews.forEach(r => {
      const estrellas = '★'.repeat(r.calificacion) + '☆'.repeat(5 - r.calificacion)
      const fecha = new Date(r.created_at).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
      const div = document.createElement('div')
      div.className = 'review-item'
      div.innerHTML = `
        <div class="review-header">
          <span class="review-nombre">${r.usuarios?.nombre || 'Cliente'}</span>
          <span class="review-estrellas">${estrellas}</span>
        </div>
        <p class="review-comentario">${r.comentario || ''}</p>
        <span class="review-fecha">${fecha}</span>
      `
      lista.appendChild(div)
    })

  } catch (error) {
    console.error('Error cargando reviews:', error)
  }
}

function configurarReviews() {
  
  const tipo = localStorage.getItem('tipo')
  if (estaLogueado() && tipo === 'usuario') {
    document.getElementById('form-review').style.display = 'block'
  }

  
  const estrellasBtns = document.querySelectorAll('.estrella-btn')
  estrellasBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      calificacionSeleccionada = parseInt(btn.dataset.valor)
      estrellasBtns.forEach((b, i) => {
        b.classList.toggle('activa', i < calificacionSeleccionada)
      })
    })
  })

 
  document.getElementById('btn-enviar-review').addEventListener('click', async () => {
    if (!calificacionSeleccionada) {
      alert('Selecciona una calificación')
      return
    }

    const comentario = document.getElementById('comentario-review').value.trim()
    const token = localStorage.getItem('token')
    const usuarioId = localStorage.getItem('id')

    const btn = document.getElementById('btn-enviar-review')
    btn.textContent = 'Publicando...'
    btn.disabled = true

    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profesional_id: profesionalId,
          usuario_id: usuarioId,
          calificacion: calificacionSeleccionada,
          comentario
        })
      })

      if (res.ok) {
        document.getElementById('comentario-review').value = ''
        calificacionSeleccionada = 0
        estrellasBtns.forEach(b => b.classList.remove('activa'))
        await cargarReviews()
        await cargarPerfil()
      } else {
        alert('Error al publicar la reseña')
      }
    } catch (error) {
      alert('Error de conexión')
    } finally {
      btn.textContent = 'Publicar reseña'
      btn.disabled = false
    }
  })
}