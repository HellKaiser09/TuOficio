const supabase = require('../config/supabase')
const multer = require('multer')

// Config multer en memoria (no guarda en disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imágenes'))
    }
    cb(null, true)
  }
})

const listarProfesionales = async (req, res) => {
  const { oficio, estado, disponible, precio_max, precio_min, calificacion_min, verificado } = req.query

  let query = supabase
    .from('profesionales')
    .select(`*, servicios(*), certificaciones(*)`)

  if (oficio) query = query.ilike('oficio', `%${oficio}%`)
  if (estado) query = query.ilike('estado', `%${estado}%`)
  if (disponible === 'true') query = query.eq('disponible', true)
  if (verificado === 'true') query = query.eq('verificado', true)
  if (precio_max) query = query.lte('precio_min', parseInt(precio_max))
  if (precio_min) query = query.gte('precio_min', parseInt(precio_min))

  const { data, error } = await query
  if (error) return res.status(400).json({ error: error.message })

  // Filtrar por calificación mínima en memoria
  let resultado = data
  if (calificacion_min) {
    const { data: todasReviews } = await supabase
      .from('reviews')
      .select('profesional_id, calificacion')

    const reviews = todasReviews || []

    resultado = data.filter(pro => {
      const proReviews = reviews.filter(r => r.profesional_id === pro.id)
      if (!proReviews.length) return false
      const promedio = proReviews.reduce((acc, r) => acc + r.calificacion, 0) / proReviews.length
      return promedio >= parseFloat(calificacion_min)
    })
  }

  res.json(resultado)
}


// Subir foto a Supabase Storage
const subirFoto = async (req, res) => {
  const { id } = req.params

  if (req.usuario.id !== id) {
    return res.status(403).json({ error: 'No tienes permiso' })
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' })
  }

  const ext = req.file.mimetype.split('/')[1]  // jpg, png, webp...
  const filePath = `${id}/foto.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('fotos-perfil')
    .upload(filePath, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true  // sobreescribe si ya existe
    })

  if (uploadError) return res.status(400).json({ error: uploadError.message })

  const { data } = supabase.storage.from('fotos-perfil').getPublicUrl(filePath)
  const foto_url = data.publicUrl

  // Guardar URL en la base de datos
  await supabase.from('profesionales').update({ foto_url }).eq('id', id)

  res.json({ foto_url })
}

// Traemos el profesional junto con sus servicios y certificaciones
const getProfesional = async (req, res) => {
  const { id } = req.params

  
  const { data: profesional, error } = await supabase
    .from('profesionales')
    .select(`*, servicios(*), certificaciones(*)`)
    .eq('id', id)
    .single()

  if (error) return res.status(404).json({ error: 'Profesional no encontrado' })

  // Calcular promedio de reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('calificacion')
    .eq('profesional_id', id)

  const promedio = reviews?.length
    ? (reviews.reduce((acc, r) => acc + r.calificacion, 0) / reviews.length).toFixed(1)
    : null

  res.json({ ...profesional, calificacion_promedio: promedio, total_reviews: reviews?.length })
}

// Actualizar datos del profesional
const actualizarPerfil = async (req, res) => {
  const { id } = req.params

  if (req.usuario.id !== id) {
    return res.status(403).json({ error: 'No tienes permiso para editar este perfil' })
  }
  const { descripcion, estado, municipio, precio_min, precio_max, horario, disponible, servicios, certificaciones } = req.body

  const updateData = { descripcion, estado, municipio, precio_min, precio_max, horario, disponible }

  const { error } = await supabase
    .from('profesionales')
    .update(updateData)
    .eq('id', id)

  if (error) return res.status(400).json({ error: error.message })

  
  if (servicios) {
    await supabase.from('servicios').delete().eq('profesional_id', id)
    const nuevosServicios = servicios.map(nombre => ({ profesional_id: id, nombre }))
    await supabase.from('servicios').insert(nuevosServicios)
  }

  
  if (certificaciones) {
    await supabase.from('certificaciones').delete().eq('profesional_id', id)
    const nuevasCerts = certificaciones.map(nombre => ({ profesional_id: id, nombre }))
    await supabase.from('certificaciones').insert(nuevasCerts)
  }

  res.json({ mensaje: 'Perfil actualizado correctamente' })
}

module.exports = { listarProfesionales, getProfesional, actualizarPerfil, subirFoto, upload }