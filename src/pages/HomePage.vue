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
      <p>
        <a class="inline nostalgic" href="https://old.ehis.gay" target="_blank" rel="noopener">
          Feel nostalgic?
          <svg class="external" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 3h7v7" />
            <path d="M10 14 21 3" />
            <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
          </svg>
        </a>
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

.nostalgic {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.nostalgic .external {
  width: 9px;
  height: 9px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
