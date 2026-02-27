import { Router } from 'express'
import db from '../db.js'

const router = Router()

// GET /api/tags
router.get('/', (_req, res) => {
  const tags = db.prepare(`
    SELECT t.*, COUNT(bt.bookmark_id) AS bookmark_count
    FROM tags t
    LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
    GROUP BY t.id
    ORDER BY t.name
  `).all()
  res.json(tags)
})

// POST /api/tags
router.post('/', (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Tag name is required' })
  }
  try {
    const stmt = db.prepare('INSERT INTO tags (name) VALUES (?)')
    const result = stmt.run(name.trim())
    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(tag)
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Tag already exists' })
    }
    throw err
  }
})

// PUT /api/tags/:id
router.put('/:id', (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Tag name is required' })
  }
  const stmt = db.prepare('UPDATE tags SET name = ? WHERE id = ?')
  const result = stmt.run(name.trim(), req.params.id)
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Tag not found' })
  }
  const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(req.params.id)
  res.json(tag)
})

// DELETE /api/tags/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM tags WHERE id = ?').run(req.params.id)
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Tag not found' })
  }
  res.json({ message: 'Tag deleted' })
})

export default router

