<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import BracketNav from '../components/BracketNav.vue'
import { nav } from '../data/nav'
import { HATS } from '../lib/santaHats'
import { makeZip } from '../lib/zip'

const SIZE = 512
const STAGE = 360

const stageEl = ref(null)
const avatarImgEl = ref(null)
const hatImgEl = ref(null)
const avatarInput = ref(null)
const hatInput = ref(null)

const avatars = ref([])
const hats = ref(HATS.map((hat) => ({ ...hat, img: null, url: null })))
const activeAvatar = ref(null)
const selectedHat = ref(hats.value.length ? hats.value[0].id : null)
const canvasOk = ref(true)
const explainOpen = ref(false)
const submitOpen = ref(false)
const jollyOpen = ref(false)
const handleInput = ref('')
const grabbing = ref(false)
const grabError = ref('')
const faqNoEnded = ref(false)
const downloadOpen = ref(false)
const flipHat = ref(false)
const faqVideos = ref([])

function setFaqVideoRef(el, index) {
  faqVideos.value[index] = el
}

function onFaqToggle(event, index) {
  const video = faqVideos.value[index]
  if (!video) return
  if (event.target.open) {
    if (index === 1) faqNoEnded.value = false
    video.currentTime = 0
    video.muted = false
    video.play().catch(() => {})
  } else {
    video.pause()
  }
}

async function grabBlueskyAvatar() {
  const actor = handleInput.value.trim()
  if (!actor) return
  grabbing.value = true
  grabError.value = ''
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  const opts = { credentials: 'omit', signal: controller.signal }

  try {
    const profileRes = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(actor)}`,
      opts
    )
    if (!profileRes.ok) throw new Error(`profile lookup failed (${profileRes.status})`)
    const profile = await profileRes.json()
    if (!profile.avatar) throw new Error('that profile has no avatar')

    const did = profile.did
    const cid = new URL(profile.avatar).pathname.split('/').filter(Boolean).pop()?.split('@')[0]
    if (!cid) throw new Error("We couldn't find the avatar, so sorry u have to insert manually :(")

    let pds = 'https://bsky.social'
    const endpointFromDoc = (doc) =>
      doc?.service?.find(
        (s) => s.id === '#atproto_pds' || s.type === 'AtprotoPersonalDataServer'
      )?.serviceEndpoint

    if (did.startsWith('did:plc:')) {
      try {
        const docRes = await fetch(`https://plc.directory/${encodeURIComponent(did)}`, opts)
        if (docRes.ok) {
          const endpoint = endpointFromDoc(await docRes.json())
          if (endpoint) pds = endpoint.replace(/\/$/, '')
        }
      } catch {}
    } else if (did.startsWith('did:web:')) {
      const parts = did.slice('did:web:'.length).split(':').map(decodeURIComponent)
      const docUrl =
        parts.length === 1
          ? `https://${parts[0]}/.well-known/did.json`
          : `https://${parts[0]}/${parts.slice(1).join('/')}/did.json`
      try {
        const docRes = await fetch(docUrl, opts)
        if (docRes.ok) {
          const endpoint = endpointFromDoc(await docRes.json())
          if (endpoint) pds = endpoint.replace(/\/$/, '')
        }
      } catch {}
    }

    const blobRes = await fetch(
      `${pds}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`,
      opts
    )
    if (!blobRes.ok) throw new Error(`the PDS said ${blobRes.status}`)
    const blob = await blobRes.blob()
    if (!blob.type.startsWith('image/')) throw new Error('that blob is not an image')

    const url = URL.createObjectURL(blob)
    const img = await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('image failed to load'))
      }
      image.src = url
    })

    const id = 'bs' + Date.now() + Math.random().toString(36).slice(2)
    avatars.value.push({ id, label: `${actor} (bluesky)`, img, url })
    activeAvatar.value = id
    handleInput.value = ''
  } catch (error) {
    grabError.value =
      error.name === 'AbortError' ? "couldn't grab it: timed out" : `couldn't grab it: ${error.message}`
  } finally {
    clearTimeout(timer)
    grabbing.value = false
  }
}

