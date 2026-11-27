<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import '@github/markdown-toolbar-element'
import hljs from 'highlight.js/lib/core'
import markdown from 'highlight.js/lib/languages/markdown'
import xml from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/github-dark.css'
import BracketNav from '../components/BracketNav.vue'
import { nav } from '../data/nav'
import { renderMarkdown, resolveCenters, toCurseforgeVariant, toHtmlVariant } from '../lib/MarkdownRender'

const DEFAULT_SOURCE = `# stoopid markdown zoo

**bold**, *italic*, ~~strike~~, \`inline code\`, [a link](https://ehis.gay), <https://ehis.gay>

## lists
- cat
- dog with a [link](https://ehis.gay)
- [ ] be cat
- [x] being silly

1. first
2. second
3. third

## quote
> cats are liquid
> and so is my motivation

## table
| thing | vibes |
| --- | --- |
| cats | 10/10 |
| bunny | 0/10 |

---

## code
\`\`\`js
const meow = "mrrp"
console.log(meow)
\`\`\`

## centred stuff

[[center]]
<a href="https://modrinth.com/project/bsrPC26E" target="_blank"><img alt="modrinth" height="40" src="https://cdn.jsdelivr.net/npm/@intergrav/devins-badges@3/assets/cozy-minimal/available/modrinth_64h.png"></a>
<a href="https://github.com/huhuhuhuheh/daily-menu-panoramas" target="_blank"><img alt="github" height="40" src="https://cdn.jsdelivr.net/npm/@intergrav/devins-badges@3/assets/cozy-minimal/available/github_64h.png"></a>

![Trans Rights!!!!!!!!!!!](https://pride-badges.pony.workers.dev/static/v1?label=trans%20rights&stripeWidth=6&stripeColors=5BCEFA,F5A9B8,FFFFFF,F5A9B8,5BCEFA)
[[/center]]

> back to normal markdown
`

const targets = [
  { id: 'gfm', label: 'GitHub / Modrinth' },
  { id: 'html', label: 'Modrinth HTML' },
  { id: 'rawhtml', label: 'Just HTML' },
  { id: 'curseforge', label: 'CurseForge' }
]

const source = ref(localStorage.getItem('markdown-editor-source') ?? DEFAULT_SOURCE)
const pad = ref(Number(localStorage.getItem('markdown-editor-pad') ?? 38))
const target = ref(localStorage.getItem('markdown-editor-target') || 'gfm')
const copied = ref(false)
const fullscreen = ref(false)
const editorArea = ref(null)
const centerActive = ref(false)

hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('xml', xml)

const preview = computed(() => renderMarkdown(source.value))
const baseExport = computed(() => {
  if (target.value === 'html') return toHtmlVariant(source.value)
  if (target.value === 'rawhtml') return renderMarkdown(source.value)
  if (target.value === 'curseforge') return toCurseforgeVariant(source.value, pad.value)
  return resolveCenters(source.value)
})
const exportText = computed(() => baseExport.value)
const highlightedExport = computed(() =>
  hljs.highlight(exportText.value, {
    language: target.value === 'html' || target.value === 'rawhtml' ? 'xml' : 'markdown'
  }).value
)

watch(source, (value) => localStorage.setItem('markdown-editor-source', value))
watch(pad, (value) => localStorage.setItem('markdown-editor-pad', String(value)))
watch(target, (value) => localStorage.setItem('markdown-editor-target', value))

function syncCenterActive() {
  const area = editorArea.value
  if (!area) return
  const before = source.value.slice(0, area.selectionStart)
  centerActive.value = before.lastIndexOf('[[center]]') > before.lastIndexOf('[[/center]]')
}

async function applySelection(text, start, end) {
  source.value = text
  await nextTick()
  const area = editorArea.value
  area?.focus()
  area?.setSelectionRange(start, end)
  syncCenterActive()
}

function toggleSelectionCenter() {
  const area = editorArea.value
  if (!area) return

  const text = source.value
  const start = area.selectionStart
  const end = area.selectionEnd
  const before = text.slice(0, start)
  const openAt = before.lastIndexOf('[[center]]')
  const closeAt = before.lastIndexOf('[[/center]]')

  if (openAt > closeAt) {
    const closeEnd = text.indexOf('[[/center]]', openAt)
    if (closeEnd !== -1) {
      const inner = text.slice(openAt + '[[center]]'.length, closeEnd).replace(/^\n|\n$/g, '')
      const next = text.slice(0, openAt) + inner + text.slice(closeEnd + '[[/center]]'.length)
      applySelection(next, openAt, openAt + inner.length)
      return
    }
  }

  if (start === end) {
    const lineStart = text.lastIndexOf('\n', start - 1) + 1
    const nextBreak = text.indexOf('\n', end)
    const lineEnd = nextBreak === -1 ? text.length : nextBreak
    const line = text.slice(lineStart, lineEnd)
    const next = `${text.slice(0, lineStart)}[[center]]\n${line}\n[[/center]]${text.slice(lineEnd)}`
    applySelection(next, lineStart + '[[center]]\n'.length, lineStart + '[[center]]\n'.length + line.length)
    return
  }

  const selected = text.slice(start, end)
  const next = `${text.slice(0, start)}[[center]]\n${selected}\n[[/center]]${text.slice(end)}`
  applySelection(next, start + '[[center]]\n'.length, start + '[[center]]\n'.length + selected.length)
}

