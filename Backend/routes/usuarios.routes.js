const express = require('express')
const router = express.Router()
const verificarToken = require('../middlewares/auth.middleware')
const { getUsuario, actualizarUsuario, subirFotoUsuario } = require('../controllers/usuarios.controller')

router.get('/:id', getUsuario)
router.put('/:id', verificarToken, actualizarUsuario)
router.post('/:id/foto', verificarToken, subirFotoUsuario)

module.exports = router