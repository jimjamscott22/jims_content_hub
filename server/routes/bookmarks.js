import { Router } from 'express'
import multer from 'multer'
import { load } from 'cheerio'
import db from '../db.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

// POST /api/bookmarks/import
router.post('/import', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  try {
    const html = req.file.buffer.toString('utf-8')
    const $ = load(html)
    const bookmarksToInsert = []

    $('a').each((_, element) => {
      const el = $(element)
      const url = el.attr('href')
      const title = el.text().trim() || url

      // Simple validation
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        bookmarksToInsert.push({ url, title })
      }
    })

    if (bookmarksToInsert.length === 0) {
      return res.status(400).json({ error: 'No valid bookmarks found in file' })
    }

    // Use transaction for bulk insert
    const insert = db.transaction((bookmarks) => {
      const stmt = db.prepare(`
        INSERT INTO bookmarks (url, title, description, is_read)
        VALUES (?, ?, 'Imported from browser', 0)
      `)
      for (const b of bookmarks) {
        stmt.run(b.url, b.title)
      }
    })

    insert(bookmarksToInsert)

    res.json({ message: `Successfully imported ${bookmarksToInsert.length} bookmarks` })

  } catch (error) {
    console.error('Import error:', error)
    res.status(500).json({ error: 'Failed to process import file' })
  }
})

// GET /api/bookmarks (with optional query filters)
router.get('/', (req, res) => {
  const { search, category_id, is_read } = req.query
  let sql = `
    SELECT b.*, c.name AS category_name
    FROM bookmarks b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE 1=1
  `
  const params = []

  if (search) {
    sql += ` AND (b.title LIKE ? OR b.url LIKE ? OR b.description LIKE ?)`
    const term = `%${search}%`
    params.push(term, term, term)
  }
  if (category_id) {
    sql += ` AND b.category_id = ?`
    params.push(category_id)
  }
  if (is_read !== undefined) {
    sql += ` AND b.is_read = ?`
    params.push(is_read)
  }

  sql += ` ORDER BY b.created_at DESC`
  const bookmarks = db.prepare(sql).all(...params)
  res.json(bookmarks)
})

// GET /api/bookmarks/:id
router.get('/:id', (req, res) => {
  const bookmark = db.prepare(`
    SELECT b.*, c.name AS category_name
    FROM bookmarks b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?
  `).get(req.params.id)
  if (!bookmark) {
    return res.status(404).json({ error: 'Bookmark not found' })
  }
  res.json(bookmark)
})

// POST /api/bookmarks
router.post('/', (req, res) => {
  const { url, title, description, category_id, is_read } = req.body
  if (!url || !title) {
    return res.status(400).json({ error: 'URL and title are required' })
  }
  const stmt = db.prepare(`
    INSERT INTO bookmarks (url, title, description, category_id, is_read)
    VALUES (?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    url, title, description || '', category_id || null, is_read ? 1 : 0
  )
  const bookmark = db.prepare(`
    SELECT b.*, c.name AS category_name
    FROM bookmarks b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?
  `).get(result.lastInsertRowid)
  res.status(201).json(bookmark)
})

// PUT /api/bookmarks/:id
router.put('/:id', (req, res) => {
  const { url, title, description, category_id, is_read } = req.body
  const existing = db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(req.params.id)
  if (!existing) {
    return res.status(404).json({ error: 'Bookmark not found' })
  }
  const stmt = db.prepare(`
    UPDATE bookmarks
    SET url = ?, title = ?, description = ?, category_id = ?, is_read = ?, updated_at = datetime('now')
    WHERE id = ?
  `)
  stmt.run(
    url ?? existing.url,
    title ?? existing.title,
    description ?? existing.description,
    category_id !== undefined ? (category_id || null) : existing.category_id,
    is_read !== undefined ? (is_read ? 1 : 0) : existing.is_read,
    req.params.id
  )
  const bookmark = db.prepare(`
    SELECT b.*, c.name AS category_name
    FROM bookmarks b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?
  `).get(req.params.id)
  res.json(bookmark)
})

// PATCH /api/bookmarks/:id/toggle-read
router.patch('/:id/toggle-read', (req, res) => {
  const existing = db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(req.params.id)
  if (!existing) {
    return res.status(404).json({ error: 'Bookmark not found' })
  }
  const newStatus = existing.is_read ? 0 : 1
  db.prepare(`
    UPDATE bookmarks SET is_read = ?, updated_at = datetime('now') WHERE id = ?
  `).run(newStatus, req.params.id)
  const bookmark = db.prepare(`
    SELECT b.*, c.name AS category_name
    FROM bookmarks b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?
  `).get(req.params.id)
  res.json(bookmark)
})

// DELETE /api/bookmarks/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM bookmarks WHERE id = ?').run(req.params.id)
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Bookmark not found' })
  }
  res.json({ message: 'Bookmark deleted' })
})

export default router
