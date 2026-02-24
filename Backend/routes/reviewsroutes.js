const express = require('express')
const router = express.Router()
const { crearReview, getReviewsProfesional } = require("../controllers/reviewscontroller")
const verificarToken = require('../middlewares/auth.middleware')

router.post('/', verificarToken,crearReview )
router.get('/:profesional_id', getReviewsProfesional)

module.exports = router