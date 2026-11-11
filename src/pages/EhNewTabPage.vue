<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BracketNav from '../components/BracketNav.vue'
import { nav } from '../data/nav'

const shots = [
  { src: '/src/img/addon/ehnewtab/newnormal.png', alt: 'the default new tab' },
  { src: '/src/img/addon/ehnewtab/newnormalm2.png', alt: 'another new tab background' },
  { src: '/src/img/addon/ehnewtab/settings.png', alt: 'the settings page' },
  { src: '/src/img/addon/ehnewtab/searchengine.png', alt: 'search engine settings' },
  { src: '/src/img/addon/ehnewtab/halloween.png', alt: 'halloween doodle' },
  { src: '/src/img/addon/ehnewtab/lancer.png', alt: 'lancer doodle' },
  { src: '/src/img/addon/ehnewtab/queen.png', alt: 'queen doodle' },
  { src: '/src/img/addon/ehnewtab/xmas.png', alt: 'xmas doodle' }
]

const track = ref(null)
const thumbEls = ref([])
const lightboxImg = ref(null)
const openIndex = ref(-1)
const prevIndex = ref(-1)
const direction = ref('')
const closing = ref(false)
const controlsVisible = ref(false)
const animating = ref(false)
const comparePos = ref(50)
const compareEl = ref(null)

let compareDragging = false

let controlsTimer = null
let navTimer = null

const isOpen = computed(() => openIndex.value >= 0)
const current = computed(() => shots[openIndex.value] || null)

function setThumbRef(el, index) {
  thumbEls.value[index] = el
}

function scrollByAmount(dir) {
  const el = track.value
  if (!el) return
  el.scrollBy({ left: dir * el.clientWidth * 0.86, behavior: 'smooth' })
}

function setCompareFromEvent(event) {
  const el = compareEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  if (!rect.width) return
  const pct = ((event.clientX - rect.left) / rect.width) * 100
  comparePos.value = Math.min(100, Math.max(0, pct))
}

function onCompareMove(event) {
  if (compareDragging) setCompareFromEvent(event)
}

function stopCompareDrag() {
  compareDragging = false
  window.removeEventListener('pointermove', onCompareMove)
  window.removeEventListener('pointerup', stopCompareDrag)
  window.removeEventListener('pointercancel', stopCompareDrag)
}

function startCompareDrag(event) {
  if (event.button !== 0) return
  event.preventDefault()
  compareDragging = true
  setCompareFromEvent(event)
  window.addEventListener('pointermove', onCompareMove)
  window.addEventListener('pointerup', stopCompareDrag)
  window.addEventListener('pointercancel', stopCompareDrag)
}

function nudgeCompare(step) {
  comparePos.value = Math.min(100, Math.max(0, comparePos.value + step))
}

function centerOffset(from, to) {
  return {
    scale: from.width / to.width,
    tx: from.left + from.width / 2 - (to.left + to.width / 2),
    ty: from.top + from.height / 2 - (to.top + to.height / 2)
  }
}

async function openShot(index) {
  if (isOpen.value) return
  openIndex.value = index
  prevIndex.value = -1
  direction.value = ''
  closing.value = false
  controlsVisible.value = false
  animating.value = false
  await nextTick()

  const thumb = thumbEls.value[index]
  const img = lightboxImg.value
  if (!thumb || !img) {
    controlsVisible.value = true
    return
  }

  const from = thumb.getBoundingClientRect()
  const to = img.getBoundingClientRect()
  if (!to.width || !to.height) {
    controlsVisible.value = true
    return
  }

  const { scale, tx, ty } = centerOffset(from, to)
  img.style.transition = 'none'
  img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`
  void img.offsetWidth

  requestAnimationFrame(() => {
    img.style.transition = 'transform 340ms cubic-bezier(.2,.7,.3,1)'
    img.style.transform = 'none'
  })

  controlsTimer = setTimeout(() => {
    controlsVisible.value = true
  }, 340)
}

function resetNavigation() {
  if (navTimer) clearTimeout(navTimer)
  navTimer = null
  animating.value = false
  prevIndex.value = -1
  direction.value = ''
}

function closeShot() {
  if (!isOpen.value || closing.value) return
  resetNavigation()
  closing.value = true
  controlsVisible.value = false
  if (controlsTimer) clearTimeout(controlsTimer)

  const img = lightboxImg.value
  const thumb = thumbEls.value[openIndex.value]
  if (!img || !thumb) {
    openIndex.value = -1
    closing.value = false
    return
  }

  const from = thumb.getBoundingClientRect()
  const to = img.getBoundingClientRect()
  if (!to.width || !to.height) {
    openIndex.value = -1
    closing.value = false
    return
  }

  const { scale, tx, ty } = centerOffset(from, to)
  img.style.transition = 'transform 300ms cubic-bezier(.4,0,.2,1)'
  img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`

  setTimeout(() => {
    openIndex.value = -1
    closing.value = false
    if (img) {
      img.style.transition = ''
      img.style.transform = ''
    }
  }, 300)
}

