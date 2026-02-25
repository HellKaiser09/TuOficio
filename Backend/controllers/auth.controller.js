const supabase = require('../config/supabase')

// Registro de cliente
const registroUsuario = async (req, res) => {
  const { nombre, email, password, telefono } = req.body

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true  
  })

  if (authError) return res.status(400).json({ error: authError.message })

  const { error: dbError } = await supabase
    .from('usuarios')
    .insert({ id: authData.user.id, nombre, email, telefono })

  if (dbError) return res.status(400).json({ error: dbError.message })

  res.status(201).json({ mensaje: 'Usuario registrado correctamente' })
}

// Registro de profesional
const registroProfesional = async (req, res) => {
  const { nombre, email, password, telefono, oficio, ciudad, colonia } = req.body

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError) return res.status(400).json({ error: authError.message })

  const { error: dbError } = await supabase
    .from('profesionales')
    .insert({ id: authData.user.id, nombre, email, telefono, oficio, ciudad, colonia })

  if (dbError) return res.status(400).json({ error: dbError.message })

  res.status(201).json({ mensaje: 'Profesional registrado correctamente' })
}

// Login (sirve para ambos tipos)
const login = async (req, res) => {
  const { email, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return res.status(401).json({ error: 'Credenciales incorrectas' })

  const esProfesional = await supabase
    .from('profesionales')
    .select('id')
    .eq('id', data.user.id)
    .single()

  res.json({
    token: data.session.access_token,
    tipo: esProfesional.data ? 'profesional' : 'usuario',
    id: data.user.id
  })
}

const recuperarPassword = async (req, res) => {
  const { email } = req.body

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:5500/pages/nueva-password.html'
  })

  res.json({ mensaje: 'Si el correo existe, recibirás un enlace' })
}

module.exports = { registroUsuario, registroProfesional, login, recuperarPassword }
