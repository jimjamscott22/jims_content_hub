import express from 'express'
import cors from 'cors'
import bookmarkRoutes from './routes/bookmarks.js'
import categoryRoutes from './routes/categories.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/categories', categoryRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
