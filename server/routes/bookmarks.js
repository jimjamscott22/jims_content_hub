import { Router } from 'express'
import multer from 'multer'
import { load } from 'cheerio'
import db from '../db.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

// Helper: attach tags array to bookmark objects
function attachTags(bookmarks) {
  if (!bookmarks.length) return bookmarks
  const ids = bookmarks.map(b => b.id)
  const placeholders = ids.map(() => '?').join(',')
  const tagRows = db.prepare(`
    SELECT bt.bookmark_id, t.id, t.name
    FROM bookmark_tags bt
    JOIN tags t ON t.id = bt.tag_id
    WHERE bt.bookmark_id IN (${placeholders})
    ORDER BY t.name
  `).all(...ids)

  const tagMap = {}
  for (const row of tagRows) {
    if (!tagMap[row.bookmark_id]) tagMap[row.bookmark_id] = []
    tagMap[row.bookmark_id].push({ id: row.id, name: row.name })
  }
  for (const b of bookmarks) {
    b.tags = tagMap[b.id] || []
  }
  return bookmarks
}

// Helper: sync tags for a bookmark
function syncTags(bookmarkId, tagIds) {
  db.prepare('DELETE FROM bookmark_tags WHERE bookmark_id = ?').run(bookmarkId)
  if (tagIds && tagIds.length) {
    const stmt = db.prepare('INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)')
    for (const tagId of tagIds) {
      stmt.run(bookmarkId, tagId)
    }
  }
}

// Helper: build ORDER BY clause from sort param
function buildOrderBy(sort) {
  switch (sort) {
    case 'oldest':  return 'b.is_favorite DESC, b.created_at ASC'
    case 'az':      return 'b.is_favorite DESC, b.title COLLATE NOCASE ASC'
    case 'za':      return 'b.is_favorite DESC, b.title COLLATE NOCASE DESC'
    default:        return 'b.is_favorite DESC, b.created_at DESC'
  }
}

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
  const { search, category_id, is_read, is_favorite, tag_id, sort } = req.query

  let sql = `
    SELECT b.*, c.name AS category_name
    FROM bookmarks b
    LEFT JOIN categories c ON b.category_id = c.id
  `
  const params = []

  if (tag_id) {
    sql += ` INNER JOIN bookmark_tags bt ON bt.bookmark_id = b.id AND bt.tag_id = ?`
    params.push(tag_id)
  }

  sql += ` WHERE 1=1`

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
  if (is_favorite !== undefined) {
    sql += ` AND b.is_favorite = ?`
    params.push(is_favorite)
  }

  sql += ` ORDER BY ${buildOrderBy(sort)}`
  const bookmarks = db.prepare(sql).all(...params)
  attachTags(bookmarks)
  res.json(bookmarks)
})

// GET /api/bookmarks/stats
router.get('/stats', (_req, res) => {
  const stats = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) AS read,
      SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) AS unread
    FROM bookmarks
  `).get()

  res.json({
    total: Number(stats?.total ?? 0),
    read: Number(stats?.read ?? 0),
    unread: Number(stats?.unread ?? 0),
  })
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
  attachTags([bookmark])
  res.json(bookmark)
})

// POST /api/bookmarks
router.post('/', (req, res) => {
  const { url, title, description, category_id, is_read, is_favorite, tag_ids } = req.body
  if (!url || !title) {
    return res.status(400).json({ error: 'URL and title are required' })
  }

  const createBookmark = db.transaction(() => {
    const stmt = db.prepare(`
      INSERT INTO bookmarks (url, title, description, category_id, is_read, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      url, title, description || '', category_id || null,
      is_read ? 1 : 0, is_favorite ? 1 : 0
    )
    const bookmarkId = result.lastInsertRowid
    if (tag_ids && tag_ids.length) {
      syncTags(bookmarkId, tag_ids)
    }
    return bookmarkId
  })

  const bookmarkId = createBookmark()
  const bookmark = db.prepare(`
    SELECT b.*, c.name AS category_name
    FROM bookmarks b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?
  `).get(bookmarkId)
  attachTags([bookmark])
  res.status(201).json(bookmark)
})

// PUT /api/bookmarks/:id
router.put('/:id', (req, res) => {
  const { url, title, description, category_id, is_read, is_favorite, tag_ids } = req.body
  const existing = db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(req.params.id)
  if (!existing) {
    return res.status(404).json({ error: 'Bookmark not found' })
  }

  const updateBookmark = db.transaction(() => {
    const stmt = db.prepare(`
      UPDATE bookmarks
      SET url = ?, title = ?, description = ?, category_id = ?, is_read = ?, is_favorite = ?, updated_at = datetime('now')
      WHERE id = ?
    `)
    stmt.run(
      url ?? existing.url,
      title ?? existing.title,
      description ?? existing.description,
      category_id !== undefined ? (category_id || null) : existing.category_id,
      is_read !== undefined ? (is_read ? 1 : 0) : existing.is_read,
      is_favorite !== undefined ? (is_favorite ? 1 : 0) : existing.is_favorite,
      req.params.id
    )
    if (tag_ids !== undefined) {
      syncTags(req.params.id, tag_ids)
    }
  })

  updateBookmark()
  const bookmark = db.prepare(`
    SELECT b.*, c.name AS category_name
    FROM bookmarks b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?
  `).get(req.params.id)
  attachTags([bookmark])
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
  attachTags([bookmark])
  res.json(bookmark)
})

// PATCH /api/bookmarks/:id/toggle-favorite
router.patch('/:id/toggle-favorite', (req, res) => {
  const existing = db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(req.params.id)
  if (!existing) {
    return res.status(404).json({ error: 'Bookmark not found' })
  }
  const newStatus = existing.is_favorite ? 0 : 1
  db.prepare(`
    UPDATE bookmarks SET is_favorite = ?, updated_at = datetime('now') WHERE id = ?
  `).run(newStatus, req.params.id)
  const bookmark = db.prepare(`
    SELECT b.*, c.name AS category_name
    FROM bookmarks b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?
  `).get(req.params.id)
  attachTags([bookmark])
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
