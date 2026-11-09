<script setup>
import { RouterLink } from 'vue-router'
import BracketNav from '../components/BracketNav.vue'
import { nav } from '../data/nav'
</script>

<template>
  <section class="page">
    <h1>stuff</h1>
    <BracketNav :items="nav" />

    <p>thing(s) i have that i use, or i have built!!1!11!</p>

    <div class="panel">
      <h2>things i like built</h2>
      <ul>
        <li>
          <a href="https://clipboard.ehis.gay" target="_blank" rel="noopener">Eh's clipboard</a>
          (<a href="https://github.com/huhuhuhuheh/ehclipboard" target="_blank" rel="noopener">on github</a>)
          my very stupid creation that alerts what got copied to the clipboard for some reason
          (also at winget!!)
        </li>
      </ul>
    </div>

    <div class="panel">
      <h2>revolt part</h2>
      <p>Usually because of like the reband that's going on rn after some legal part.</p>
      <ul>
        <li>
          <a
            href="https://codeberg.org/huhuhuhuh/revolt-tampermonkey-js/raw/branch/main/wheresther.user.js"
            target="_blank"
            rel="noopener"
          >Wheres The R?</a>
          — usually changes the logo from the new "purple" one
          (<a href="/stuff/logo_round_rev.png" target="_blank" rel="noopener">reference</a>)
          back to where it was (also changing some parts from Stoat to Revolt) (for the revite client)
        </li>
        <li>
          <a
            href="https://codeberg.org/huhuhuhuh/revolt-tampermonkey-js/raw/branch/main/stoatnomore.user.js"
            target="_blank"
            rel="noopener"
          >Stoat No More</a>
          — changes Stoat parts on the Stoat client to revolt (to be used for the "Stoat" client)
        </li>
        <li>
          <a
            href="https://codeberg.org/huhuhuhuh/revolt-tampermonkey-js/raw/branch/main/meow.user.js"
            target="_blank"
            rel="noopener"
          >meow</a>
          — i get it, you hate the name and the domain
        </li>
      </ul>
    </div>

    <div class="panel">
      <h2>browsers!!!!</h2>
      <p>Favicon Stealer, this steals website favicons (it is very stupid)</p>
      <p class="notes">
        Note: it may not be accurate on stealing. sometimes it does fetch but may be the wrong
        icon, sometimes it fails to fetch, or sometimes it does fetch correctly
      </p>
      <div class="badges">
        <a href="https://addons.mozilla.org/firefox/addon/favicon-stealer/" target="_blank" rel="noopener">
          <img src="/src/img/addon/get-firefox.png" alt="Get the add-on for Firefox" />
        </a>
        <a href="https://chromewebstore.google.com/detail/favicon-stealer/dhcbgcdhphjljfkpdkojcgammmjfgahc" target="_blank" rel="noopener">
          <img src="/src/img/addon/get-chrome.png" alt="Available in the Chrome Web Store" />
        </a>
        <a href="https://microsoftedge.microsoft.com/addons/detail/lgebhmgmbjcacelajfneogohcelhcnhn" target="_blank" rel="noopener">
          <img src="/src/img/addon/get-edge.png" alt="Get it from Microsoft Edge" />
        </a>
      </div>

      <h3>
        <RouterLink to="/ehnewtab">Eh's New Tab</RouterLink>
      </h3>
      <p>Just a New Tab experience, simple, and nothing else</p>
      <div class="badges">
        <a href="https://addons.mozilla.org/addon/ehnewtab/" target="_blank" rel="noopener">
          <img src="/src/img/addon/get-firefox.png" alt="Get the add-on for Firefox" />
        </a>
        <a href="https://chrome.google.com/webstore/detail/bbbhgkjjohfoaefdaljchaoagaegjbpa" target="_blank" rel="noopener">
          <img src="/src/img/addon/get-chrome.png" alt="Available in the Chrome Web Store" />
        </a>
      </div>

      <h3>Stoat... or Revolt?</h3>
      <p>Brings patches to Stoat/Revolt's clients, make it better, not better, whatever u wanted</p>
      <div class="badges">
        <a href="https://addons.mozilla.org/firefox/addon/stoat-or-revolt/" target="_blank" rel="noopener">
          <img src="/src/img/addon/get-firefox.png" alt="Get the add-on for Firefox" />
        </a>
        <a href="https://chromewebstore.google.com/detail/stoat-or-revolt/nffondeekhcdmajhhiopkollipjndkhb" target="_blank" rel="noopener">
          <img src="/src/img/addon/get-chrome.png" alt="Available in the Chrome Web Store" />
        </a>
        <a href="https://microsoftedge.microsoft.com/addons/detail/stoat-or-revolt/kokebocfdicjablnnhdefgapncjnoipl" target="_blank" rel="noopener">
          <img src="/src/img/addon/get-edge.png" alt="Get it from Microsoft Edge" />
        </a>
      </div>
    </div>

    <div class="panel">
      <h2>themes!!!!</h2>
      <p>Oh yeah i managed to do themes</p>

      <h3>Eh's main website</h3>
      <p>Colors from the main website</p>
      <div class="badges">
        <a href="https://addons.mozilla.org/en-US/firefox/addon/ehwebsitetheme/" target="_blank" rel="noopener">
          <img src="/src/img/addon/get-firefox.png" alt="Get the theme for Firefox" />
        </a>
        <a href="https://chromewebstore.google.com/detail/ehs-website-theme/apffdnnmmdjknobobebciaelebbhnhba" target="_blank" rel="noopener">
          <img src="/src/img/addon/get-chrome.png" alt="Available in the Chrome Web Store" />
        </a>
      </div>

      <h3>Eh's clipboard</h3>
      <p>
        Oh yeah i also have themes from my little program's website on my cool domain on
        clipboard.ehis.gay
      </p>
      <div class="badges">
        <a href="https://addons.mozilla.org/en-US/firefox/addon/ehclipboardtheme/" target="_blank" rel="noopener">
          <img src="/src/img/addon/get-firefox.png" alt="Get the theme for Firefox" />
        </a>
        <a href="https://chromewebstore.google.com/detail/ehs-clipboard-theme/djjhfonmogfndfebmacbfndnjmelbpfc" target="_blank" rel="noopener">
          <img src="/src/img/addon/get-chrome.png" alt="Available in the Chrome Web Store" />
        </a>
      </div>

      <h3>Eh's web themes</h3>
      <p>
        Brings any theme about my website palletes to Visual Studio Code/OpenVSX, IntelliJ IDEA and
        Zed for some reason
      </p>
      <ul>
        <li>
          <a href="https://marketplace.visualstudio.com/items?itemName=gayeh.EhWebThemes" target="_blank" rel="noopener">Visual Studio Code</a>
          (<a href="https://github.com/ehshit/EhWebThemesVSCode" target="_blank" rel="noopener">source</a>)
        </li>
        <li>
          <a href="https://open-vsx.org/extension/gayeh/EhWebThemes" target="_blank" rel="noopener">OpenVSX</a>
          (<a href="https://github.com/ehshit/EhWebThemesVSCode" target="_blank" rel="noopener">source</a>)
        </li>
        <li>
          <a href="https://plugins.jetbrains.com/plugin/33338-eh-s-web-themes" target="_blank" rel="noopener">IntelliJ IDEA</a>
          (<a href="https://github.com/ehshit/EhWebThemesIDEA" target="_blank" rel="noopener">source</a>)
        </li>
        <li>
          <a href="https://zed.dev/extensions/eh-web-themes" target="_blank" rel="noopener">Zed</a>
          (<a href="https://github.com/ehshit/EhWebThemesZed" target="_blank" rel="noopener">source</a>)
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.panel h3 a {
  color: var(--blue);
  border-bottom: 1px solid transparent;
  transition: border-color 140ms ease, color 140ms ease;
}

.panel h3 a:hover {
  color: var(--pink);
  border-bottom-color: color-mix(in srgb, var(--pink) 45%, transparent);
}
</style>
