const express = require('express')
const router = express.Router()
const { registroUsuario, registroProfesional, login, recuperarPassword } = require('../controllers/auth.controller')

router.post('/registro/usuario', registroUsuario)
router.post('/registro/profesional', registroProfesional)
router.post('/login', login)
router.post('/recuperar-password', recuperarPassword)
module.exports = router