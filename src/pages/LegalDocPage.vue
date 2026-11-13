<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import BracketNav from '../components/BracketNav.vue'
import { nav } from '../data/nav'

const docs = {
  'api-tos': { title: 'api.ehis.gay terms', file: '/legal/api/tos.txt' },
  'api-privacy': { title: 'api.ehis.gay privacy', file: '/legal/api/privacy.txt' }
}

const route = useRoute()
const doc = computed(() => docs[route.meta.doc] || null)

const state = ref('loading')
const blocks = ref([])

function parse(text) {
  const out = []
  let paragraph = []
  let list = null

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push({ type: 'p', text: paragraph.join(' ') })
      paragraph = []
    }
  }

  const flushList = () => {
    if (list) {
      out.push({ type: 'ul', items: list })
      list = null
    }
  }

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }
    if (line.startsWith('## ') || line.startsWith('# ')) {
      flushParagraph()
      flushList()
      out.push({ type: 'h2', text: line.replace(/^#+\s*/, '') })
      continue
    }
    if (line.startsWith('- ')) {
      flushParagraph()
      if (!list) list = []
      list.push(line.slice(2))
      continue
    }
    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()
  return out
}

async function load() {
  if (!doc.value) return

  state.value = 'loading'
  try {
    const response = await fetch(doc.value.file)
    if (!response.ok) throw new Error(`http ${response.status}`)
    blocks.value = parse(await response.text())
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
}

onMounted(load)
</script>

<template>
  <section class="page">
    <h1>{{ doc ? doc.title : 'legal' }}</h1>
    <BracketNav :items="nav" />

    <div class="panel">
      <p v-if="state === 'loading'" class="status">grabbing it...</p>

      <template v-else-if="state === 'error'">
        <p class="status">couldn't grab it, try again?</p>
        <button type="button" class="retry" @click="load">retry</button>
      </template>

      <template v-else>
        <template v-for="(block, index) in blocks" :key="index">
          <h2 v-if="block.type === 'h2'">{{ block.text }}</h2>
          <p v-else-if="block.type === 'p'">{{ block.text }}</p>
          <ul v-else-if="block.type === 'ul'">
            <li v-for="item in block.items" :key="item">{{ item }}</li>
          </ul>
        </template>
      </template>
    </div>

    <p class="back">
      <RouterLink to="/terms">back to terms</RouterLink>
    </p>
  </section>
</template>

<style scoped>
.status {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.retry {
  padding: 0.25rem 0.7rem;
  border: 1px solid var(--border-hi);
  border-radius: 6px;
  background: var(--bg-alt);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  cursor: pointer;
  transition: border-color 140ms ease, color 140ms ease;
}

.retry:hover,
.retry:focus-visible {
  border-color: var(--pink-mid);
  color: var(--pink);
  outline: none;
}

.back {
  font-size: 0.72rem;
}

.back a {
  color: var(--pink);
}
</style>