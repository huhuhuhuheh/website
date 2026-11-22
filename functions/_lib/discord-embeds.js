const DISCORDBOT_UA = /discordbot/i
const HTML_ACCEPT = /text\/html|application\/xhtml\+xml|\*\/\*/i
const MAX_PAYLOAD_BYTES = 3000
const ASSET_PREFIXES = ['/src/', '/assets/', '/favicon', '/legal/']
const FILE_EXTENSION = /\.[a-z0-9]+$/i

export function isDiscordEmbedRequest(request) {
  const method = request.method.toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') return false

  const ua = request.headers.get('user-agent') || ''
  if (!DISCORDBOT_UA.test(ua)) return false

  const accept = request.headers.get('accept') || ''
  if (accept && !HTML_ACCEPT.test(accept)) return false

  let pathname
  try {
    pathname = new URL(request.url).pathname
  } catch {
    return false
  }
  if (FILE_EXTENSION.test(pathname)) return false
  if (ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return false

  return true
}

export function normalizePath(pathname) {
  if (!pathname) return '/'
  let path = pathname.toLowerCase()
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  return path || '/'
}

export function resolveEmbed(registry, pathname) {
  if (!registry) return null
  const path = normalizePath(pathname)
  return registry[path] || null
}

export function buildPayload(entry) {
  const component = { type: 17, components: entry.components }
  if (entry.accentColor != null) component.accent_color = entry.accentColor
  return { component }
}

export function serializePayload(payload) {
  return JSON.stringify(payload)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function byteLength(value) {
  return new TextEncoder().encode(value).length
}

export function escapeHtml(value = '') {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char]
  )
}

function absolute(origin, url) {
  if (!url) return ''
  try {
    return new URL(url, origin).href
  } catch {
    return ''
  }
}

export function buildEmbedPage({ origin, pathname, search = '', entry }) {
  const pageUrl = `${origin}${pathname}${search}`
  const og = entry.og || {}
  const title = og.title || entry.title || 'eh'
  const description = og.description || ''
  const image = absolute(origin, og.image)

  const payload = serializePayload(buildPayload(entry))
  const tooBig = byteLength(payload) > MAX_PAYLOAD_BYTES

  const head = [
    '<meta charset="utf-8">',
    `<link rel="icon" type="image/png" href="${escapeHtml(`${origin}/src/img/icon.png`)}">`,
    `<title>${escapeHtml(title)}</title>`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    description ? `<meta property="og:description" content="${escapeHtml(description)}">` : '',
    image ? `<meta property="og:image" content="${escapeHtml(image)}">` : '',
    `<meta property="og:url" content="${escapeHtml(pageUrl)}">`,
    '<meta property="og:type" content="website">',
    '<meta name="twitter:card" content="summary_large_image">',
    tooBig ? '' : `<script id="discord:component-embed" type="application/json">${payload}</script>`
  ]
    .filter(Boolean)
    .join('\n')

  return `<!doctype html>
<html lang="en">
<head>
${head}
</head>
<body></body>
</html>`
}

export function discordEmbedResponse(request, registry, errorRegistry) {
  if (!isDiscordEmbedRequest(request)) return null

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const key = code && /^\d{3}$/.test(code) ? code : null
  const entry =
    (key && errorRegistry && (errorRegistry[key] || errorRegistry.default)) ||
    resolveEmbed(registry, url.pathname) ||
    (errorRegistry && errorRegistry['404']) ||
    resolveEmbed(registry, '*')
  if (!entry) return null

  const html = buildEmbedPage({
    origin: url.origin,
    pathname: url.pathname,
    search: url.search,
    entry
  })

  return new Response(request.method.toUpperCase() === 'HEAD' ? null : html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300'
    }
  })
}