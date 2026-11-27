const ALLOWED_TAGS = new Set([
  'DIV', 'P', 'BR', 'A', 'IMG', 'SPAN',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'UL', 'OL', 'LI', 'STRONG', 'EM', 'DEL', 'CODE', 'PRE', 'BLOCKQUOTE', 'HR',
  'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'INPUT'
])

const ALLOWED_ATTRS = {
  A: new Set(['href', 'target', 'rel']),
  IMG: new Set(['src', 'alt', 'height', 'width']),
  DIV: new Set(['align']),
  P: new Set(['align']),
  SPAN: new Set(['align']),
  TH: new Set(['align']),
  TD: new Set(['align']),
  INPUT: new Set(['type', 'checked', 'disabled'])
}

const SAFE_URL = /^(https?:|mailto:|\/|#)/i

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')

  const walk = (node) => {
    for (const child of [...node.children]) {
      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED'].includes(child.tagName)) {
        child.remove()
        continue
      }

      const allowed = ALLOWED_TAGS.has(child.tagName)
      for (const attr of [...child.attributes]) {
        const name = attr.name.toLowerCase()
        if (!allowed || !ALLOWED_ATTRS[child.tagName]?.has(name)) {
          child.removeAttribute(attr.name)
          continue
        }
        if ((name === 'href' || name === 'src') && !SAFE_URL.test(attr.value.trim())) {
          child.removeAttribute(attr.name)
        }
      }

      walk(child)
      if (!allowed) child.replaceWith(...child.childNodes)
    }
  }

  walk(doc.body)
  return doc.body.innerHTML
}

function inline(text) {
  return escapeHtml(text)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/&lt;(https?:\/\/[^&]+)&gt;/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

export function resolveCenters(source) {
  return source.replace(/\[\[center\]\]\n?([\s\S]*?)\n?\[\[\/center\]\]/g, (_, inner) =>
    `<div align="center">\n${inner}\n</div>`
  )
}

export function renderMarkdown(source) {
  const lines = resolveCenters(source).replace(/\r\n/g, '\n').split('\n')
  const out = []
  let listOpen = null
  let fenceLines = null

  const closeList = () => {
    if (listOpen) {
      out.push(`</${listOpen}>`)
      listOpen = null
    }
  }

  const closeFence = () => {
    if (!fenceLines) return
    out.push(`<pre><code>${escapeHtml(fenceLines.join('\n'))}</code></pre>`)
    fenceLines = null
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim()

    if (fenceLines) {
      if (/^```/.test(line)) closeFence()
      else fenceLines.push(lines[i])
      continue
    }

    if (/^```/.test(line)) {
      closeList()
      fenceLines = []
      continue
    }

    if (/^<\/?(div|p|span|a|img|br|hr|h[1-6]|ul|ol|li|blockquote|pre|table|thead|tbody|tr|th|td)\b/i.test(line)) {
      closeList()
      out.push(line)
      continue
    }

    if (!line) {
      closeList()
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      closeList()
      out.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`)
      continue
    }

    if (line.startsWith('|') && /^\|?[\s:|-]+\|?$/.test(lines[i + 1]?.trim() || '')) {
      closeList()
      const cells = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim())
      const head = cells(line)
      const body = []
      i += 1
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
        i += 1
        body.push(cells(lines[i]))
      }
      out.push(`<table><thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`)
      continue
    }

    if (/^>\s?/.test(line)) {
      closeList()
      const quoted = []
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoted.push(inline(lines[i].trim().replace(/^>\s?/, '')))
        i += 1
      }
      i -= 1
      out.push(`<blockquote>${quoted.join('<br>')}</blockquote>`)
      continue
    }

    const unordered = line.match(/^[-*]\s+(.*)$/)
    const ordered = line.match(/^\d+\.\s+(.*)$/)
    if (unordered || ordered) {
      const type = unordered ? 'ul' : 'ol'
      if (listOpen !== type) {
        closeList()
        out.push(`<${type}>`)
        listOpen = type
      }
      const item = (unordered || ordered)[1]
      const task = item.match(/^\[([ xX])\]\s+(.*)$/)
      out.push(task
        ? `<li><input type="checkbox" disabled${task[1].toLowerCase() === 'x' ? ' checked' : ''}> ${inline(task[2])}</li>`
        : `<li>${inline(item)}</li>`)
      continue
    }

    if (/^(---+|\*\*\*+|___+)$/.test(line)) {
      closeList()
      out.push('<hr>')
      continue
    }

    closeList()
    out.push(`<p>${inline(line)}</p>`)
  }

  closeFence()
  closeList()
  return sanitizeHtml(out.join('\n'))
}

const readAttr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))
  return match ? match[1] : ''
}

const escapeAmpersands = (text) =>
  text.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/gi, '&amp;')

export function toHtmlVariant(source) {
  let inDiv = false

  return resolveCenters(source)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((raw) => {
      const line = raw.trim()
      if (/^<div\b/i.test(line)) inDiv = true
      if (/^<\/div>/i.test(line)) inDiv = false
      if (!line) return inDiv ? '<p>\n  \n</p>' : ''

      const linked = line.match(/^\[!\[([^\]]*)\]\(([^)\s]+)\)\]\(([^)\s]+)\)$/)
      if (linked) {
        return escapeAmpersands(`<a href="${linked[3]}"><img alt="${linked[1]}" src="${linked[2]}"></a>`)
      }

      const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/)
      if (image) {
        return escapeAmpersands(`<img alt="${image[1]}" src="${image[2]}">`)
      }

      return escapeAmpersands(line)
    })
    .join('\n')
}

export function toCurseforgeVariant(source, pad = 38) {
  const output = []
  let badges = []
  let rows = 0

  const flush = () => {
    if (!badges.length) return
    const spaces = '\u00a0'.repeat(Math.max(0, (Number(pad) || 0) * rows))
    output.push(`${spaces}${badges.join(' ')}`)
    badges = []
    rows += 1
  }

  for (const raw of resolveCenters(source).replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim()
    let markdown = ''

    const linkedImage = line.match(/^\[!\[([^\]]*)\]\(([^)\s]+)\)\]\(([^)\s]+)\)$/)
    if (linkedImage) {
      markdown = `[![${linkedImage[1]}](${linkedImage[2]})](${linkedImage[3]})`
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/)
    if (!markdown && image) {
      markdown = `![${image[1]}](${image[2]})`
    }

    const htmlLink = line.match(/^<a\b([^>]*)>\s*<img\b([^>]*)>\s*<\/a>$/i)
    if (!markdown && htmlLink) {
      const href = readAttr(htmlLink[1], 'href')
      const src = readAttr(htmlLink[2], 'src')
      const alt = readAttr(htmlLink[2], 'alt')
      markdown = `[![${alt}](${src})](${href})`
    }

    const htmlImage = line.match(/^<img\b([^>]*)>$/i)
    if (!markdown && htmlImage) {
      markdown = `![${readAttr(htmlImage[1], 'alt')}](${readAttr(htmlImage[1], 'src')})`
    }

    if (markdown) {
      badges.push(markdown.replace(/&amp;/g, '&'))
      continue
    }

    flush()
    if (/^<\/?(div|span|p)\b/i.test(line)) continue
    output.push(line.replace(/&amp;/g, '&'))
  }

  flush()
  return output.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
