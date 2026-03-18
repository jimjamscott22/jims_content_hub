import { Router } from 'express'
import db from '../db.js'

const router = Router()

function isDuplicateKeyError(error) {
  return error?.code === 'ER_DUP_ENTRY'
}

// GET /api/tags
router.get('/', async (_req, res) => {
  try {
    const tags = await db.query(`
      SELECT t.*, COUNT(bt.bookmark_id) AS bookmark_count
      FROM tags t
      LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
      GROUP BY t.id
      ORDER BY t.name
    `)
    res.json(tags)
  } catch (error) {
    console.error('Failed to fetch tags', error)
    res.status(500).json({ error: 'Failed to fetch tags' })
  }
})

// POST /api/tags
router.post('/', async (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Tag name is required' })
  }

  try {
    const result = await db.execute('INSERT INTO tags (name) VALUES (?)', [name.trim()])
    const tag = await db.queryOne('SELECT * FROM tags WHERE id = ?', [result.insertId])
    res.status(201).json(tag)
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ error: 'Tag already exists' })
    }
    console.error('Failed to create tag', error)
    res.status(500).json({ error: 'Failed to create tag' })
  }
})

// PUT /api/tags/:id
router.put('/:id', async (req, res) => {
  const { name } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Tag name is required' })
  }

  try {
    const result = await db.execute('UPDATE tags SET name = ? WHERE id = ?', [name.trim(), req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    const tag = await db.queryOne('SELECT * FROM tags WHERE id = ?', [req.params.id])
    res.json(tag)
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ error: 'Tag already exists' })
    }
    console.error('Failed to update tag', error)
    res.status(500).json({ error: 'Failed to update tag' })
  }
})

// DELETE /api/tags/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.execute('DELETE FROM tags WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    res.json({ message: 'Tag deleted' })
  } catch (error) {
    console.error('Failed to delete tag', error)
    res.status(500).json({ error: 'Failed to delete tag' })
  }
})

export default router

