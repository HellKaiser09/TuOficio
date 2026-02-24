const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth', require('./routes/authroutes'))
app.use('/api/profesionales', require('./routes/profesionalesroutes'))
app.use('/api/reviews', require('./routes/reviewsroutes'))

app.get('/', (req, res) => res.json({ mensaje: 'API TuOficio funcionando' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))

