const supabase = require('../config/supabase')

const verificarToken = async (req, res, next) => {
  console.log('Middleware ejecutándose')
  const authHeader = req.headers['authorization']
  console.log('Header:', authHeader)
  
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' })

  const token = authHeader.split(' ')[1]

  const { data, error } = await supabase.auth.getUser(token)
  console.log('Usuario del token:', data)
  console.log('Error del token:', error)

  if (error || !data.user) return res.status(401).json({ error: 'Token inválido' })

  req.usuario = data.user
  next()
}

module.exports = verificarToken