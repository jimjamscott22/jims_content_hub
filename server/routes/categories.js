import { Router } from 'express'
import db from '../db.js'

const router = Router()

function isDuplicateKeyError(error) {
  return error?.code === 'ER_DUP_ENTRY'
}

// GET /api/categories
router.get('/', async (_req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories ORDER BY name')
    res.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// POST /api/categories
router.post('/', async (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' })
  }

  try {
    const result = await db.execute('INSERT INTO categories (name) VALUES (?)', [name.trim()])
    const category = await db.queryOne('SELECT * FROM categories WHERE id = ?', [result.insertId])
    res.status(201).json(category)
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ error: 'Category already exists' })
    }
    console.error('Failed to create category', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' })
  }

  try {
    const result = await db.execute('UPDATE categories SET name = ? WHERE id = ?', [name.trim(), req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const category = await db.queryOne('SELECT * FROM categories WHERE id = ?', [req.params.id])
    res.json(category)
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ error: 'Category already exists' })
    }
    console.error('Failed to update category', error)
    res.status(500).json({ error: 'Failed to update category' })
  }
})

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.execute('DELETE FROM categories WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }

    res.json({ message: 'Category deleted' })
  } catch (error) {
    console.error('Failed to delete category', error)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

export default router
