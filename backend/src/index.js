import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { sequelize } from './models/index.js'
import uniformRoutes from './routes/uniform.routes.js'
import selectionRoutes from './routes/selection.routes.js'
import moodRoutes from './routes/mood.routes.js'
import statsRoutes from './routes/stats.routes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running' })
})

app.use('/api/uniforms', uniformRoutes)
app.use('/api/selections', selectionRoutes)
app.use('/api/moods', moodRoutes)
app.use('/api/stats', statsRoutes)

app.use(notFound)
app.use(errorHandler)

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected.')
    return sequelize.sync()
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err)
  })