function navigate(step) {
  if (!isOpen.value || closing.value || animating.value) return
  if (lightboxImg.value) {
    lightboxImg.value.style.transition = ''
    lightboxImg.value.style.transform = ''
  }

  direction.value = step > 0 ? 'next' : 'prev'
  prevIndex.value = openIndex.value
  openIndex.value = (openIndex.value + step + shots.length) % shots.length
  animating.value = true

  navTimer = setTimeout(() => {
    animating.value = false
    prevIndex.value = -1
    direction.value = ''
    navTimer = null
  }, 320)
}

function nextShot() {
  navigate(1)
}

function prevShot() {
  navigate(-1)
}

function onKey(event) {
  if (!isOpen.value) return
  if (event.key === 'Escape') closeShot()
  else if (event.key === 'ArrowRight') nextShot()
  else if (event.key === 'ArrowLeft') prevShot()
}

watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  stopCompareDrag()
  if (controlsTimer) clearTimeout(controlsTimer)
  if (navTimer) clearTimeout(navTimer)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="page ehnewtab">
    <BracketNav :items="nav" />

    <header class="hero">
      <img class="icon" src="/src/img/addon/ehnewtab/broicon.png" alt="Eh's New Tab icon" />
      <h1>Eh's New Tab</h1>
    </header>

    <div class="carousel">
      <div ref="track" class="carousel-track">
        <button
          v-for="(shot, index) in shots"
          :key="shot.src"
          :ref="(el) => setThumbRef(el, index)"
          class="thumb"
          type="button"
          @click="openShot(index)"
        >
          <img :src="shot.src" :alt="shot.alt" loading="lazy" />
        </button>
      </div>
      <button class="carousel-btn prev" type="button" aria-label="Previous screenshot" @click="scrollByAmount(-1)">
        ‹
      </button>
      <button class="carousel-btn next" type="button" aria-label="Next screenshot" @click="scrollByAmount(1)">
        ›
      </button>
    </div>

    <div class="badges">
      <a href="https://addons.mozilla.org/addon/ehnewtab/" target="_blank" rel="noopener">
        <img src="/src/img/addon/get-firefox.png" alt="Get the add-on for Firefox" />
      </a>
      <a href="https://chrome.google.com/webstore/detail/bbbhgkjjohfoaefdaljchaoagaegjbpa" target="_blank" rel="noopener">
        <img src="/src/img/addon/get-chrome.png" alt="Available in the Chrome Web Store" />
      </a>
      <a href="https://microsoftedge.microsoft.com/addons/detail/pegbljbkaiefhknapfbfdodeephfiabp" target="_blank" rel="noopener">
        <img src="/src/img/addon/get-edge.png" alt="Get it from Microsoft Edge Add-ons" />
      </a>
      <a class="gh-badge" href="https://github.com/ehshit/ehnewtab/" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
          />
        </svg>
        <span>source on github</span>
      </a>
    </div>

    <div class="panel desc">
      <p>
        Eh's New Tab, as its name says, simply offers you a simple New Tab experience without any
        glossy bloat or unnecessary stuff, and without any messy configuration (weather, image
        quotes, etc).
      </p>

      <h2>NO TRACKING, NO BLOAT, EVER:</h2>
      <p>
        The extension does not connect to any of eh's services, includes no telemetry, and adds no
        ads, weather or similar junk, so you don't have to worry about your data!*
      </p>
      <p class="notes">
        * This does not apply when it connects to safebooru, Reddit, any Redlib instance, or any URL
        you choose, in order to fetch a background.
      </p>

      <h2>JUST A BACKGROUND, WITHOUT THE CORPORATE:</h2>
      <p>
        Apart from reddit, it lets you grab backgrounds from safebooru, any Redlib instance (if the
        bot check isn't enforced and/or it's whitelisted), any URL you want, or just a static image
        from your device!
      </p>
      <p>
        Plus, its wallpaper list is cached locally so it doesn't refetch all the time, and your
        local image is there forever!
      </p>

      <h2>IT HAS THEMES:</h2>
      <p>
        It comes with built-in ones, but if you feel those aren't good enough, you can make your own
        with CSS!
      </p>

      <h2>DOODLES &amp; MORE:</h2>
      <p>
        Usual New Tab extensions are just new tabs without anything else which is <em>boring</em>,
        Eh's New Tab instead offers a doodle system (similar to Google's doodles, but our own) so
        your new tab can get stupid, silly, and random seasonal doodles that show up on their own!
      </p>
    </div>

    <div class="panel faq">
      <h2>FAQ:</h2>

      <details class="faq-item">
        <summary>
          Why does it appear at the bottom the extension name with Customize Chrome/Chromium etc?
        </summary>
        <div class="faq-body">
          <img
            src="/src/img/addon/ehnewtab/bottomchromeforce.png"
            alt="Chrome showing the extension name and Customize Chrome option at the bottom of the new tab"
            loading="lazy"
          />
          <p>
            Blame Google, that's on them for adding the little small and very annoying thing at the
            bottom for reminding that the extension is controlling its new tab plus the shortcut to
            customize the browser, which uh, why?
          </p>
          <p>
            Regardless, if this is annoying to you and want to remove it, use something like
            <a href="https://helium.computer/" target="_blank" rel="noopener">Helium</a>, they
            don't have that!
          </p>

          <p>If you are not sure if you want to switch, here's a comparasion:</p>

          <div ref="compareEl" class="compare" @pointerdown="startCompareDrag">
            <img
              class="compare-img"
              src="/src/img/addon/ehnewtab/heliumwithout.png"
              alt="Helium new tab, no bar at the bottom"
              loading="lazy"
              draggable="false"
            />
            <img
              class="compare-img compare-overlay"
              :style="{ clipPath: `inset(0 ${100 - comparePos}% 0 0)` }"
              src="/src/img/addon/ehnewtab/chromewithbottom.png"
              alt="Chrome new tab with the extension name and Customize Chrome bar at the bottom"
              loading="lazy"
              draggable="false"
            />
            <span class="compare-label left" @pointerdown.stop>chrome</span>
            <span class="compare-label right" @pointerdown.stop>helium</span>
            <div
              class="compare-handle"
              :style="{ left: `${comparePos}%` }"
              role="slider"
              tabindex="0"
              aria-label="Drag to compare Chrome and Helium"
              :aria-valuenow="Math.round(comparePos)"
              :aria-valuetext="`${Math.round(comparePos)}% Chrome`"
              aria-valuemin="0"
              aria-valuemax="100"
              @keydown.left.prevent="nudgeCompare(-2)"
              @keydown.right.prevent="nudgeCompare(2)"
            >
              <span aria-hidden="true">‹ ›</span>
            </div>
          </div>
        </div>
      </details>

      <details class="faq-item">
        <summary>
          Why is the search box say "Search with your default engine" and Search Engines in settings
          disabled?
        </summary>
        <div class="faq-body">
          <img
            src="/src/img/addon/ehnewtab/defenginechromebuild.png"
            alt="Eh's New Tab search box showing Search with your default engine, with search engine settings disabled"
            loading="lazy"
          />
          <p>
            Blame Google, they forced me to use their API for the search box/search engine, it means
            that the search engine in the extension is managed by your Browser's Settings, so any
            chromium browser that installs it from the Chrome Web Store will have this variant
          </p>
          <p>
            If you want to use Eh's New Tab's own custom engine, either switch to
            <a href="https://www.firefox.com" target="_blank" rel="noopener">Firefox</a>
            (or <a href="https://librewolf.net/" target="_blank" rel="noopener">Librewolf</a> for a
            private Firefox), or grab the Unlocked variant from
            <a href="https://github.com/ehshit/ehnewtab/releases/latest" target="_blank" rel="noopener">Github</a>
            and sideload it yourself from the extensions panel, however it needs you to have
            Developer Mode on and to have it somewhere!
          </p>
        </div>
      </details>
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        class="lightbox"
        :class="{ closing, 'controls-on': controlsVisible }"
        @click.self="closeShot"
      >
        <div class="lightbox-bar">
          <a class="lightbox-open" :href="current.src" target="_blank" rel="noopener">
            open in new tab
          </a>
          <button class="lightbox-close" type="button" aria-label="Close" @click="closeShot">×</button>
        </div>

        <button class="lightbox-nav prev" type="button" aria-label="Previous screenshot" @click="prevShot">
          ‹
        </button>

        <figure class="lightbox-figure">
          <div class="lightbox-viewport">
            <img
              v-if="prevIndex >= 0"
              class="lightbox-img lb-layer"
              :class="direction === 'next' ? 'slide-next-leave' : 'slide-prev-leave'"
              :src="shots[prevIndex].src"
              :alt="shots[prevIndex].alt"
            />
            <img
              ref="lightboxImg"
              class="lightbox-img lb-layer"
              :class="
                direction === 'next'
                  ? 'slide-next-enter'
                  : direction === 'prev'
                    ? 'slide-prev-enter'
                    : ''
              "
              :src="current.src"
              :alt="current.alt"
            />
          </div>
          <figcaption class="lightbox-count">{{ openIndex + 1 }} / {{ shots.length }}</figcaption>
        </figure>

        <button class="lightbox-nav next" type="button" aria-label="Next screenshot" @click="nextShot">
          ›
        </button>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.icon {
  width: clamp(48px, 9vw, 72px);
  height: clamp(48px, 9vw, 72px);
  flex: 0 0 auto;
  border: 1px solid var(--border-hi);
  border-radius: 16px;
}

