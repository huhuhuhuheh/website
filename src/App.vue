<script setup>
import { RouterView } from 'vue-router'
import FooterBar from './components/FooterBar.vue'
</script>

<template>
  <main class="shell">
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
</style>
