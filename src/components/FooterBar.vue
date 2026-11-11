<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ErrorCat, setErrorCat } from '../lib/ErrorCat'

const route = useRoute()
const open = ref(false)

const isRoot = computed(() => route.path === '/')

watch(
  () => route.path,
  () => {
    open.value = false
  }
)

function toggleCat() {
  if (!isRoot.value) return
  open.value = !open.value
}

function onToggle(event) {
  setErrorCat(event.target.checked)
}
</script>

<template>
  <footer class="footer">
    <button
      class="cat"
      :class="{ 'is-link': isRoot }"
      type="button"
      aria-label="cat"
      :aria-expanded="open"
      @click="toggleCat"
    >
      🐈
    </button>

    <div v-if="open && isRoot" class="cat-pop">
      <label class="cat-opt">
        <input type="checkbox" :checked="ErrorCat" @change="onToggle" />
        cat :3
      </label>
    </div>

    <span class="links">
      <RouterLink to="/license" class="license">licensed under 0BSD</RouterLink>
      <a
        class="license source"
        href="https://github.com/huhuhuhuheh/website"
        target="_blank"
        rel="noopener"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
          />
        </svg>
        (source)
        <svg class="external" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 3h7v7" />
          <path d="M10 14 21 3" />
          <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
        </svg>
      </a>
    </span>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  line-height: 1;
  color: var(--text-muted);
}

.cat {
  padding: 0;
  border: 0;
  background: none;
  font-size: inherit;
  line-height: 1;
  cursor: default;
}

.cat.is-link {
  cursor: pointer;
  transition: color 140ms ease;
}

.cat.is-link:hover,
.cat.is-link:focus-visible {
  color: var(--pink);
  outline: none;
}

.cat-pop {
  position: absolute;
  bottom: 1.7rem;
  left: 0;
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--border-hi);
  border-radius: 8px;
  background: var(--bg-alt);
}

.cat-opt {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: var(--text);
  cursor: pointer;
}

.cat-opt input {
  accent-color: var(--pink-mid);
  cursor: pointer;
}

.links {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.license {
  font-size: 0.68rem;
  color: var(--text-muted);
  transition: color 140ms ease;
}

.license:hover,
.license:focus-visible {
  color: var(--pink);
  outline: none;
}

.source {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.source svg {
  width: 12px;
  height: 12px;
  flex: 0 0 auto;
}

.source .external {
  width: 9px;
  height: 9px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>