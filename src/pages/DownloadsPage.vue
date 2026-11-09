<script setup>
import BracketNav from '../components/BracketNav.vue'
import { nav } from '../data/nav'
</script>

<template>
  <section class="page">
    <h1>downloads</h1>
    <BracketNav :items="nav" />

    <p>downloads for anything</p>

    <div class="panel">
      <h2>cursors</h2>
      <ul>
        <li>
          <a href="/src/dl/desk-background-static.zip" download>Desktop Backgrounds</a>
          (zip)
        </li>
        <li>
          <a href="/src/dl/ellen-joe-chibi_42f2478565_VSTHEMES-ORG.zip" download>Ellen Joe Cursors</a>
          (VSTHEMES.org ·
          <a
            href="https://file.garden/aIdRcBfH0QVghCz6/ellen-joe-chibi_42f2478565_VSTHEMES-ORG.zip"
            target="_blank"
            rel="noopener"
          >alt link</a>)
        </li>
        <li>
          <a href="/src/dl/kasane-teto_1fb053ee6a_VSTHEMES-ORG.zip" download>Kasane Teto Alt Cursors</a>
          (VSTHEMES.org ·
          <a
            href="https://file.garden/aIdRcBfH0QVghCz6/kasane-teto_1fb053ee6a_VSTHEMES-ORG.zip"
            target="_blank"
            rel="noopener"
          >alt link</a>)
        </li>
      </ul>
    </div>

    <div class="panel">
      <h2>minecraft related</h2>

      <h3>Survival 1.21.5 Server</h3>
      <ul>
        <li>
          <a href="/src/dl/minecraft/server/1.21.5-java/Server%20Pack%201.21.5.mrpack" download>Modpack</a>
          based off
          <a
            href="https://modrinth.com/modpack/fabulously-optimized/version/9.0.0"
            target="_blank"
            rel="noopener"
          >Fabulously Optimized 9.0.0</a>
        </li>
        <li>
          <a
            href="/src/dl/minecraft/server/1.21.5-java/packs/dic-nov-2025/december_1st_upd.zip"
            download
          >Nov / Dic 2025 Resource Pack</a>
          (<a
            href="https://file.garden/aIdRcBfH0QVghCz6/packs_server/dic-nov-2025/december_1st_upd.zip"
            target="_blank"
            rel="noopener"
          >alt link</a>)
        </li>
      </ul>
    </div>
  </section>
</template>
