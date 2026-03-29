import { Router } from 'express'
import { fetchSiteMetadata } from '../utils/siteMetadata.js'

const router = Router()

router.get('/', async (req, res) => {
  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    const metadata = await fetchSiteMetadata(url)
    res.json({
      title: metadata.title,
      description: metadata.description,
      icon_url: metadata.icon_url,
    })
  } catch (error) {
    console.error('Metadata fetch error:', error)
    res.status(error.status || 500).json({ error: 'Failed to fetch metadata' })
  }
})

export default router