let jollyTimer = null

function openJolly() {
  if (jollyTimer) clearTimeout(jollyTimer)
  jollyTimer = setTimeout(() => {
    jollyOpen.value = true
  }, 3000)
}

function closeJolly() {
  if (jollyTimer) clearTimeout(jollyTimer)
  jollyTimer = null
  jollyOpen.value = false
}

const avatarLayer = reactive({ x: 0, y: 0, scale: 1, coverScale: 1, zoom: 1, nw: 0, nh: 0 })
const hatLayer = reactive({ x: 0, y: 0, scale: 1, coverScale: 1, zoom: 1, nw: 0, nh: 0 })

let dragLayer = null
let startX = 0
let startY = 0
let originX = 0
let originY = 0

const hasAvatar = computed(() => avatars.value.some((a) => a.id === activeAvatar.value))
const activeAvatarItem = computed(
  () => avatars.value.find((a) => a.id === activeAvatar.value) || null
)
const activeHat = computed(() => hats.value.find((h) => h.id === selectedHat.value) || null)
const avatarStyle = computed(() => ({
  transform: `translate(${avatarLayer.x}px, ${avatarLayer.y}px) scale(${avatarLayer.scale})`
}))
const hatStyle = computed(() => {
  const x = flipHat.value ? hatLayer.x + hatLayer.nw * hatLayer.scale : hatLayer.x
  return {
    transform: `translate(${x}px, ${hatLayer.y}px) scale(${flipHat.value ? -hatLayer.scale : hatLayer.scale}, ${hatLayer.scale})`
  }
})

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function stageSize() {
  return stageEl.value?.clientWidth || STAGE
}

function supportsCanvas() {
  try {
    const test = document.createElement('canvas')
    test.width = 2
    test.height = 1
    const ctx = test.getContext && test.getContext('2d')
    if (!ctx || typeof test.toDataURL !== 'function') return false
    try {
      ctx.fillStyle = 'rgb(255, 0, 0)'
      ctx.fillRect(0, 0, 1, 1)
      ctx.fillStyle = 'rgb(0, 0, 255)'
      ctx.fillRect(1, 0, 1, 1)
      const pixels = ctx.getImageData(0, 0, 2, 1).data
      const readable =
        pixels[0] >= 230 && pixels[1] <= 25 && pixels[2] <= 25 && pixels[3] === 255 &&
        pixels[4] <= 25 && pixels[5] <= 25 && pixels[6] >= 230 && pixels[7] === 255
      return readable && test.toDataURL('image/png').startsWith('data:image/png')
    } catch {
      return false
    }
  } catch {
    return false
  }
}

function clampAvatar() {
  const s = stageSize()
  avatarLayer.x = Math.min(0, Math.max(s - avatarLayer.nw * avatarLayer.scale, avatarLayer.x))
  avatarLayer.y = Math.min(0, Math.max(s - avatarLayer.nh * avatarLayer.scale, avatarLayer.y))
}

function initAvatar() {
  const img = avatarImgEl.value
  if (!img || !img.naturalWidth) return
  const s = stageSize()
  avatarLayer.nw = img.naturalWidth
  avatarLayer.nh = img.naturalHeight
  avatarLayer.coverScale = Math.max(s / avatarLayer.nw, s / avatarLayer.nh)
  avatarLayer.zoom = 1
  avatarLayer.scale = avatarLayer.coverScale
  avatarLayer.x = (s - avatarLayer.nw * avatarLayer.scale) / 2
  avatarLayer.y = (s - avatarLayer.nh * avatarLayer.scale) / 2
  clampAvatar()
}

function initHat() {
  const img = hatImgEl.value
  if (!img || !img.naturalWidth) return
  const s = stageSize()
  hatLayer.nw = img.naturalWidth
  hatLayer.nh = img.naturalHeight
  hatLayer.coverScale = (s * 0.6) / img.naturalWidth
  hatLayer.zoom = 1
  hatLayer.scale = hatLayer.coverScale
  hatLayer.x = (s - img.naturalWidth * hatLayer.scale) / 2
  hatLayer.y = 0
}

