import { Router } from 'express'
import { load } from 'cheerio'

const router = Router()

router.get('/', async (req, res) => {
  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    // Add protocol if missing
    const targetUrl = url.startsWith('http') ? url : `https://${url}`
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch URL' })
    }

    const html = await response.text()
    const $ = load(html)

    const title = $('title').first().text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  ''
    
    const description = $('meta[name="description"]').attr('content') || 
                        $('meta[property="og:description"]').attr('content') || 
                        ''

    res.json({ title, description })

  } catch (error) {
    console.error('Metadata fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch metadata' })
  }
})

export default router
