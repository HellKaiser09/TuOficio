const express = require('express')
const router = express.Router()
const verificarToken = require('../middlewares/auth.middleware')

const {
  getProfesional,
  actualizarPerfil,
  listarProfesionales
} = require('../controllers/profesionalescontroller')

router.get('/', listarProfesionales)
router.get('/:id', getProfesional)
router.put('/:id', verificarToken,actualizarPerfil)

module.exports = router