function setZoom(layer, zoom, doClamp) {
  if (!layer.nw) return
  const s = stageSize()
  const cx = (s / 2 - layer.x) / layer.scale
  const cy = (s / 2 - layer.y) / layer.scale
  layer.zoom = zoom
  layer.scale = layer.coverScale * zoom
  layer.x = s / 2 - cx * layer.scale
  layer.y = s / 2 - cy * layer.scale
  if (doClamp) clampAvatar()
}

function zoomAvatar(value) {
  setZoom(avatarLayer, Number(value), true)
}

function zoomHat(value) {
  setZoom(hatLayer, Number(value), false)
}

function onDown(event, layer) {
  dragLayer = layer
  startX = event.clientX
  startY = event.clientY
  originX = layer.x
  originY = layer.y
  event.currentTarget.setPointerCapture(event.pointerId)
}

function onMove(event) {
  if (!dragLayer) return
  dragLayer.x = originX + (event.clientX - startX)
  dragLayer.y = originY + (event.clientY - startY)
  if (dragLayer === avatarLayer) clampAvatar()
}

function onUp() {
  dragLayer = null
}

function onWheel(event) {
  const isHat = event.target === hatImgEl.value
  const layer = isHat ? hatLayer : avatarLayer
  const zoom = clamp(layer.zoom - event.deltaY * 0.001, isHat ? 0.2 : 1, 3)
  setZoom(layer, zoom, !isHat)
}

function onAvatarFile(event) {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const id = 'av' + Date.now() + Math.random().toString(36).slice(2)
      avatars.value.push({ id, label: file.name, img, url })
      activeAvatar.value = id
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }
}

function onHatFile(event) {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const id = 'ht' + Date.now() + Math.random().toString(36).slice(2)
      hats.value.push({ id, label: file.name, src: url, url, img })
      selectedHat.value = id
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }
}

function paint(ctx) {
  ctx.clearRect(0, 0, SIZE, SIZE)
  const k = SIZE / stageSize()

  const avatar = activeAvatarItem.value
  if (avatar && avatar.img && avatarLayer.nw) {
    ctx.save()
    ctx.translate(avatarLayer.x * k, avatarLayer.y * k)
    ctx.scale(avatarLayer.scale * k, avatarLayer.scale * k)
    ctx.drawImage(avatar.img, 0, 0)
    ctx.restore()
  }

  const hat = activeHat.value && activeHat.value.img
  if (hat && hatLayer.nw) {
    const x = flipHat.value ? hatLayer.x + hatLayer.nw * hatLayer.scale : hatLayer.x
    ctx.save()
    ctx.translate(x * k, hatLayer.y * k)
    ctx.scale((flipHat.value ? -hatLayer.scale : hatLayer.scale) * k, hatLayer.scale * k)
    ctx.drawImage(hat, 0, 0)
    ctx.restore()
  }
}

function downloadPng() {
  if (!hasAvatar.value) return
  const out = document.createElement('canvas')
  out.width = SIZE
  out.height = SIZE
  const ctx = out.getContext('2d')
  if (!ctx) return
  paint(ctx)
  const link = document.createElement('a')
  link.download = 'santa-hat.png'
  link.href = out.toDataURL('image/png')
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function download() {
  if (!hasAvatar.value) return
  downloadOpen.value = true
}

function safeName(label) {
  return (
    String(label || 'avatar')
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-z0-9_-]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'avatar'
  )
}

function extensionOf(label, type) {
  const fromName = label?.match(/\.([a-z0-9]+)$/i)?.[1]
  if (fromName) return fromName.toLowerCase()
  const subtype = type?.split('/')[1]
  return subtype === 'jpeg' ? 'jpg' : subtype || 'png'
}

function dataUrlToBlob(dataUrl) {
  const [header, body] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png'
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    const fallback = () => resolve(dataUrlToBlob(canvas.toDataURL(type, quality)))
    if (typeof canvas.toBlob !== 'function') return fallback()
    canvas.toBlob((blob) => (blob ? resolve(blob) : fallback()), type, quality)
  })
}