.hero h1 {
  min-width: 0;
  overflow-wrap: anywhere;
}

.carousel {
  position: relative;
  padding: 0.55rem;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-alt);
}

.carousel-track {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  border-radius: 10px;
  scrollbar-width: thin;
  scrollbar-color: var(--border-hi) transparent;
}

.thumb {
  flex: 0 0 clamp(210px, 34vw, 330px);
  aspect-ratio: 16 / 10;
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  cursor: pointer;
  scroll-snap-align: center;
}

.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.95);
  transition: transform 220ms ease, filter 220ms ease;
}

.thumb:hover img {
  transform: scale(1.05);
  filter: saturate(1.1);
}

.carousel-btn {
  position: absolute;
  top: 50%;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-hi);
  border-radius: 50%;
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 1.05rem;
  line-height: 1;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transform: translateY(-50%);
  transition: color 140ms ease, border-color 140ms ease;
}

.carousel-btn:hover {
  color: var(--pink);
  border-color: color-mix(in srgb, var(--pink) 45%, var(--border-hi));
}

.carousel-btn.prev {
  left: 0.75rem;
}

.carousel-btn.next {
  right: 0.75rem;
}

.badges {
  justify-content: center;
}

.gh-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.32rem 0.6rem;
  border: 1px solid var(--border-hi);
  border-radius: 6px;
  font-size: 0.68rem;
  color: var(--text-dim);
  transition: color 140ms ease, border-color 140ms ease;
}