function toggleFullscreen() {
  fullscreen.value = !fullscreen.value
}

function handleKeydown(event) {
  if (event.key === 'Escape' && fullscreen.value) fullscreen.value = false
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))

async function copyExport() {
  const text = exportText.value
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    area.remove()
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 1400)
}
</script>

<template>
  <section class="page" :class="{ 'is-fullscreen': fullscreen }">
    <h1>Editor</h1>
    <BracketNav :items="nav" />

    <p>Edit your stuff in and copy it out!</p>

    <div class="editor-grid">
      <div class="panel">
        <div class="panel-head">
          <h2>editor</h2>
          <button type="button" class="fullscreen-button" :title="fullscreen ? 'Exit fullscreen' : 'Fullscreen'" @click="toggleFullscreen">
            <svg v-if="!fullscreen" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6V3h3M13 3v3h-3M13 10v3h-3M3 10v3h3" /></svg>
            <svg v-else viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l4 4M7 3H3v4M13 3l-4 4M9 3h4v4M3 13l4-4M7 13H3V9M13 13l-4-4M9 13h4V9" /></svg>
          </button>
        </div>
        <markdown-toolbar for="markdown-editor-area" class="toolbar">
          <md-bold title="Bold">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M4 2.5h4.2a2.6 2.6 0 0 1 0 5.2H4V2.5Z" /><path d="M4 7.7h4.8a2.9 2.9 0 0 1 0 5.8H4V7.7Z" /></svg>
          </md-bold>
          <md-italic title="Italic">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M6 2h6v1.5h-2.2L7.4 12.5H10V14H4v-1.5l2.4-9H4V2Z" /></svg>
          </md-italic>
          <md-strikethrough title="Strikethrough">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M2.5 8h11" /><path d="M4.8 4.8c.6-1.2 1.8-1.9 3.3-1.9 1.8 0 2.9.9 2.9 2.2 0 1-.6 1.7-2 2.3" /><path d="M10.5 11.2c-.6 1.3-1.9 2-3.5 2-2 0-3.1-.9-3.1-2.3 0-1 .6-1.7 1.8-2.2" /></svg>
          </md-strikethrough>
          <md-code title="Code">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 4-4 4 4 4" /><path d="m10 4 4 4-4 4" /></svg>
          </md-code>
          <md-link title="Link">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="m6.5 9.5 3-3" /><path d="M7.8 4.4 9 3.2a2.8 2.8 0 0 1 4 4l-1.2 1.2" /><path d="M8.2 11.6 7 12.8a2.8 2.8 0 0 1-4-4l1.2-1.2" /></svg>
          </md-link>
          <md-image title="Image">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><rect x="2" y="3" width="12" height="10" rx="1.5" /><circle cx="5.5" cy="6.5" r="1.2" /><path d="m3 11 3-3 3 3 2-2 2 2" /></svg>
          </md-image>
          <md-header title="Heading">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 3v10M10 3v10M3 8h7" /></svg>
          </md-header>
          <md-quote title="Quote">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 4h5v4H5.5c0 1.4.7 2.2 2 2.5V12c-2.4-.4-4-1.9-4-4V4Zm7 0h5v4h-2.5c0 1.4.7 2.2 2 2.5V12c-2.4-.4-4-1.9-4-4V4Z" /></svg>
          </md-quote>
          <md-unordered-list title="List">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="3" cy="4" r="1" /><circle cx="3" cy="8" r="1" /><circle cx="3" cy="12" r="1" /><path d="M6 4h7M6 8h7M6 12h7" /></svg>
          </md-unordered-list>
          <md-ordered-list title="Numbered list">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M6 4h7M6 8h7M6 12h7" /><text x="1.5" y="5.5" font-size="5" fill="currentColor" stroke="none">1</text><text x="1.5" y="9.5" font-size="5" fill="currentColor" stroke="none">2</text><text x="1.5" y="13.5" font-size="5" fill="currentColor" stroke="none">3</text></svg>
          </md-ordered-list>
          <md-task-list title="Task list">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="3" height="3" rx=".5" /><rect x="2" y="9" width="3" height="3" rx=".5" /><path d="m2.3 4.5.8.8 1.3-1.5" /><path d="M7 4.5h6M7 10.5h6" /></svg>
          </md-task-list>
          <md-mention title="Mention">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="7.5" cy="8" r="5" /><circle cx="7.5" cy="8" r="2" /><path d="M9.5 8v1.5a1.5 1.5 0 0 0 3 0V8" /></svg>
          </md-mention>
          <md-ref title="Reference">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><rect x="2.5" y="3" width="11" height="10" rx="1.5" /><path d="M5 6h6M5 9h6M5 11h3" /></svg>
          </md-ref>
          <button type="button" data-md-button title="Center selection" class="center-button" :class="{ active: centerActive }" @click="toggleSelectionCenter">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2 3h12M2 13h12" /><path d="M5 6h6M4 9h8" /></svg>
          </button>
        </markdown-toolbar>
        <textarea id="markdown-editor-area" ref="editorArea" v-model="source" class="code-box" spellcheck="false" aria-label="Markdown editor" @select="syncCenterActive" @keyup="syncCenterActive" @click="syncCenterActive" />
      </div>

      <div class="panel">
        <h2>preview</h2>
        <div class="preview" v-html="preview" />
      </div>
    </div>

    <div class="panel">
      <h2>export</h2>
      <div class="badges targets">
        <button
          v-for="item in targets"
          :key="item.id"
          type="button"
          class="target"
          :class="{ active: target === item.id }"
          @click="target = item.id"
        >{{ item.label }}</button>
      </div>

      <label v-if="target === 'curseforge'" class="pad-row">
        nbsp pad
        <input v-model.number="pad" type="number" min="0" max="200" />
      </label>

      <div class="export-wrap">
        <pre class="code-box export-box" v-html="highlightedExport" />
        <button type="button" class="copy-icon" aria-label="Copy export" @click="copyExport">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <span class="copied" :class="{ show: copied }">copied!!</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.editor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.75rem;
}