async function compositeBlob(ext) {
  const out = document.createElement('canvas')
  out.width = SIZE
  out.height = SIZE
  const ctx = out.getContext('2d')
  if (!ctx) return null
  paint(ctx)
  const type =
    ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png'
  return canvasToBlob(out, type, 0.92)
}

async function confirmDownload(bundle) {
  downloadOpen.value = false
  if (!bundle) {
    downloadPng()
    return
  }

  const avatar = activeAvatarItem.value
  const hat = activeHat.value
  if (!avatar || !hat) return

  try {
    const avatarBlob = await fetch(avatar.url).then((response) => response.blob())
    const avatarExt = extensionOf(avatar.label, avatarBlob.type)
    const compositeExt = ['jpg', 'jpeg', 'webp', 'png'].includes(avatarExt) ? avatarExt : 'png'
    const composed = await compositeBlob(compositeExt)
    if (!composed) throw new Error('canvas unavailable')
    const zip = await makeZip([
      { name: `original.${avatarExt}`, data: await avatarBlob.arrayBuffer() },
      { name: `hat.${compositeExt}`, data: await composed.arrayBuffer() }
    ])
    const link = document.createElement('a')
    link.download = `${safeName(avatar.label)}_${safeName(hat.label)}.zip`
    link.href = URL.createObjectURL(zip)
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  } catch (error) {
    console.error('bundle failed', error)
  }
}

watch(activeAvatar, async () => {
  await nextTick()
  initAvatar()
})

watch(selectedHat, async () => {
  await nextTick()
  initHat()
})

onMounted(async () => {
  canvasOk.value = supportsCanvas()
  for (const hat of hats.value) {
    if (hat.url) continue
    const img = new Image()
    img.onload = () => {
      hat.img = img
    }
    img.src = hat.src
  }
  await nextTick()
  initAvatar()
  initHat()
})

onBeforeUnmount(() => {
  if (jollyTimer) clearTimeout(jollyTimer)
  for (const avatar of avatars.value) {
    if (avatar.url) URL.revokeObjectURL(avatar.url)
  }
  for (const hat of hats.value) {
    if (hat.url) URL.revokeObjectURL(hat.url)
  }
})
</script>

