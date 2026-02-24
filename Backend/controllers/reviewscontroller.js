const supabase = require('../config/supabase')

const crearReview = async (req, res) => {
  const { profesional_id, usuario_id, calificacion, comentario } = req.body

  if (calificacion < 1 || calificacion > 5)
    return res.status(400).json({ error: 'La calificación debe ser entre 1 y 5' })

  const { error } = await supabase
    .from('reviews')
    .insert({ profesional_id, usuario_id, calificacion, comentario })

  if (error) return res.status(400).json({ error: error.message })

  res.status(201).json({ mensaje: 'Review creada correctamente' })
}

const getReviewsProfesional = async (req, res) => {
  const { profesional_id } = req.params

  const { data, error } = await supabase
    .from('reviews')
    .select(`*, usuarios(nombre)`)
    .eq('profesional_id', profesional_id)
    .order('created_at', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

module.exports = { crearReview, getReviewsProfesional }