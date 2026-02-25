const supabase = require('../config/supabase')

const getUsuario = async (req, res) => {
  console.log('Entró a getUsuario')
  const { id } = req.params
  console.log('ID:', id)

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', id)
    .single()

  console.log('Data:', data)
  console.log('Error:', error)

  if (error) return res.status(404).json({ error: 'Usuario no encontrado' })
  res.json(data)
}

const actualizarUsuario = async (req, res) => {
  const { id } = req.params

  if (req.usuario.id !== id)
    return res.status(403).json({ error: 'No autorizado' })

  const { nombre, telefono, ciudad, colonia, foto_url } = req.body

  const { error } = await supabase
    .from('usuarios')
    .update({ nombre, telefono, ciudad, colonia, foto_url })
    .eq('id', id)

  if (error) return res.status(400).json({ error: error.message })
  res.json({ mensaje: 'Perfil actualizado correctamente' })
}

const subirFotoUsuario = async (req, res) => {
  const { id } = req.params

  if (req.usuario.id !== id)
    return res.status(403).json({ error: 'No autorizado' })

  const { foto_base64, extension } = req.body
  if (!foto_base64) return res.status(400).json({ error: 'No se recibió imagen' })

  const base64Data = foto_base64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')
  const fileName = `usuario_${id}.${extension || 'jpg'}`

  const { error } = await supabase.storage
    .from('avatares')
    .upload(fileName, buffer, {
      contentType: `image/${extension || 'jpg'}`,
      upsert: true
    })

  if (error) return res.status(400).json({ error: error.message })

  const { data } = supabase.storage
    .from('avatares')
    .getPublicUrl(fileName)

  await supabase
    .from('usuarios')
    .update({ foto_url: data.publicUrl })
    .eq('id', id)

  res.json({ foto_url: data.publicUrl })
}

module.exports = { getUsuario, actualizarUsuario, subirFotoUsuario }