<template>
  <section class="page santa">
    <h1>Santa Hat</h1>
    <BracketNav :items="nav" />

    <p class="strong lede">
      <span class="jolly-trigger" @mouseenter="openJolly" @mouseleave="closeJolly"
        >Voices are getting jolly<span v-if="jollyOpen" class="jolly-pop"
          ><img src="/src/img/jolly.gif" alt="jolly" /></span></span
      >, if you are ready for christmas, then ya shall be getting a little hat for your avatar isn't
      it? then you can make one here
    </p>

    <div v-if="!canvasOk" class="panel canvas-error" role="alert">
      <p class="strong">Is your HTML5 canvas allowed?!?!?! because it doesn't!</p>
      <button class="what-btn" type="button" @click="explainOpen = !explainOpen">
        WHAT DO YOU MEAN
      </button>
      <div v-if="explainOpen" class="what-modal">
        <p>
          Your browser by default has image data disabled which is the thing that allows to build the
          hat
        </p>
        <p>Either accept the permission as soon as it asks, or allow it on your browser's settings</p>
        <img src="/src/img/browserallowhtml5img.png" alt="allowing image data in the browser" />
      </div>
    </div>

    <div class="workspace">
      <div class="stage">
        <div
          ref="stageEl"
          class="preview"
          :class="{ empty: !hasAvatar }"
          @pointerdown="onDown($event, avatarLayer)"
          @pointermove="onMove"
          @pointerup="onUp"
          @pointercancel="onUp"
          @wheel.prevent="onWheel"
        >
          <template v-if="hasAvatar">
            <img
              v-if="activeAvatarItem"
              :key="activeAvatarItem.id"
              ref="avatarImgEl"
              class="layer avatar-layer"
              :src="activeAvatarItem.url"
              :style="avatarStyle"
              alt="your avatar"
              draggable="false"
              @load="initAvatar"
            />
            <img
              v-if="activeHat"
              :key="activeHat.id"
              ref="hatImgEl"
              class="layer hat-layer"
              :src="activeHat.src"
              :style="hatStyle"
              alt="hat"
              draggable="false"
              @pointerdown.stop="onDown($event, hatLayer)"
              @load="initHat"
            />
          </template>
          <div v-else class="empty-message">Upload your avatar!</div>
        </div>

        <div class="zoom-controls">
          <label class="zoom-slider">
            <span class="zoom-label">
              Avatar Zoom <b class="zoom-value">{{ avatarLayer.zoom.toFixed(2) }}x</b>
            </span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              :disabled="!hasAvatar"
              :value="avatarLayer.zoom"
              @input="zoomAvatar($event.target.value)"
            />
          </label>
          <label class="zoom-slider">
            <span class="zoom-label">
              Hat Zoom <b class="zoom-value">{{ hatLayer.zoom.toFixed(2) }}x</b>
            </span>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.01"
              :value="hatLayer.zoom"
              @input="zoomHat($event.target.value)"
            />
          </label>
          <label class="flip-check">
            <input v-model="flipHat" type="checkbox" />
            <span>Flip hat</span>
          </label>
        </div>
      </div>

      <aside class="controls">
        <div class="panel">
          <h2>avatar</h2>
          <div class="grid">
            <button
              v-for="avatar in avatars"
              :key="avatar.id"
              class="cell avatar-cell"
              :class="{ active: activeAvatar === avatar.id }"
              type="button"
              :title="avatar.label"
              @click="activeAvatar = avatar.id"
            >
              <img :src="avatar.url" :alt="avatar.label" />
            </button>
          </div>
          <button
            class="btn"
            type="button"
            :disabled="!canvasOk"
            @click="avatarInput && avatarInput.click()"
          >
            + upload avatar
          </button>
          <input
            ref="avatarInput"
            type="file"
            accept="image/*"
            multiple
            hidden
            @change="onAvatarFile"
          />
          <div class="grab-row">
            <input
              v-model="handleInput"
              type="text"
              placeholder="ATProto handle..."
              :disabled="!canvasOk || grabbing"
              @keydown.enter.prevent="grabBlueskyAvatar"
            />
            <button
              class="btn"
              type="button"
              :disabled="!canvasOk || grabbing || !handleInput.trim()"
              @click="grabBlueskyAvatar"
            >
              {{ grabbing ? '...' : 'grab' }}
            </button>
          </div>
          <p v-if="grabError" class="grab-error">{{ grabError }}</p>
        </div>

        <div class="panel">
          <h2>hat</h2>
          <div class="grid">
            <button
              v-for="hat in hats"
              :key="hat.id"
              class="cell hat-cell"
              :class="{ active: selectedHat === hat.id }"
              type="button"
              :title="hat.label"
              @click="selectedHat = hat.id"
            >
              <img :src="hat.src" :alt="hat.label" />
            </button>
          </div>
          <button
            class="btn"
            type="button"
            :disabled="!canvasOk"
            @click="hatInput && hatInput.click()"
          >
            + upload hat
          </button>
          <button class="btn submit-btn" type="button" @click="submitOpen = !submitOpen">
            How to submit an hat
          </button>
          <input ref="hatInput" type="file" accept="image/*" multiple hidden @change="onHatFile" />
          <div v-if="submitOpen" class="what-modal submit-modal">
            <p>Want to add your hat to the collection to use? sure :3</p>
            <ol>
              <li>
                Make a fork of the website
                <a
                  href="https://github.com/huhuhuhuheh/website/fork"
                  target="_blank"
                  rel="noopener"
                >here</a>
              </li>
              <li>
                Clone your fork and switch to a branch (via <code>git switch -c &lt;name&gt;</code>)
              </li>
              <li>Upload your santa hat to <code>public/src/img/shats</code> as an .png</li>
              <li>
                Edit <code>src/lib/santaHats.js</code> to add your santa hat following this structure:
                <pre><code>export const HATS = [
  { id: 'hiimhat', label: 'hihat', src: '/src/img/shats/coolhat.png' },
  { id: 'himotherhat', label: 'otherhat', src: '/src/img/shats/amazinghat.png' }
]</code></pre>
              </li>
              <li>Commit as that branch</li>
              <li>
                Make a
                <a
                  href="https://github.com/huhuhuhuheh/website/compare"
                  target="_blank"
                  rel="noopener"
                >pull request</a>
              </li>
            </ol>
          </div>
        </div>

        <div class="panel save">
          <button class="download" type="button" :disabled="!hasAvatar" @click="download">
            ↓ download pfp
          </button>
        </div>
      </aside>
    </div>

    <div class="panel faq">
      <h3>FAQ</h3>
      <details class="faq-item" @toggle="onFaqToggle($event, 0)">
        <summary>Can i upload as many avatars and hats as i want?</summary>
        <video :ref="(el) => setFaqVideoRef(el, 0)" src="/Yes.mp4" playsinline preload="auto" />
      </details>
      <details class="faq-item" @toggle="onFaqToggle($event, 1)">
        <summary>Is anything sent to any server?</summary>
        <video
          :ref="(el) => setFaqVideoRef(el, 1)"
          src="/No.mp4"
          playsinline
          preload="auto"
          @ended="faqNoEnded = true"
        />
        <p v-if="faqNoEnded" class="faq-note">
          howeeever: if you ask it to grab an avatar from an atproto handle, the request goes to Bluesky and its home
          PDS, and nothing else
        </p>
      </details>
    </div>

    <div v-if="downloadOpen" class="modal-backdrop" @click.self="downloadOpen = false">
      <div class="save-modal" role="dialog" aria-modal="true" aria-labelledby="save-modal-title">
        <h2 id="save-modal-title">Heya!</h2>
        <p>Do you want the original avatar bundled when you want to change back?</p>
        <div class="save-modal-actions">
          <button class="btn" type="button" @click="confirmDownload(true)">Yes</button>
          <button class="btn" type="button" @click="confirmDownload(false)">No</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lede {
  max-width: 62ch;
}

