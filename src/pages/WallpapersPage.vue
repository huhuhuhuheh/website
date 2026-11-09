<script setup>
import BracketNav from '../components/BracketNav.vue'
import { nav } from '../data/nav'

const cursors = [
  {
    label: 'Kasane Teto',
    href: 'https://www.rw-designer.com/cursor-set/kasane-teto',
    note: 'cursor set'
  },
  {
    label: 'Kasane Teto (alt)',
    href: 'https://file.garden/aIdRcBfH0QVghCz6/kasane-teto_1fb053ee6a_VSTHEMES-ORG.zip',
    note: 'zip'
  },
  {
    label: 'F2U Pink Paw',
    href: 'https://vsthemes.org/en/cursors/cartoons/69608-f2u-pink-paw.html',
    note: 'cursor set'
  },
  {
    label: 'Ellen Joe',
    href: 'https://file.garden/aIdRcBfH0QVghCz6/ellen-joe-chibi_42f2478565_VSTHEMES-ORG.zip',
    note: 'zip'
  },
  {
    label: 'Hoshimi Miyabi',
    href: 'https://vsthemes.org/en/cursors/anime/70655-miyabi-zzz.html',
    note: 'cursor set'
  }
]

const wallpapers = [
  { src: '/src/img/desk-backgro/desk-general.png', alt: 'desk general' },
  {
    src: '/src/img/desk-backgro/kaai-yuki-nukunuku-nigirimeshi-inabakumori-utau-vocaloid-hd-wallpaper-68566da840d0ec68b07c31ee48d2140a.jpg',
    alt: 'kaai yuki / inabakumori'
  },
  {
    src: '/src/img/desk-backgro/nukunuku-nigirimeshi-inabakumori-simple-background-artwork-cover-art-hd-wallpaper-68968d8880502c78905ca19e0852146a.jpg',
    alt: 'nukunuku nigirimeshi / inabakumori'
  },
  {
    src: '/src/img/desk-backgro/anime-girls-last-tour-chito-girls-last-tour-yuuri-girls-last-tour-wallpaper-bb457eefd53aae7693f2bd4cf88969f1.jpg',
    alt: 'girls last tour'
  },
  {
    src: '/src/img/desk-backgro/shoujo-shuumatsu-ryokou-chito-shoujo-shuumatsu-ryokou-yuuri-shoujo-shuumatsu-ryokou-post-apocalypse-anime-girls-hd-wallpaper-a1efcb74aa45fdf3576a6caa6e3c9678.jpg',
    alt: 'shoujo shuumatsu ryokou'
  },
  { src: '/src/img/desk-backgro/gtl.jpg', alt: 'gtl' },
  { src: '/src/img/desk-backgro/Kasane Teto Window XP.jpg', alt: 'kasane teto on windows xp' },
  { src: '/src/img/desk-backgro/idk what to write here lol.jpg', alt: 'idk what to write here lol' },
  {
    src: '/src/img/desk-backgro/wp11696085-bocchi-the-rock-wallpapers(1).png',
    alt: 'bocchi the rock'
  }
]

const engine = [
  {
    title: 'Inabakumori Relayouter',
    href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3148204491',
    img: '/src/img/desk-backgro/wallpaper-engine/Inabakumori-Relayouter.png'
  },
  {
    title: 'Honkai: Star Rail Castorice (The Eternal Ferry of the Styx)',
    href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3445534475',
    img: '/src/img/desk-backgro/wallpaper-engine/hsr-castroice-eternalferry.png'
  },
  {
    title: 'Zenless Zone Zero TV',
    href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3333357727',
    img: '/src/img/desk-backgro/wallpaper-engine/zzz-tv.png'
  },
  {
    title: "Girls' Last Tour",
    href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=1648125348',
    img: '/src/img/desk-backgro/wallpaper-engine/gtl.png'
  }
]
</script>

<template>
  <section class="page">
    <h1>wallpapers &amp; others</h1>
    <BracketNav :items="nav" />

    <p>yes i share wallpapers!</p>

    <div class="panel">
      <h2>cursors</h2>
      <ul>
        <li v-for="cursor in cursors" :key="cursor.label">
          <a :href="cursor.href" target="_blank" rel="noopener">{{ cursor.label }}</a>
          <span class="tag">{{ cursor.note }}</span>
        </li>
      </ul>
    </div>

    <div class="panel">
      <h2>wallpapers</h2>
      <p class="notes">
        those are free to use
        (<a class="inline" href="/src/dl/desk-background-static.zip" download>grab all</a>)
      </p>
      <div class="gallery">
        <a
          v-for="shot in wallpapers"
          :key="shot.src"
          :href="shot.src"
          target="_blank"
          rel="noopener"
        >
          <img :src="shot.src" :alt="shot.alt" loading="lazy" />
        </a>
      </div>
    </div>

    <div class="panel">
      <h2>wallpaper engine</h2>
      <div class="tiles">
        <a
          v-for="w in engine"
          :key="w.href"
          class="tile"
          :href="w.href"
          target="_blank"
          rel="noopener"
        >
          <span class="cap">{{ w.title }}</span>
          <span class="shot">
            <img :src="w.img" :alt="w.title" loading="lazy" />
          </span>
        </a>
      </div>
    </div>
  </section>
</template>
