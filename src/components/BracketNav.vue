<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  items: { type: Array, required: true }
})
</script>

<template>
  <nav class="nav" aria-label="pages">
    <template v-for="item in items" :key="item.label">
      <RouterLink
        v-if="item.to"
        :to="item.to"
        class="item"
        exact-active-class="is-active"
      >
        <span class="br">[</span>{{ item.label }}<span class="br">]</span>
      </RouterLink>
      <a
        v-else
        :href="item.href"
        class="item"
        :target="item.href.startsWith('http') ? '_blank' : undefined"
        :rel="item.href.startsWith('http') ? 'noopener' : undefined"
      >
        <span class="br">[</span>{{ item.label }}<span class="br">]</span>
      </a>
    </template>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
  margin-top: 0.5rem;
}

.item {
  padding: 0.3rem 0.35rem;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.76rem;
  color: var(--text);
  transition: color 140ms ease, background 140ms ease;
}

.br {
  color: var(--pink-mid);
}

.item:hover,
.item:focus-visible,
.item.is-active {
  background: var(--bg-alt);
  color: var(--pink);
  outline: none;
}

.item:hover .br,
.item.is-active .br {
  color: var(--pink);
}
</style>