.gh-badge svg {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
}

.gh-badge:hover {
  color: var(--pink);
  border-color: color-mix(in srgb, var(--pink) 45%, var(--border-hi));
}

.desc {
  gap: 0.55rem;
  text-align: center;
}

.desc p {
  margin-inline: auto;
}

.desc h2 {
  margin-top: 0.5rem;
}

.faq {
  text-align: left;
}

.faq h2 {
  text-align: center;
}

.faq-item {
  padding: 0.62rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
}

.faq-item summary {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  line-height: 1.6;
  color: var(--text);
  list-style: none;
  cursor: pointer;
  transition: color 140ms ease;
}

.faq-item summary::-webkit-details-marker {
  display: none;
}

.faq-item summary:hover {
  color: var(--pink);
}

.faq-item summary::before {
  content: "+";
  flex: 0 0 auto;
  color: var(--pink);
}

.faq-item[open] summary::before {
  content: "−";
}

.faq-body {
  display: grid;
  gap: 0.55rem;
  margin-top: 0.6rem;
}

.faq-body img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-alt);
}

.faq-body p {
  margin: 0;
}

.compare {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-alt);
  cursor: ew-resize;
  touch-action: none;
  user-select: none;
}

.compare-img {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}

.compare-overlay {
  position: absolute;
  inset: 0;
  height: 100%;
  object-fit: cover;
}

