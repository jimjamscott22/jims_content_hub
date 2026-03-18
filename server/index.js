import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bookmarkRoutes from './routes/bookmarks.js'
import categoryRoutes from './routes/categories.js'
import tagRoutes from './routes/tags.js'
import metadataRoutes from './routes/metadata.js'

const app = express()
const PORT = Number(process.env.API_PORT || process.env.PORT || 3001)
const HOST = process.env.API_HOST || '0.0.0.0'

app.use(cors())
app.use(express.json())

app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/metadata', metadataRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`)
})