.editor-grid > .panel {
  min-width: 0;
}

.page.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 100;
  width: 100vw;
  max-width: none;
  height: 100vh;
  margin: 0;
  padding: 1rem;
  background: var(--bg);
  overflow: hidden;
  gap: 0;
}

.page.is-fullscreen > :not(.editor-grid) {
  display: none;
}

.page.is-fullscreen .editor-grid {
  height: 100%;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
}

.page.is-fullscreen .code-box,
.page.is-fullscreen .preview {
  min-height: 0;
  height: 100%;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fullscreen-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.4rem;
}

.fullscreen-button svg {
  display: block;
  width: 14px;
  height: 14px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.toolbar :is(md-bold, md-italic, md-strikethrough, md-code, md-link, md-image, md-header, md-quote, md-unordered-list, md-ordered-list, md-task-list, md-mention, md-ref, button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.9rem;
  min-height: 1.75rem;
  padding: 0.25rem 0.45rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  line-height: 1;
  cursor: pointer;
  transition: border-color 140ms ease, color 140ms ease;
}

.toolbar :is(md-bold, md-italic, md-strikethrough, md-code, md-link, md-image, md-header, md-quote, md-unordered-list, md-ordered-list, md-task-list, md-mention, md-ref, button):hover {
  color: var(--text);
  border-color: var(--border-hi);
}

.toolbar svg {
  display: block;
  width: 14px;
  height: 14px;
}

.code-box {
  width: 100%;
  min-height: 360px;
  resize: vertical;
  padding: 0.8rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  line-height: 1.6;
  white-space: pre;
  overflow: auto;
}

.code-box:focus {
  outline: none;
  border-color: var(--border-hi);
}

.export-wrap {
  position: relative;
}

.export-box {
  min-height: 200px;
  padding-right: 3rem;
  color: var(--text);
  background: var(--bg);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  overflow-x: hidden;
}

.export-box.hljs {
  color: var(--text);
  background: var(--bg);
}

.preview {
  min-height: 360px;
  padding: 0.8rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  line-height: 1.7;
  color: var(--text-dim);
}

.preview :deep(a) {
  color: var(--blue);
}

.preview :deep(img) {
  max-width: 100%;
  height: auto;
}

.preview :deep(h1),
.preview :deep(h2),
.preview :deep(h3),
.preview :deep(h4),
.preview :deep(h5),
.preview :deep(h6) {
  font-family: var(--font-syne);
  color: var(--text);
  margin: 0.5rem 0;
}

.preview :deep(div p),
.preview :deep(p) {
  margin: 0.35rem 0;
}

.targets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

button {
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  cursor: pointer;
  transition: border-color 140ms ease, color 140ms ease;
}

button:hover {
  color: var(--text);
  border-color: var(--border-hi);
}

button.active {
  color: var(--pink);
  border-color: var(--pink-mid);
}

.pad-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--text-dim);
}

.pad-row input {
  width: 4rem;
  padding: 0.3rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.68rem;
}

.copy-icon {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  display: grid;
  place-items: center;
  padding: 0.3rem;
  color: var(--text-dim);
  border-color: var(--border-hi);
}

.copy-icon:hover {
  color: var(--text);
  border-color: var(--grey);
}

.copied {
  position: absolute;
  right: 2.6rem;
  bottom: 0.6rem;
  opacity: 0;
  pointer-events: none;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--mint);
  transition: opacity 140ms ease;
}

.copied.show {
  opacity: 1;
}
</style>