.compare-label {
  position: absolute;
  top: 0.5rem;
  padding: 0.1rem 0.4rem;
  border: 1px solid var(--border-hi);
  border-radius: 4px;
  background: color-mix(in srgb, var(--bg) 72%, transparent);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.04em;
  color: var(--text-dim);
  backdrop-filter: blur(4px);
  cursor: default;
  opacity: 0.22;
  transition: opacity 160ms ease;
}

.compare-label:hover {
  opacity: 1;
}

.compare-label.left {
  left: 0.5rem;
}

.compare-label.right {
  right: 0.5rem;
}

.compare-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--pink);
  transform: translateX(-1px);
  cursor: ew-resize;
}

.compare-handle::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-hi);
  border-radius: 50%;
  background: color-mix(in srgb, var(--bg) 84%, transparent);
  transform: translate(-50%, -50%);
}

.compare-handle span {
  position: absolute;
  top: 50%;
  left: 50%;
  color: var(--pink);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  line-height: 1;
  white-space: nowrap;
  transform: translate(-50%, -50%);
}

.compare-handle:focus-visible {
  outline: 2px solid var(--pink);
  outline-offset: 3px;
  border-radius: 2px;
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 4vw, 2.5rem);
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(6px);
  transition: background-color 300ms ease, backdrop-filter 300ms ease;
}

.lightbox.closing {
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0);
}

.lightbox-bar {
  position: absolute;
  top: clamp(0.85rem, 3vw, 1.5rem);
  right: clamp(0.85rem, 3vw, 1.5rem);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lightbox-open {
  padding: 0.32rem 0.65rem;
  border: 1px solid var(--border-hi);
  border-radius: 6px;
  font-size: 0.68rem;
  color: var(--text-dim);
  background: rgba(0, 0, 0, 0.4);
  transition: color 140ms ease, border-color 140ms ease;
}

.lightbox-open:hover {
  color: var(--pink);
  border-color: color-mix(in srgb, var(--pink) 45%, var(--border-hi));
}

.lightbox-close {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-hi);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: color 140ms ease, border-color 140ms ease;
}

.lightbox-close:hover {
  color: var(--pink);
  border-color: color-mix(in srgb, var(--pink) 45%, var(--border-hi));
}

.lightbox-figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  max-width: 100%;
}

.lightbox-viewport {
  position: relative;
  width: min(92vw, 1400px);
  height: min(82vh, calc(100vh - 7rem));
}

.lightbox-img {
  max-width: 100%;
  max-height: 100%;
  border: 1px solid var(--border-hi);
  border-radius: 10px;
  object-fit: contain;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  will-change: transform;
}

.lb-layer {
  position: absolute;
  inset: 0;
  margin: auto;
  width: auto;
  height: auto;
}

.lightbox-count {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  color: var(--text-dim);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--border-hi);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transform: translateY(-50%);
  transition: color 140ms ease, border-color 140ms ease;
}

.lightbox-nav:hover {
  color: var(--pink);
  border-color: color-mix(in srgb, var(--pink) 45%, var(--border-hi));
}

.lightbox-nav.prev {
  left: clamp(0.5rem, 2vw, 1.25rem);
}

.lightbox-nav.next {
  right: clamp(0.5rem, 2vw, 1.25rem);
}

.lightbox-bar,
.lightbox-nav,
.lightbox-count {
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms ease;
}

.lightbox.controls-on .lightbox-bar,
.lightbox.controls-on .lightbox-nav,
.lightbox.controls-on .lightbox-count {
  opacity: 1;
  pointer-events: auto;
}

.lightbox.closing .lightbox-bar,
.lightbox.closing .lightbox-nav,
.lightbox.closing .lightbox-count {
  opacity: 0;
  pointer-events: none;
  transition-duration: 120ms;
}

@keyframes lb-in-from-right {
  from {
    transform: translateX(100%);
    opacity: 0.2;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes lb-in-from-left {
  from {
    transform: translateX(-100%);
    opacity: 0.2;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes lb-out-to-left {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0.2;
  }
}

@keyframes lb-out-to-right {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0.2;
  }
}

.slide-next-enter {
  animation: lb-in-from-right 320ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
}

.slide-next-leave {
  animation: lb-out-to-left 320ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
}

.slide-prev-enter {
  animation: lb-in-from-left 320ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
}

.slide-prev-leave {
  animation: lb-out-to-right 320ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
}

@media (max-width: 560px) {
  .thumb {
    flex-basis: 86%;
  }

  .lightbox-viewport {
    height: min(70vh, calc(100vh - 6rem));
  }
}
</style>