.jolly-trigger {
  position: relative;
}

.jolly-pop {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  padding: 0.4rem;
  border: 1px solid var(--border-hi);
  border-radius: 10px;
  background: var(--bg-alt);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
}

.jolly-pop img {
  display: block;
  max-width: 220px;
  height: auto;
  border-radius: 6px;
}

.canvas-error {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  column-gap: 1rem;
  row-gap: 0.7rem;
  border-color: var(--amber);
}

.canvas-error p {
  color: var(--amber);
  font-size: 0.85rem;
}

.what-btn {
  grid-column: 2;
  align-self: center;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--amber);
  border-radius: 6px;
  background: transparent;
  color: var(--amber);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 140ms ease;
}

.what-btn:hover {
  background: color-mix(in srgb, var(--amber) 14%, transparent);
}

.what-modal {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  max-width: 420px;
  padding: 0.7rem;
  border: 1px solid var(--border-hi);
  border-radius: 10px;
  background: var(--bg);
}

.canvas-error .what-modal p {
  color: var(--text-dim);
  font-size: 0.72rem;
  line-height: 1.7;
}

.what-modal img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--border);
  border-radius: 6px;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(270px, 330px);
  gap: 1rem;
  align-items: start;
}

.stage {
  display: grid;
  place-items: center;
  padding: 1.1rem;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-alt);
}

