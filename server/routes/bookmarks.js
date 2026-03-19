import { Router } from 'express'
import multer from 'multer'
import { load } from 'cheerio'
import db from '../db.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

async function attachTags(bookmarks) {
  if (!bookmarks.length) return bookmarks

  const ids = bookmarks.map((bookmark) => bookmark.id)
  const placeholders = ids.map(() => '?').join(',')
  const tagRows = await db.query(
    `
      SELECT bt.bookmark_id, t.id, t.name
      FROM bookmark_tags bt
      JOIN tags t ON t.id = bt.tag_id
      WHERE bt.bookmark_id IN (${placeholders})
      ORDER BY t.name
    `,
    ids,
  )

  const tagMap = new Map()
  for (const row of tagRows) {
    if (!tagMap.has(row.bookmark_id)) {
      tagMap.set(row.bookmark_id, [])
    }
    tagMap.get(row.bookmark_id).push({ id: row.id, name: row.name })
  }

  for (const bookmark of bookmarks) {
    bookmark.tags = tagMap.get(bookmark.id) || []
  }

  return bookmarks
}

async function syncTags(executor, bookmarkId, tagIds) {
  await executor.execute('DELETE FROM bookmark_tags WHERE bookmark_id = ?', [bookmarkId])

  if (!Array.isArray(tagIds) || tagIds.length === 0) return

  for (const tagId of tagIds) {
    await executor.execute(
      'INSERT IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)',
      [bookmarkId, tagId],
    )
  }
}

function buildOrderBy(sort) {
  switch (sort) {
    case 'oldest':
      return 'b.is_favorite DESC, b.created_at ASC'
    case 'az':
      return 'b.is_favorite DESC, LOWER(b.title) ASC'
    case 'za':
      return 'b.is_favorite DESC, LOWER(b.title) DESC'
    default:
      return 'b.is_favorite DESC, b.created_at DESC'
  }
}

function handleServerError(res, error, message) {
  console.error(message, error)
  res.status(500).json({ error: message })
}

// POST /api/bookmarks/import-enriched  (SSE streaming, fetches metadata for each URL)
router.post('/import-enriched', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  try {
    const html = req.file.buffer.toString('utf-8')
    const $ = load(html)
    const parsed = []

    $('a').each((_, element) => {
      const el = $(element)
      const url = el.attr('href')
      const title = el.text().trim() || url
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        parsed.push({ url, title })
      }
    })

    if (parsed.length === 0) {
      send({ type: 'error', message: 'No valid bookmarks found in file' })
      return res.end()
    }

    send({ type: 'start', total: parsed.length })

    const categories = await db.query('SELECT id, name FROM categories')

    const CONCURRENCY = 5
    const TIMEOUT_MS = 8000
    const enriched = new Array(parsed.length)

    const fetchOne = async (item, index) => {
      let title = item.title
      let description = ''
      let category_id = null

      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

        const response = await fetch(item.url, {
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        })
        clearTimeout(timer)

        if (response.ok) {
          const pageHtml = await response.text()
          const $p = load(pageHtml)
          title =
            $p('title').first().text().trim() ||
            $p('meta[property="og:title"]').attr('content') ||
            item.title
          description =
            $p('meta[name="description"]').attr('content') ||
            $p('meta[property="og:description"]').attr('content') ||
            ''
        }
      } catch {
        // timeout or fetch error — keep original title, empty description
      }

      const text = (title + ' ' + description).toLowerCase()
      const match = categories.find((c) => text.includes(c.name.toLowerCase()))
      if (match) category_id = match.id

      enriched[index] = { url: item.url, title, description, category_id }
      send({ type: 'progress', current: index + 1, total: parsed.length, url: item.url })
    }

    for (let i = 0; i < parsed.length; i += CONCURRENCY) {
      const batch = parsed.slice(i, i + CONCURRENCY)
      await Promise.all(batch.map((item, j) => fetchOne(item, i + j)))
    }

    await db.withTransaction(async (tx) => {
      for (const bookmark of enriched) {
        await tx.execute(
          'INSERT INTO bookmarks (url, title, description, category_id, is_read) VALUES (?, ?, ?, ?, 0)',
          [bookmark.url, bookmark.title, bookmark.description, bookmark.category_id],
        )
      }
    })

    send({ type: 'done', count: enriched.length })
  } catch (error) {
    console.error('Enriched import failed:', error)
    send({ type: 'error', message: 'Import failed: ' + error.message })
  } finally {
    res.end()
  }
})

