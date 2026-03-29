import { load } from 'cheerio'

const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
}

function normalizeUrl(url) {
  if (!url) return null
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
}

function resolveUrl(candidate, baseUrl) {
  if (!candidate) return null

  try {
    return new URL(candidate, baseUrl).toString()
  } catch {
    return null
  }
}

function extractIconUrl($, targetUrl) {
  const selectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
    'link[rel*="icon"]',
  ]

  for (const selector of selectors) {
    const href = $(selector).first().attr('href')
    const resolved = resolveUrl(href, targetUrl)
    if (resolved) return resolved
  }

  try {
    const parsed = new URL(targetUrl)
    return new URL('/favicon.ico', parsed.origin).toString()
  } catch {
    return null
  }
}

export async function fetchSiteMetadata(url, timeoutMs = 8000) {
  const targetUrl = normalizeUrl(url)
  if (!targetUrl) {
    throw new Error('URL is required')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: REQUEST_HEADERS,
    })

    if (!response.ok) {
      const error = new Error('Failed to fetch URL')
      error.status = response.status
      throw error
    }

    const html = await response.text()
    const $ = load(html)

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').first().text().trim() ||
      ''

    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      ''

    return {
      targetUrl,
      title,
      description,
      icon_url: extractIconUrl($, response.url || targetUrl),
    }
  } finally {
    clearTimeout(timer)
  }
}