.preview {
  position: relative;
  width: min(100%, 360px);
  aspect-ratio: 1;
  overflow: hidden;
  border: 2px dashed var(--border-hi);
  border-radius: 10px;
  background: var(--bg);
  box-shadow: 0 0 0 1px var(--border-hi), 0 18px 45px rgba(0, 0, 0, 0.45);
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.preview:active {
  cursor: grabbing;
}

.preview.empty {
  border: 0;
  box-shadow: none;
  background: transparent;
  cursor: default;
}

.layer {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  max-width: none;
  will-change: transform;
}

.hat-layer {
  cursor: grab;
}

.empty-message {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.controls .panel {
  gap: 0.6rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 0.4rem;
}

.cell {
  aspect-ratio: 1;
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  cursor: pointer;
  transition: border-color 140ms ease;
}

.cell:hover,
.cell.active {
  border-color: var(--pink-mid);
}

.cell img {
  display: block;
  width: 100%;
  height: 100%;
}

.avatar-cell img {
  object-fit: cover;
}

.hat-cell img {
  object-fit: contain;
  padding: 0.2rem;
}

.zoom-controls {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: min(100%, 360px);
}

.zoom-slider {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  color: var(--text-dim);
}

.zoom-label {
  display: flex;
  justify-content: space-between;
}

.zoom-value {
  color: var(--cream);
  font-weight: 500;
}

.zoom-slider input[type="range"] {
  width: 100%;
  accent-color: var(--pink-mid);
  cursor: pointer;
}

.flip-check {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  align-self: start;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.66rem;
  cursor: pointer;
}

.flip-check input {
  width: 0.85rem;
  height: 0.85rem;
  margin: 0;
  accent-color: var(--pink-mid);
  cursor: pointer;
}

.btn {
  padding: 0.5rem 0.6rem;
  border: 1px dashed var(--border-hi);
  border-radius: 8px;
  background: transparent;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  cursor: pointer;
  transition: color 140ms ease, border-color 140ms ease;
}

.btn:hover:not(:disabled) {
  color: var(--pink);
  border-color: var(--pink-mid);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.submit-btn {
  border-style: solid;
  border-color: var(--border-hi);
}

.submit-modal {
  max-width: none;
}

.submit-modal p {
  color: var(--text);
  font-size: 0.75rem;
}

.submit-modal ol {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding-left: 1.3rem;
  list-style: decimal;
}

.submit-modal li {
  padding-left: 0;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  line-height: 1.7;
}

.submit-modal li::before {
  content: none;
}

.submit-modal a {
  color: var(--blue);
  border-bottom: 1px solid transparent;
}

.submit-modal a:hover {
  color: var(--pink);
  border-bottom-color: var(--pink-mid);
}

.submit-modal code {
  padding: 0.05rem 0.25rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-alt);
  color: var(--cream);
  font-size: 0.65rem;
}

.submit-modal pre {
  overflow-x: auto;
  margin-top: 0.4rem;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
}

.submit-modal pre code {
  padding: 0;
  border: 0;
  background: none;
  white-space: pre;
}

.save {
  align-items: stretch;
}

.download {
  padding: 0.7rem;
  border: 1px solid var(--pink-mid);
  border-radius: 8px;
  background: color-mix(in srgb, var(--pink) 12%, transparent);
  color: var(--pink);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 140ms ease, color 140ms ease;
}

.download:hover:not(:disabled) {
  background: var(--pink);
  color: var(--bg);
}

.download:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.faq {
  gap: 0.4rem;
}

.faq-item {
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
}

.faq-item summary {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  line-height: 1.6;
  color: var(--text);
  list-style: none;
  cursor: pointer;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary::before {
  content: "+";
  margin-right: 0.4rem;
  color: var(--pink-mid);
}

.faq-item[open] summary::before {
  content: "−";
}

.faq-item video {
  display: block;
  width: 100%;
  max-width: 240px;
  margin-top: 0.5rem;
  border-radius: 6px;
}

.faq-note {
  margin-top: 0.5rem;
  max-width: 42ch;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.66rem;
  line-height: 1.7;
}

.grab-row {
  display: flex;
  gap: 0.4rem;
}

.grab-row input {
  min-width: 0;
  flex: 1 1 auto;
  padding: 0.45rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.7rem;
}

.grab-row .btn {
  flex: 0 0 auto;
}

.page .grab-error {
  color: #ef4444;
  font-size: 0.68rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.save-modal {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  width: min(100%, 340px);
  padding: 1.1rem;
  border: 1px solid var(--border-hi);
  border-radius: 14px;
  background: var(--bg-alt);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
}

.save-modal h2 {
  margin: 0;
  font-size: 1rem;
}

.save-modal p {
  margin: 0;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  line-height: 1.7;
}

.save-modal-actions {
  display: flex;
  gap: 0.5rem;
}

.save-modal-actions .btn {
  flex: 1;
}

@media (max-width: 700px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}
</style>