// POST /api/bookmarks/import
router.post('/import', upload.single('file'), async (req, res) => {
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

      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        bookmarksToInsert.push({ url, title })
      }
    })

    if (bookmarksToInsert.length === 0) {
      return res.status(400).json({ error: 'No valid bookmarks found in file' })
    }

    await db.withTransaction(async (tx) => {
      for (const bookmark of bookmarksToInsert) {
        await tx.execute(
          `
            INSERT INTO bookmarks (url, title, description, is_read)
            VALUES (?, ?, 'Imported from browser', 0)
          `,
          [bookmark.url, bookmark.title],
        )
      }
    })

    res.json({ message: `Successfully imported ${bookmarksToInsert.length} bookmarks` })
  } catch (error) {
    handleServerError(res, error, 'Failed to process import file')
  }
})

// GET /api/bookmarks
router.get('/', async (req, res) => {
  const { search, category_id, is_read, is_favorite, tag_id, sort } = req.query

  let sql = `
    SELECT b.*, c.name AS category_name
    FROM bookmarks b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE 1 = 1
  `
  const params = []

  if (search) {
    sql += ' AND (b.title LIKE ? OR b.url LIKE ? OR b.description LIKE ?)'
    const term = `%${search}%`
    params.push(term, term, term)
  }

  if (category_id) {
    sql += ' AND b.category_id = ?'
    params.push(category_id)
  }

  if (is_read !== undefined) {
    sql += ' AND b.is_read = ?'
    params.push(is_read)
  }

  if (is_favorite !== undefined) {
    sql += ' AND b.is_favorite = ?'
    params.push(is_favorite)
  }

  if (tag_id) {
    sql += ' AND EXISTS (SELECT 1 FROM bookmark_tags bt WHERE bt.bookmark_id = b.id AND bt.tag_id = ?)'
    params.push(tag_id)
  }

  sql += ` ORDER BY ${buildOrderBy(sort)}`

  try {
    const bookmarks = await db.query(sql, params)
    await attachTags(bookmarks)
    res.json(bookmarks)
  } catch (error) {
    handleServerError(res, error, 'Failed to fetch bookmarks')
  }
})

// GET /api/bookmarks/stats
router.get('/stats', async (_req, res) => {
  try {
    const stats = await db.queryOne(
      `
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) AS read_count,
          SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) AS unread
        FROM bookmarks
      `,
    )

    res.json({
      total: Number(stats?.total ?? 0),
      read: Number(stats?.read_count ?? 0),
      unread: Number(stats?.unread ?? 0),
    })
  } catch (error) {
    handleServerError(res, error, 'Failed to fetch bookmark stats')
  }
})

// GET /api/bookmarks/:id
router.get('/:id', async (req, res) => {
  try {
    const bookmark = await db.queryOne(
      `
        SELECT b.*, c.name AS category_name
        FROM bookmarks b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.id = ?
      `,
      [req.params.id],
    )

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' })
    }

    await attachTags([bookmark])
    res.json(bookmark)
  } catch (error) {
    handleServerError(res, error, 'Failed to fetch bookmark')
  }
})

