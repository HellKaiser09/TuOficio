const express = require('express')
const router = express.Router()
const verificarToken = require('../middlewares/auth.middleware')

const {
  getProfesional,
  actualizarPerfil,
  listarProfesionales,
  subirFoto,
  upload
} = require('../controllers/profesionales.controller')

router.get('/', listarProfesionales)
router.get('/:id', getProfesional)
router.put('/:id', verificarToken, actualizarPerfil)
router.post('/:id/foto', verificarToken, upload.single('foto'), subirFoto)

module.exports = router