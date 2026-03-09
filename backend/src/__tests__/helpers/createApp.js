import express from 'express'
import cors from 'cors'
import uniformRoutes from '../../routes/uniform.routes.js'
import selectionRoutes from '../../routes/selection.routes.js'
import moodRoutes from '../../routes/mood.routes.js'
import statsRoutes from '../../routes/stats.routes.js'
import { errorHandler, notFound } from '../../middleware/errorHandler.js'

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
  app.use('/api/uniforms', uniformRoutes)
  app.use('/api/selections', selectionRoutes)
  app.use('/api/moods', moodRoutes)
  app.use('/api/stats', statsRoutes)
  app.use(notFound)
  app.use(errorHandler)

  return app
}
