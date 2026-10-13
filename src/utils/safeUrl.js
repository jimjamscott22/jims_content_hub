const SAFE_PROTOCOLS = ['http:', 'https:']

// Bookmark URLs are user-supplied, so anything that isn't a web link (javascript:, data:, ...) must not reach an href.
export function safeUrl(url) {
  try {
    return SAFE_PROTOCOLS.includes(new URL(url).protocol) ? url : undefined
  } catch {
    return undefined
  }
}
