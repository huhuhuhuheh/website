<script setup>
import { RouterLink } from 'vue-router'
import BracketNav from '../components/BracketNav.vue'
import { nav } from '../data/nav'
import { legalServices } from '../data/legal'

function isExternal(link) {
  return typeof link.href === 'string' && link.href.startsWith('http')
}
</script>

<template>
  <section class="page">
    <h1>terms</h1>
    <BracketNav :items="nav" />

    <div class="panel">
      <p>
        I have services, those can have its Terms of Service &amp; Privacy Policies because of
        legal shaneningans, you can click on any to view them
      </p>

      <ul class="services">
        <li v-for="service in legalServices" :key="service.name">
          <span class="service-name">{{ service.name }}:</span>

          <a
            v-if="isExternal(service.terms)"
            class="legal-link"
            :href="service.terms.href"
            target="_blank"
            rel="noopener"
          >
            {{ service.terms.label }}
            <svg class="external" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 3h7v7" />
              <path d="M10 14 21 3" />
              <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
            </svg>
          </a>
          <RouterLink v-else class="legal-link" :to="service.terms.to">
            {{ service.terms.label }}
          </RouterLink>

          <span class="sep">/</span>

          <a
            v-if="isExternal(service.privacy)"
            class="legal-link"
            :href="service.privacy.href"
            target="_blank"
            rel="noopener"
          >
            {{ service.privacy.label }}
            <svg class="external" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 3h7v7" />
              <path d="M10 14 21 3" />
              <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
            </svg>
          </a>
          <RouterLink v-else class="legal-link" :to="service.privacy.to">
            {{ service.privacy.label }}
          </RouterLink>
        </li>
      </ul>
    </div>

  </section>
</template>

<style scoped>
.services {
  display: grid;
  gap: 0.45rem;
  margin-top: 0.2rem;
}

.services li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.3rem;
}

.service-name {
  color: var(--text-dim);
}

.legal-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.sep {
  color: var(--text-muted);
}

.external {
  width: 9px;
  height: 9px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>