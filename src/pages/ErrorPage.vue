<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ErrorCat } from '../lib/ErrorCat'

const props = defineProps({
  code: { type: Number, default: 404 },
  message: { type: String, default: '' }
})

const route = useRoute()

const CUTE = {
  400: [
    "i didn't understand that one, my brain went mrrp :c",
    'that request was gibberish even to me',
    'my paws typed something wrong, or you did, unclear',
    'error 400: the vibes were not parseable',
    "that wasn't a sentence, that was a sneeze",
    'i stared at your request and it stared back, confused',
    'bad request, please try again with actual words',
    'my brain returned a 404 while reading that',
    'you sent me a puzzle with no picture on the box',
    'i think a cat walked across your keyboard',
    'that data is shaped like spaghetti, i cannot',
    'request denied by the council of confused cats',
    'even my tail is confused by that one',
    'malformed! but i still love you',
    'i tried to read it three times and gave up twice',
    'your packet came in wearing a fake mustache',
    'nope, that syntax made me meow in distress',
    'the vibes arrived but the meaning got lost at sea',
    "that's not valid, that's a haiku gone wrong",
    'i am small and this request is too weird'
  ],
  401: [
    'who even are you? log in first, stranger :3',
    "no id, no entry, them's the rules",
    'you need a little badge to get in here',
    'identify yourself, mysterious one',
    'this door needs a name and a secret handshake',
    'unauthorized! show me your little membership card',
    "i don't know you, and my mother said not to open the door",
    'log in first, then we can be friends',
    'no ticket, no ride, sorry :c',
    'you are a stranger and strangers get 401',
    'i require proof of existence before vibes',
    'the bouncer cat says you are not on the list',
    'authentication? more like au-no-thanks-ication',
    "please log in, i can't read minds (yet)",
    'who goes there? a ghost? ghosts get 401',
    'your key is missing, try the key-shaped hole',
    'you smell like an anonymous user :3',
    'no session, no snack, that is the law',
    'identify or be gently escorted to the login page',
    'i love you but i need to see some credentials first'
  ],
  403: [
    "nuh uh, this one's guarded, not for you (yet)",
    'you shall not pass (politely)',
    'this door says no, i agree with it',
    'not allowed! go on, shoo, but gently',
    'forbidden, but like, in a cute way :3',
    'this page is vip only, and you forgot your invite',
    'i am guarding this with my tiny paws',
    'access denied, please bribe me with treats',
    'the cat is sitting on the page and refuses to move',
    'no peeking! this one is shy',
    'you are not on the guest list, tiny traveler',
    'this one is locked and the key is a secret',
    "i can't let you in, my boss cat said no",
    'forbidden zone, home of the grumpy feline',
    'wrong paws, wrong page, wrong vibe',
    'the velvet rope is up, sadly',
    "it's not you, it's the permissions",
    'denied! but i saved you a seat outside',
    'this area is guarded by a very serious loaf',
    'shoo, but with love :c'
  ],
  404: [
    'this page ran off and i lost it :c',
    'i looked everywhere and found only dust bunnies',
    '404: the page is out, probably chasing a laser pointer',
    'nothing here but me and a tumbleweed',
    "the page wandered into the void, i'll get the net",
    'i checked under the sofa, no page, only crumbs',
    'this url leads to the land of missing things',
    'the page is a ghost, it says boo and vanishes',
    'not found, not lost, just... gone :c',
    'i asked the cat, the cat said it never existed',
    'you took a wrong turn at the last slash',
    'nothing to see here, only a sad little 404',
    'the page moved and forgot to leave a note',
    "i can't find it and i'm very sorry about it",
    'this path ends in a soft void with snacks',
    'empty! like my bowl when nobody feeds me',
    'the content is on vacation, return date unknown',
    'i searched high and low, mostly low',
    'no page, no problem, want to go home?',
    'the link is a lie but the cat is real'
  ],
  405: [
    "that's the wrong door, try knocking another way",
    "you can't do that here, but nice try",
    'wrong verb, wrong method, wrong everything',
    'you knocked with the wrong paw',
    'this door only opens one way and that is not it',
    'method not allowed, please use the polite method',
    'you tried to hug the door with your foot',
    'nope, that action is not on the menu',
    'the page says hi but not like that',
    'wrong move, try the other move',
    'i appreciate the effort, wrong approach though',
    'that method is not in my tiny rulebook',
    'you can knock, you just did it wrong :3',
    'action denied, door stays politely closed',
    'not that way, silly. the other way',
    'you used the forbidden handshake',
    'this endpoint does not accept foot taps',
    'right page, wrong verb, classic',
    'the door read your request and frowned',
    'close! but the method was a lil off'
  ],
  406: [
    "i can't give you that in a shape you'd like, sorry",
    "you asked for it in a language i don't speak",
    "we don't match, format-wise, it's not you, it's the headers",
    'you want json, i only have vibes',
    'not acceptable, but you are acceptable to me :3',
    'your taste in formats is too fancy for me',
    'i offered a cookie and you asked for a croissant',
    'we speak different dialects, sadly',
    'the content is here, just not in your flavor',
    'i can send it, but you said you would not like it',
    'format mismatch, like socks with sandals',
    'you requested it in a font i cannot dream of',
    "i'm a plain cat, you wanted a fancy cat",
    'we both want the same thing in different wrappers',
    'no, that content-type is a bit much',
    'i tried to be what you want and failed cutely',
    'the vibe check failed on the format side',
    'you asked for tea in a coffee cup',
    "i can't shape-shift, only apologize :c",
    'close enough to a match, but not quite'
  ],
  408: [
    'you took too long and i fell asleep waiting zzz',
    'the request timed out, and honestly i was napping',
    'timeout! my patience ran out before your packet did',
    'i waited and waited and then took a nap',
    'you were too slow, so i made tea and forgot',
    'the clock ran out, i blame the cat',
    'took too long, i grew old and retired',
    'zzz... oh, were you still asking? too late',
    'the request got lost on the way, probably distracted',
    'timeout, but in a cozy way',
    'i blinked and the deadline vanished',
    'your packet is late, like a sleepy mailman',
    'waited so long i forgot what we were doing',
    'timed out, please try again with more zoom',
    'i dozed off mid-request, my bad :c',
    'the seconds ran away and took your request',
    'too slow, the snacks got cold',
    'timeout: the cat sat on the clock',
    'i gave up waiting and started stretching',
    'please knock faster next time :3'
  ],
  409: [
    'we both changed the same thing at once, awkward',
    'conflict! you and i wanted different things :c',
    'two paws, one cookie, nobody wins',
    'we edited the same spot and now it is chaos',
    'conflict, like two cats and one sunny spot',
    'you say yes, i say no, the page says help',
    'both of us grabbed the toy at the same time',
    'state mismatch, my brain is scrambled',
    'we disagree and the data is caught in the middle',
    'two versions, one truth, zero agreement',
    'conflict detected, please stop fighting :3',
    'you and the server need couples therapy',
    'same thing, different opinions, big sigh',
    'the page changed while you were typing',
    'clash! like two songs at once',
    'you wanted v1, the page became v2',
    'conflict, i picked a side, it was mine',
    'we stepped on each other, ouch',
    'two requests walked into a bar and fought',
    'merge conflict but make it cute :c'
  ],
  410: [
    'it used to live here, it moved out forever ago',
    'gone gone, no forwarding address',
    "this one's gone for good, sorry little explorer",
    'the page packed its bags and left the internet',
    'gone, like my treats after dinner',
    'it was here, then it was not, now it is never',
    'gone forever, no takebacks',
    'this page retired to a farm upstate',
    'it left without saying goodbye :c',
    'gone, gone, and a little more gone',
    'the content evaporated like morning dew',
    'removed on purpose, not by accident',
    'it exists only in memory now',
    'gone! but the vibes remain',
    'this one is permanently out to lunch',
    'the page has left the building',
    'gone, and it took the good snacks',
    'no resurrection, no returns, just gone',
    'it used to be here and now it is a rumor',
    'forever gone, like a sneeze in the wind'
  ],
  413: [
    "that's too much, you'll make me explode :c",
    "too big!! i'm a small cat, not a warehouse",
    'payload too chonky, please slim it down',
    'that request is a whole buffet, i can only snack',
    'too large, my tiny paws cannot hold it',
    'you sent a whale to a goldfish bowl',
    'that data is thicc and i am but a kitten',
    'payload too big, my inbox said no',
    'you gave me a mountain, i asked for a pebble',
    'too much stuff! i need a bigger cat',
    'that request ate all the memory',
    'big chungus detected, please compress',
    'i can hold a lot, but not that much',
    'payload overweight, please put it on a diet',
    'that is a lot of bytes for one little me',
    'too large, i dropped it and it made a crater',
    'my bowl overflowed, help',
    'request too fat, cannot fit through door',
    'you packed the whole house, i asked for a bag',
    'too big, but i admire the ambition :3'
  ],
  414: [
    'that url is comically long, i gave up reading it',
    'that link is a whole novel, please shorten it',
    'uri too long, my eyes glazed over at character 400',
    'that url walked so long it left the map',
    'i started reading the url and fell asleep',
    'your link is longer than my tail',
    'that url is a marathon, i am a sprinter',
    'too long! the url needs its own zip code',
    'i scrolled your url and lost my place',
    'that link is a scroll, not a url',
    'uri too long, please summarize',
    'your url has a beginning, a middle, and an end',
    'i read your link to my cat, both of us cried',
    'that url is basically a short story',
    'too long to fit in my tiny memory',
    'the url kept going and going and going',
    'i measured it, it is 3 cats long',
    'your link could wrap around the planet',
    'uri too long, please use fewer letters :c',
    'that url is doing too much, honestly'
  ],
  418: [
    'teapot mode engaged, brewing nothing',
    "you can't pour tea from a website, silly",
    'i am a teapot and i refuse to be a coffee maker',
    '418: too short to be a kettle, too stout to be a mug',
    'the teapot has spoken, no coffee today',
    'you asked for coffee, i offer only vibes',
    'i am small and round and full of nothing',
    'teapot reporting for duty, holding zero tea',
    'no espresso, only existential teapot energy',
    'you found the secret teapot page :3',
    'i steep, therefore i am',
    'the teapot says: brew your own coffee',
    'i am a teapot, please respect my boundaries',
    'wrong appliance, right vibes',
    'this page is a teapot and it is very proud',
    'no coffee here, only steam and attitude',
    'i tried to make coffee and became a teapot',
    'teapot, that is the whole message.',
    'short, stout, and out of tea :c'
  ],
  422: [
    'i understood the words but not the meaning mrrp',
    "the data made sense and then it didn't",
    'valid words, invalid vibes',
    'the request is shaped right but reads wrong',
    'i parsed it and got a feeling of confusion',
    'words good, meaning bad, classic',
    'it looks correct and yet it is not',
    'i read it twice and understood it zero times',
    'syntax fine, semantics crying',
    'the request is a sandwich with no filling',
    'everything checks out except the point',
    'i processed it and now i need a nap',
    'valid input, invalid outcome, shrug',
    'the data is legal but the meaning is lost',
    'it is a sentence that forgot its purpose',
    'my brain says no even though the rules say yes',
    'request looks fine, tastes weird',
    'i understood each word and none of the sentence',
    'unprocessable, like a riddle with no answer',
    'the entity is fine, the logic is not :c'
  ],
  429: [
    "slow down!! you're spinning me dizzy :c",
    'too many requests, my brain is overheating',
    "chill for a second, i'm just one little cat",
    'you are clicking so fast the page is dizzy',
    'rate limit! please breathe, then try again',
    'too many requests, i need a snack break',
    'you are a very enthusiastic visitor, too much',
    'slow your paws, i can only go so fast',
    'the server is panting, please wait',
    'you are knocking too many times, the door is tired',
    'too many! i am but one small loaf',
    'cool it, i need to catch my breath',
    'requests raining down like treats, i cannot eat them all',
    'you are speedrunning the website, please stop',
    'rate limit reached, go touch grass (gently)',
    'too fast, my whiskers are vibrating',
    'one at a time please, i have tiny hands',
    'the page is overloaded with your enthusiasm',
    'whoa whoa whoa, calm down :3',
    'too many requests, i am hiding under the bed'
  ],
  451: [
    'the lawyers said this one is a no-no :3',
    "unavailable for legal reasons, don't ask",
    'this page is in witness protection',
    'a lawyer cat is blocking the door',
    '451: the page is wearing tiny handcuffs',
    'the legal department said shh',
    'this content is behind a velvet rope made of laws',
    'the lawyers took this one, sorry',
    'i cannot show you this, a judge said so',
    'redacted by a very serious cat in a suit',
    'legal reasons! fancy way of saying no :c',
    'this page is currently lawyering up',
    'the content is in legal custody',
    'unavailable because the rules say so',
    'a cat with a briefcase said no',
    'this one is sealed by the council of laws',
    'sorry, the page has an alibi and a lawyer',
    'blocked by paperwork, the worst kind of block',
    'the law has entered the chat :3',
    'this page is unavailable and also has a lawyer'
  ],
  500: [
    'something exploded on my end, not your fault this time',
    'i broke something internal, oops :c',
    'a server gremlin ate a wire, working on it',
    '500: i panicked and forgot how to computer',
    'i sneezed and the server fell over',
    'something went pop inside the machine',
    'internal error, i am screaming softly',
    'the server tripped over its own tail',
    'i dropped a byte and the whole thing collapsed',
    'not your fault, i just fell apart :c',
    'a gremlin is loose in the wires again',
    'the machine had a tiny breakdown',
    '500: the server is having a moment',
    'i broke it, i will fix it, i am sorry',
    'something internal went sideways',
    'the server sneezed and everything scattered',
    'my brain made a fizzling sound',
    'internal chaos, please hold',
    'i crashed, but emotionally and also technically',
    'the code tripped and fell into a bucket'
  ],
  501: [
    "i don't know how to do that one yet, learning!",
    'not implemented, my skills are still loading',
    "i can't do that yet, but i believe in me",
    'i have not learned that trick yet :c',
    'that feature is still in my imagination',
    'not implemented, but i took notes',
    'i do not know that one, ask again later',
    'i tried to implement it and got distracted',
    'that ability is not in my skill tree yet',
    'not yet! i am a growing cat',
    'i can do many things, just not that',
    'implementation pending, motivation high',
    'i have not unlocked that power',
    'still learning, please be patient :3',
    'that one is on my to-do list, at the bottom',
    'i have not gotten around to that yet',
    'not implemented, but the vibes are ready',
    'i will learn it, just not today',
    'that feature is still a baby',
    'no clue how to do that, but i will pretend'
  ],
  502: [
    'the server forgot how to speak, awkward',
    'bad gateway, the messenger got lost',
    'someone between us dropped the note',
    'the middle cat did not deliver the message',
    'gateway error, the bridge is out',
    'the message got lost in the mail :c',
    'bad gateway, the relay is confused',
    'i asked another server and it shrugged',
    'the go-between fell asleep on the job',
    '502: the middleman is on a break',
    'the connection coughed and dropped everything',
    'bad gateway, like a broken telephone game',
    'the upstream cat did not answer',
    'the message arrived empty and wet',
    'the bridge between us crumbled',
    'gateway bad, but i am still cute',
    'the other server is ghosting me',
    'bad gateway, the messenger tripped',
    'i waited for a reply and got a shrug',
    'the middle layer is having a crisis'
  ],
  503: [
    "i'm napping, poke me again in a bit zzz",
    "service unavailable, i'm having a snack break",
    'brb, recharging my batteries',
    'the service is out getting coffee',
    'i am temporarily a sleepy potato',
    'unavailable, but only for a little while',
    'the server is stretching, please wait',
    'i stepped away, be right back :c',
    'service is on a tiny vacation',
    'the lights are off, i am resting',
    'temporarily down, emotionally up',
    'i am under maintenance, like a spa day',
    'unavailable! i am licking my paw',
    'the service went to get a snack',
    'i am busy doing nothing, please wait',
    'down for a nap, try again soon',
    'the server is recharging its vibes',
    'brb, existential break',
    'service unavailable, i am a lump',
    'i will be back, do not worry :3'
  ],
  504: [
    'the server thought too hard and timed out',
    'gateway timeout, the upstream is daydreaming',
    'took too long upstream, so i gave up waiting',
    'the other server is thinking very slowly',
    'i asked upstream a question and it zoned out',
    'gateway timed out, the chain got sleepy',
    'the message went out and never came back',
    'upstream took so long i forgot the question',
    'the relay is stuck in traffic',
    'timeout, the far server is napping',
    'i waited upstream and got nothing but zzz',
    'the gateway gave up and went home',
    'upstream is buffering, like a sad video',
    'took too long, i started a new hobby',
    'the answer is out there, just very slow',
    'gateway timeout, the far side is shy',
    'i sent a request and it is still walking',
    'upstream is thinking about its life choices',
    'timeout, the other server fell asleep :c',
    'i waited and waited, then gave up cutely'
  ],
  505: [
    'wrong internet version, i only speak the cool one',
    "http version not supported, you're from the future",
    'old protocol, new cat, mismatch',
    'i speak http, you speak something ancient',
    'that version is from a museum',
    'wrong version, please update your vibes',
    'i do not speak that dialect of internet',
    'your http is too retro for me',
    'that version went out of style years ago',
    'i only accept the trendy http versions',
    'protocol mismatch, like a fax machine at a party',
    'your http is wearing bell bottoms',
    'version not supported, but nice archaeology',
    'i speak the new tongue, you speak the old',
    'that http belongs in a history book',
    'wrong version, please travel forward in time',
    'i cannot parse your vintage internet',
    'that protocol is older than my grandma cat',
    'unsupported version, try the cool new one :3',
    'your http is a fossil, i study living protocols'
  ]
}

