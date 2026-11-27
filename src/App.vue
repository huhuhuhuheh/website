<script setup>
import { RouterView, useRoute } from 'vue-router'
import FooterBar from './components/FooterBar.vue'

const route = useRoute()
</script>

<template>
  <main class="shell" :class="{ 'shell-wide': route.name === 'editor' }">
    <div class="view">
      <RouterView />
    </div>
    <FooterBar />
  </main>
</template>

<style scoped>
.view {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.shell-wide {
  max-width: 1440px;
}
</style>
