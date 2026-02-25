import { estaLogueado, actualizarNavbar } from './auth.js'

const API_URL = 'http://localhost:3000/api'
const id = localStorage.getItem('id')
const token = localStorage.getItem('token')

document.addEventListener('DOMContentLoaded', async () => {
  if (!estaLogueado() || localStorage.getItem('tipo') !== 'usuario') {
    window.location.href = '/pages/inicioSesion.html'
    return
  }

  actualizarNavbar()
  await cargarPerfil()
  configurarEventos()
})

async function cargarPerfil() {
  try {
    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()

    document.getElementById('perfil-nombre').textContent = data.nombre
    document.getElementById('perfil-email').textContent = data.email
    document.getElementById('nombre').value = data.nombre || ''
    document.getElementById('telefono').value = data.telefono || ''
    document.getElementById('ciudad').value = data.ciudad || ''
    document.getElementById('colonia').value = data.colonia || ''

    if (data.foto_url) {
      document.getElementById('foto-preview').src = data.foto_url
    } else {
      const nombreEncoded = encodeURIComponent(data.nombre)
      document.getElementById('foto-preview').src =
        `https://ui-avatars.com/api/?name=${nombreEncoded}&background=4f46e5&color=fff`
    }

    const fecha = new Date(data.created_at).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
    document.getElementById('fecha-registro').textContent = fecha

  } catch (error) {
    console.error('Error cargando perfil:', error)
  }
}

function configurarEventos() {
  // Subir foto
  document.getElementById('foto-input').addEventListener('change', async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const extension = file.name.split('.').pop().toLowerCase()

    const reader = new FileReader()
    reader.onload = async (ev) => {
      document.getElementById('foto-preview').src = ev.target.result

      try {
        const res = await fetch(`${API_URL}/usuarios/${id}/foto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            foto_base64: ev.target.result,
            extension
          })
        })

        const data = await res.json()
        if (!res.ok) alert('Error al subir la foto: ' + data.error)

      } catch (error) {
        alert('Error de conexión al subir foto')
      }
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
      nombre: document.getElementById('nombre').value,
      telefono: document.getElementById('telefono').value,
      ciudad: document.getElementById('ciudad').value,
      colonia: document.getElementById('colonia').value
    }

    const res = await fetch(`${API_URL}/usuarios/${id}`, {
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

    document.getElementById('perfil-nombre').textContent = body.nombre

    const mensaje = document.getElementById('mensaje-guardado')
    mensaje.style.display = 'block'
    setTimeout(() => mensaje.style.display = 'none', 3000)

  } catch (error) {
    alert('Error de conexión')
  } finally {
    btn.innerHTML = `Guardar cambios <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 0-2-2V5a2 2 0 0 0 2-2h11l5 5v11a2 2 0 0 0-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`
    btn.disabled = false
  }
}