const DEFAULT_MSGS = [
  "something went wrong and honestly even i don't know what",
  'an unknown gremlin did an unknown thing :c',
  "error: error, that's all i got",
  'no idea what happened, want a hug instead?',
  'a mystery occurred, i am as confused as you',
  'the vibes broke and nobody knows why',
  'unknown error, the void shrugged',
  'something happened, and it was not good',
  'i have no clue, but i am sorry :c',
  'an error of mysterious origin appeared',
  'the gremlins are at it again',
  'i blanked, completely and totally',
  'that is an error even i cannot explain',
  'mystery error, very mysterious, very error',
  'no idea! but here is a cat to soften it :3',
  'something is off and i am too small to fix it',
  'the server did a weird little dance',
  'an enigma wrapped in a bug',
  'unknown! but you are still welcome here',
  'i tried, it failed, i shrugged :c'
]

const code = computed(() => {
  const q = Number(route.query.code)
  return Number.isInteger(q) && q >= 100 && q <= 599 ? q : props.code
})

const messages = computed(() => {
  if (props.message) return [props.message]
  return CUTE[code.value] || DEFAULT_MSGS
})

const title = computed(() => {
  const list = messages.value
  return list[Math.floor(Math.random() * list.length)]
})

const RL_KEY = 'ehis:rate-limit'
const RL_CHANNEL = 'ehis_rate_limit_jail'
const CAP = 5400
const DEFAULT_RETRY = 30