// POST /api/bookmarks
router.post('/', async (req, res) => {
  const { url, title, description, category_id, is_read, is_favorite, tag_ids } = req.body

  if (!url || !title) {
    return res.status(400).json({ error: 'URL and title are required' })
  }

  try {
    const bookmarkId = await db.withTransaction(async (tx) => {
      const result = await tx.execute(
        `
          INSERT INTO bookmarks (url, title, description, category_id, is_read, is_favorite)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          url,
          title,
          description || '',
          category_id || null,
          is_read ? 1 : 0,
          is_favorite ? 1 : 0,
        ],
      )

      if (Array.isArray(tag_ids) && tag_ids.length) {
        await syncTags(tx, result.insertId, tag_ids)
      }

      return result.insertId
    })

    const bookmark = await db.queryOne(
      `
        SELECT b.*, c.name AS category_name
        FROM bookmarks b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.id = ?
      `,
      [bookmarkId],
    )

    await attachTags([bookmark])
    res.status(201).json(bookmark)
  } catch (error) {
    handleServerError(res, error, 'Failed to create bookmark')
  }
})

// PUT /api/bookmarks/:id
router.put('/:id', async (req, res) => {
  const { url, title, description, category_id, is_read, is_favorite, tag_ids } = req.body

  try {
    const existing = await db.queryOne('SELECT * FROM bookmarks WHERE id = ?', [req.params.id])
    if (!existing) {
      return res.status(404).json({ error: 'Bookmark not found' })
    }

    await db.withTransaction(async (tx) => {
      await tx.execute(
        `
          UPDATE bookmarks
          SET url = ?, title = ?, description = ?, category_id = ?, is_read = ?, is_favorite = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [
          url ?? existing.url,
          title ?? existing.title,
          description ?? existing.description,
          category_id !== undefined ? (category_id || null) : existing.category_id,
          is_read !== undefined ? (is_read ? 1 : 0) : existing.is_read,
          is_favorite !== undefined ? (is_favorite ? 1 : 0) : existing.is_favorite,
          req.params.id,
        ],
      )

      if (tag_ids !== undefined) {
        await syncTags(tx, req.params.id, tag_ids)
      }
    })

    const bookmark = await db.queryOne(
      `
        SELECT b.*, c.name AS category_name
        FROM bookmarks b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.id = ?
      `,
      [req.params.id],
    )

    await attachTags([bookmark])
    res.json(bookmark)
  } catch (error) {
    handleServerError(res, error, 'Failed to update bookmark')
  }
})

// PATCH /api/bookmarks/:id/toggle-read
router.patch('/:id/toggle-read', async (req, res) => {
  try {
    const existing = await db.queryOne('SELECT * FROM bookmarks WHERE id = ?', [req.params.id])
    if (!existing) {
      return res.status(404).json({ error: 'Bookmark not found' })
    }

    const newStatus = existing.is_read ? 0 : 1
    await db.execute('UPDATE bookmarks SET is_read = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      newStatus,
      req.params.id,
    ])

    const bookmark = await db.queryOne(
      `
        SELECT b.*, c.name AS category_name
        FROM bookmarks b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.id = ?
      `,
      [req.params.id],
    )

    await attachTags([bookmark])
    res.json(bookmark)
  } catch (error) {
    handleServerError(res, error, 'Failed to toggle read status')
  }
})

// PATCH /api/bookmarks/:id/toggle-favorite
router.patch('/:id/toggle-favorite', async (req, res) => {
  try {
    const existing = await db.queryOne('SELECT * FROM bookmarks WHERE id = ?', [req.params.id])
    if (!existing) {
      return res.status(404).json({ error: 'Bookmark not found' })
    }

    const newStatus = existing.is_favorite ? 0 : 1
    await db.execute('UPDATE bookmarks SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      newStatus,
      req.params.id,
    ])

    const bookmark = await db.queryOne(
      `
        SELECT b.*, c.name AS category_name
        FROM bookmarks b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.id = ?
      `,
      [req.params.id],
    )

    await attachTags([bookmark])
    res.json(bookmark)
  } catch (error) {
    handleServerError(res, error, 'Failed to toggle favorite status')
  }
})

// DELETE /api/bookmarks/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await db.execute('DELETE FROM bookmarks WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bookmark not found' })
    }

    res.json({ message: 'Bookmark deleted' })
  } catch (error) {
    handleServerError(res, error, 'Failed to delete bookmark')
  }
})

export default router
