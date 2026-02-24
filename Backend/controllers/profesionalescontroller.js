const supabase = require('../config/supabase')

const listarProfesionales = async (req, res) => {
  const { oficio, ciudad } = req.query

  let query = supabase.from('profesionales').select('*')

  if (oficio) query = query.ilike('oficio', `%${oficio}%`)
  if (ciudad) query = query.ilike('ciudad', `%${ciudad}%`)

  const { data, error } = await query

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
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
  const { descripcion, precio_min, precio_max, disponible, foto_url, servicios, certificaciones } = req.body

  
  const { error } = await supabase
    .from('profesionales')
    .update({ descripcion, precio_min, precio_max, disponible, foto_url })
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

module.exports = { listarProfesionales, getProfesional, actualizarPerfil }