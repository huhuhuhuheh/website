<script setup>
import { reactive, ref } from 'vue'
import BracketNav from '../components/BracketNav.vue'
import { nav } from '../data/nav'
import licenses from '../data/licenses.json'

const zeroBsd = `Copyright (C) 2026 by eh (ehis.gay)

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.`

const assets = [
  'anime, game and other wallpapers, artwork and screenshots under public/src/img/',
  'downloadable archives under public/src/dl/ (cursor packs, Minecraft modpacks, resource packs and related files)',
  'browser extension icons, store badges and listing artwork',
  'Minecraft assets shipped with modpacks or resource packs'
]

const openPkg = ref('')
const fallback = reactive({})

function keyOf(pkg) {
  return `${pkg.name}@${pkg.version}`
}

function localText(pkg) {
  return pkg.text >= 0 ? licenses.texts[pkg.text] || '' : ''
}

function cdnSpec(pkg) {
  return `${pkg.name}@${pkg.version}`
}

async function getJson(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`http ${response.status}`)
  return response.json()
}

async function grabFromCdn(pkg) {
  const spec = cdnSpec(pkg)
  try {
    const listing = await getJson(`https://data.jsdelivr.com/v1/package/npm/${spec}/flat`)
    const file = (listing.files || []).find(
      (entry) => entry.type === 'file' && /^\/[^/]+$/.test(entry.name) && /licen[cs]e|copying/i.test(entry.name)
    )
    if (file) {
      const response = await fetch(`https://cdn.jsdelivr.net/npm/${spec}${file.name}`)
      if (response.ok) return (await response.text()).trim()
    }
  } catch {
  }

  for (const name of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'COPYING']) {
    try {
      const response = await fetch(`https://cdn.jsdelivr.net/npm/${spec}/${name}`)
      if (response.ok) return (await response.text()).trim()
    } catch {
    }
  }

  return ''
}

async function grabFallback(pkg) {
  const key = keyOf(pkg)
  if (fallback[key]) return

  fallback[key] = { state: 'loading' }
  const text = await grabFromCdn(pkg)
  fallback[key] = text ? { state: 'ready', text } : { state: 'empty' }
}

function toggle(pkg) {
  const key = keyOf(pkg)
  if (openPkg.value === key) {
    openPkg.value = ''
    return
  }
  openPkg.value = key
  if (!localText(pkg)) grabFallback(pkg)
}
</script>

<template>
  <section class="page license-page">
    <h1>licenses</h1>
    <BracketNav :items="nav" />

    <div class="panel">
      <p>
        Hi! For the legal part while being simple, the website is licensed under the
        <a href="https://opensource.org/license/0bsd" target="_blank" rel="noopener">BSD Zero Clause License (0BSD)</a>,
        so you can do whatever you want with this as whatever you want, building steps are in
        the
        <a href="https://github.com/huhuhuhuheh/website#readme" target="_blank" rel="noopener">README</a>.
      </p>
      <pre class="legal">{{ zeroBsd }}</pre>
    </div>

    <div class="panel">
      <h2>this only covers the code</h2>
      <p>
        the license only applies to this code, see the
        <a href="https://github.com/huhuhuhuheh/website/blob/master/NOTICE.md" target="_blank" rel="noopener">NOTICE</a>.
        any of the following, but not limited to:
      </p>
      <ul>
        <li v-for="item in assets" :key="item">{{ item }}</li>
      </ul>
      <p>
        any of the above remain the property of their respective owners and are included for
        personal use only, if you reuse this repository make sure to remove or replace them.
      </p>
      <p class="dmca">
        for the DMCA lawyers/automations: hi! third-party material here is used only for
        personal, non-commercial and referential purposes, which is a transformative,
        non-commercial use under the fair use doctrine, 17 U.S.C. § 107 (non-commercial purpose,
        published works referenced rather than reproduced wholesale, and no effect on the market
        for the original). valid takedown notices under the DMCA, 17 U.S.C. § 512, will be honored
        promptly. all rights remain with their respective owners.
      </p>
    </div>

    <div class="panel">
      <h2>dependencies ({{ licenses.count }})</h2>
      <p>this website, or the fork that came from, includes the following packages, you can click to see them.</p>

      <ul class="deps">
        <li v-for="pkg in licenses.packages" :key="keyOf(pkg)">
          <button
            type="button"
            class="dep"
            :class="{ open: openPkg === keyOf(pkg) }"
            :aria-expanded="openPkg === keyOf(pkg)"
            @click="toggle(pkg)"
          >
            <span class="dep-arrow">{{ openPkg === keyOf(pkg) ? '−' : '+' }}</span>
            <span class="dep-name">{{ pkg.name }}</span>
            <span class="dep-version">{{ pkg.version }}</span>
            <span class="dep-license">{{ pkg.license }}</span>
            <span v-if="pkg.dev" class="dep-tag">dev</span>
          </button>

          <div v-if="openPkg === keyOf(pkg)" class="dep-detail">
            <div class="dep-links">
              <a v-if="pkg.homepage" :href="pkg.homepage" target="_blank" rel="noopener">homepage</a>
              <a v-if="pkg.repo" :href="pkg.repo" target="_blank" rel="noopener">source</a>
              <a
                :href="`https://www.npmjs.com/package/${pkg.name}/v/${pkg.version}`"
                target="_blank"
                rel="noopener"
              >
                npm
              </a>
            </div>

            <pre v-if="localText(pkg)" class="dep-text">{{ localText(pkg) }}</pre>

            <template v-else>
              <p v-if="!fallback[keyOf(pkg)] || fallback[keyOf(pkg)].state === 'loading'" class="dep-status">
                grabbing it...
              </p>
              <p v-else-if="fallback[keyOf(pkg)].state === 'empty'" class="dep-status">
                whoa, no licenses here? we free! /j
              </p>
              <pre v-else class="dep-text">{{ fallback[keyOf(pkg)].text }}</pre>
            </template>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.license-page {
  gap: 1rem;
}

.legal {
  margin: 0;
  padding: 0.75rem;
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-alt);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  line-height: 1.6;
  color: var(--text-dim);
  white-space: pre-wrap;
}

.dmca {
  color: var(--pink-mid);
  font-size: 0.72rem;
}

.deps {
  display: grid;
  gap: 0.1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dep {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  width: 100%;
  padding: 0.22rem 0.4rem;
  border: 1px solid transparent;
  border-radius: 6px;
  background: none;
  color: inherit;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease;
}

.dep:hover,
.dep.open {
  border-color: var(--border);
  background: var(--bg-alt);
}

.dep-arrow {
  flex: 0 0 auto;
  width: 0.7rem;
  color: var(--pink-mid);
}

.dep-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--text);
}

.dep-version {
  color: var(--text-muted);
  white-space: nowrap;
}

.dep-license {
  color: var(--pink-mid);
  white-space: nowrap;
}

.dep-tag {
  padding: 0.02rem 0.3rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
  font-size: 0.6rem;
}

.dep-detail {
  display: grid;
  gap: 0.4rem;
  padding: 0.2rem 0.5rem 0.6rem 1.6rem;
}

.dep-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.8rem;
  font-family: var(--font-mono);
  font-size: 0.64rem;
}

.dep-links a {
  color: var(--pink);
}

.dep-status {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.64rem;
  color: var(--text-muted);
}

.dep-text {
  max-height: 16rem;
  margin: 0;
  padding: 0.5rem;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  line-height: 1.5;
  color: var(--text-dim);
  white-space: pre-wrap;
}
</style>