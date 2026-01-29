import { Router } from 'express'
import db from '../db.js'

const router = Router()

// GET /api/categories
router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all()
  res.json(categories)
})

// POST /api/categories
router.post('/', (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' })
  }
  try {
    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)')
    const result = stmt.run(name.trim())
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid)
    res.status(201).json(category)
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Category already exists' })
    }
    throw err
  }
})

// PUT /api/categories/:id
router.put('/:id', (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' })
  }
  const stmt = db.prepare('UPDATE categories SET name = ? WHERE id = ?')
  const result = stmt.run(name.trim(), req.params.id)
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Category not found' })
  }
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id)
  res.json(category)
})

// DELETE /api/categories/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id)
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Category not found' })
  }
  res.json({ message: 'Category deleted' })
})

export default router
