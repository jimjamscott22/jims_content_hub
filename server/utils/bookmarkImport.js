import { load } from 'cheerio'
import { fetchSiteMetadata } from './siteMetadata.js'

const DEFAULT_CONCURRENCY = 5
const DEFAULT_TIMEOUT_MS = 8000

// Extracts http(s) links from a browser bookmark export (Netscape bookmark HTML).
export function parseBookmarkHtml(html) {
  const $ = load(html)
  const bookmarks = []

  $('a').each((_, element) => {
    const el = $(element)
    const url = el.attr('href')
    const title = el.text().trim() || url

    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      bookmarks.push({ url, title })
    }
  })

  return bookmarks
}

// Fetches site metadata for each parsed bookmark (in batches) and guesses a category by
// matching category names against the title and description. A failed fetch keeps the
// original title. `onProgress({ current, total, url })` fires as each bookmark completes.
export async function enrichBookmarks(
  parsed,
  categories,
  { concurrency = DEFAULT_CONCURRENCY, timeoutMs = DEFAULT_TIMEOUT_MS, onProgress } = {},
) {
  const enriched = new Array(parsed.length)

  const enrichOne = async (item, index) => {
    let title = item.title
    let description = ''
    let icon_url = null
    let category_id = null

    try {
      const metadata = await fetchSiteMetadata(item.url, timeoutMs)
      title = metadata.title || item.title
      description = metadata.description || ''
      icon_url = metadata.icon_url || null
    } catch {
      // timeout or fetch error — keep original title, empty description
    }

    const text = (title + ' ' + description).toLowerCase()
    const match = categories.find((c) => text.includes(c.name.toLowerCase()))
    if (match) category_id = match.id

    enriched[index] = { url: item.url, title, description, icon_url, category_id }
    onProgress?.({ current: index + 1, total: parsed.length, url: item.url })
  }

  for (let i = 0; i < parsed.length; i += concurrency) {
    const batch = parsed.slice(i, i + concurrency)
    await Promise.all(batch.map((item, j) => enrichOne(item, i + j)))
  }

  return enriched
}