const jailed = ref(false)
const remaining = ref(0)
let timer = null
let channel = null
let escalatedThisMount = false

function readJail() {
  try {
    return JSON.parse(localStorage.getItem(RL_KEY) || 'null')
  } catch {
    return null
  }
}

function writeJail(jail) {
  try {
    localStorage.setItem(RL_KEY, JSON.stringify(jail))
  } catch {}
}

function clearJail() {
  try {
    localStorage.removeItem(RL_KEY)
  } catch {}
}

function fmt(sec) {
  const s = Math.max(0, Math.floor(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(r).padStart(2, '0')}s`
  if (m > 0) return `${m}m ${String(r).padStart(2, '0')}s`
  return `${r}s`
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startCountdown(until) {
  stopTimer()
  const tick = () => {
    const left = Math.ceil((until - Date.now()) / 1000)
    remaining.value = Math.max(0, left)
    if (left <= 0) {
      stopTimer()
      jailed.value = false
      clearJail()
    }
  }
  tick()
  timer = setInterval(tick, 1000)
}

function saveJail(jail) {
  writeJail(jail)
  jailed.value = true
  startCountdown(jail.until)
  if (channel) channel.postMessage({ type: 'STATE', jail })
}

function escalate(source) {
  const now = Date.now()
  const cur = readJail()
  const prev = source && source.until ? source : cur
  const base = Math.max(1, (prev && prev.wait) || DEFAULT_RETRY)
  const until = (prev && prev.until) || now
  const left = Math.max(1, Math.ceil((until - now) / 1000))
  const next = Math.min(CAP, left + (base * 2 + 30))
  escalatedThisMount = true
  saveJail({
    until: now + next * 1000,
    wait: next,
    strikes: ((prev && prev.strikes) || 1) + 1
  })
}

function initJail() {
  if (code.value !== 429) return
  const now = Date.now()
  const existing = readJail()

  if (existing && existing.until > now) {
    escalate(existing)
  } else {
    const q = parseInt(route.query.retry, 10)
    const wait = Math.min(CAP, Math.max(1, Number.isFinite(q) ? q : DEFAULT_RETRY))
    saveJail({ until: now + wait * 1000, wait, strikes: 1 })
  }

  if (channel) channel.postMessage({ type: 'PING' })
}

function retry() {
  location.reload()
}

function onStorage(e) {
  if (e.key !== RL_KEY) return
  const jail = readJail()
  if (jail && jail.until > Date.now()) {
    jailed.value = true
    startCountdown(jail.until)
  }
}

function onChannel(event) {
  const data = event.data
  if (!data || !data.type) return

  if (data.type === 'PING') {
    const jail = readJail()
    if (jail && jail.until > Date.now() && channel) {
      channel.postMessage({ type: 'PONG', jail })
    }
  } else if (data.type === 'PONG') {
    if (!escalatedThisMount && code.value === 429) escalate(data.jail)
  } else if (data.type === 'STATE' && data.jail) {
    if (data.jail.until > Date.now()) {
      jailed.value = true
      startCountdown(data.jail.until)
    }
  }
}

onMounted(() => {
  try {
    channel = new BroadcastChannel(RL_CHANNEL)
    channel.onmessage = onChannel
  } catch {
    channel = null
  }
  initJail()
  window.addEventListener('storage', onStorage)
})

onBeforeUnmount(() => {
  stopTimer()
  window.removeEventListener('storage', onStorage)
  if (channel) {
    channel.close()
    channel = null
  }
})

watch(
  () => code.value,
  (next, prev) => {
    if (next === 429 && prev !== 429) initJail()
    if (next !== 429) {
      stopTimer()
      jailed.value = false
    }
  }
)
</script>

<template>
  <section class="page err">
    <template v-if="ErrorCat">
      <img class="catpic" :src="`https://http.cat/${code}.jpg`" :alt="`${code} cat`" />
      <span v-if="jailed" class="back jailed">
        [ you can try again in {{ fmt(remaining) }} ]
      </span>
      <template v-else>
        <RouterLink class="back" to="/">[ take me home ]</RouterLink>
        <button v-if="code === 429" class="back retry" type="button" @click="retry">
          [ try again ]
        </button>
      </template>
    </template>
    <template v-else>
      <h1 class="code">{{ code }}</h1>
      <p class="msg">{{ title }}</p>
      <p class="path">
        you asked for <code>{{ route.fullPath }}</code> and i came back empty-pawed :c
      </p>

      <span v-if="jailed" class="back jailed">
        [ you can try again in {{ fmt(remaining) }} ]
      </span>
      <template v-else>
        <RouterLink class="back" to="/">[ take me home ]</RouterLink>
        <button v-if="code === 429" class="back retry" type="button" @click="retry">
          [ try again ]
        </button>
      </template>
    </template>
  </section>
</template>

<style scoped>
.err {
  flex: 1 1 auto;
  align-items: center;
  text-align: center;
  justify-content: center;
  gap: 1rem;
  padding-top: 1rem;
}

.catpic {
  width: min(100%, 30rem);
  border: 1px solid var(--border-hi);
  border-radius: 12px;
  background: var(--bg-alt);
}

.code {
  font-family: var(--font-syne);
  font-size: clamp(4rem, 22vw, 9rem);
  font-weight: 800;
  letter-spacing: -0.06em;
  line-height: 0.8;
  color: var(--pink);
  overflow-wrap: anywhere;
}

.err .msg {
  font-size: 1rem;
  color: var(--text);
  max-width: 46ch;
}

.err .path {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.err .path code {
  font-family: var(--font-mono);
  color: var(--blue);
  word-break: break-all;
}

.back {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  color: var(--text);
  padding: 0.45rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-alt);
  transition: border-color 140ms ease, color 140ms ease, background 140ms ease;
}

.back:hover,
.back:focus-visible {
  border-color: var(--pink-mid);
  color: var(--pink);
  background: #1b171b;
  outline: none;
}

.back.jailed {
  color: var(--text-muted);
  border-style: dashed;
  cursor: default;
  font-variant-numeric: tabular-nums;
}

.back.retry {
  cursor: pointer;
}
</style>