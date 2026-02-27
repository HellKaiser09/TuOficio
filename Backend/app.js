const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.options('/{*path}', cors(corsOptions)) // preflight para todas las rutas
app.use(express.json())

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

// Rutas
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/profesionales', require('./routes/profesionales.routes'))
app.use('/api/reviews', require('./routes/reviews.routes'))
app.use('/api/usuarios', require('./routes/usuarios.routes'))

app.get('/', (req, res) => res.json({ mensaje: 'API TuOficio funcionando' }))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))

