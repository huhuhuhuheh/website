<script setup>
import BracketNav from '../components/BracketNav.vue'
import { nav } from '../data/nav'
</script>

<template>
  <section class="page home">
    <h1>Hi!</h1>
    <BracketNav :items="nav" />

    <div class="body">
      <p class="strong">I do stuff, okay? :3</p>
      <p>A LOT, and i still manage <em>almost</em> all of em! <em>mostlys</em></p>
      <p>
        You can also check the
        <a
          class="inline"
          href="https://bsky.app/profile/did:plc:hhi5ppq45rmexzxcld2f2vzx"
          target="_blank"
          rel="noopener"
        >bluesky</a>
        where i also post, i guess
      </p>
    </div>
  </section>
</template>

<style scoped>
.home {
  gap: 1.5rem;
  padding-top: 1rem;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
</style>
