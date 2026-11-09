<script setup>
import { computed, ref } from 'vue'
import BracketNav from '../components/BracketNav.vue'
import { nav } from '../data/nav'

const PAY_API = import.meta.env.VITE_PAY_API || 'https://pay-api.ehis.gay'
const KOFI_USER = import.meta.env.VITE_KOFI_USER || 'whyiexist'
const KOFI_PANEL = `https://ko-fi.com/${KOFI_USER}/?hidefeed=true&widget=true&embed=true&preview=true`
const KOFI_TIERS = `https://ko-fi.com/${KOFI_USER}/tiers`

const services = [
  { value: 'none', label: 'just want to pay', price: null, fixed: false },
  { value: 'justplots', label: 'JustPlots', price: '6.16', fixed: true },
  { value: 'domain', label: 'domains', price: '2.35', fixed: true },
  { value: 'wwfc', label: 'WWFC server', price: '9.48', fixed: true },
  { value: 'breasts', label: 'boobs sync', price: '6.34', fixed: true }
]

const intervals = [
  { value: 'one-time', label: 'one-time' },
  { value: 'month', label: 'monthly' }
]

const service = ref('none')
const amount = ref('5')
const interval = ref('one-time')
const kofiLoaded = ref(false)

const selected = computed(() => services.find((item) => item.value === service.value) || services[0])
const isFixed = computed(() => Boolean(selected.value.fixed))

const cleanAmount = computed(() => {
  const value = Number(amount.value)
  if (!Number.isFinite(value) || value <= 1 || value >= 500) return ''
  return String(Math.round(value * 100) / 100)
})

const warning = computed(() => {
  if (isFixed.value || interval.value === 'month') return null
  const raw = String(amount.value).trim()
  if (!raw) return null
  const value = Number(raw)
  if (!Number.isFinite(value)) return null
  if (value <= 1) return { title: 'Whoa!', text: "That's too tiny! which is, just one euro???" }
  if (value >= 500) {
    return {
      title: 'Whoa!',
      text:
        'Hey buddy DO NOT spend ALL of THIS exact amount on me!!!! (if you have this exact, or have more then that)'
    }
  }
  return null
})

const ctaLabel = computed(() => {
  const value = isFixed.value ? selected.value.price : cleanAmount.value
  return `pay ${value || '…'}€ with paypal ↗`
})

function go() {
  const params = new URLSearchParams({ service: service.value })
  const value = isFixed.value ? selected.value.price : cleanAmount.value
  if (value) params.set('amount', value)
  window.location.href = `${PAY_API}/donate?${params}`
}
</script>

<template>
  <section class="page donate">
    <h1>donate!</h1>
    <div class="nav-center">
      <BracketNav :items="nav" />
    </div>

    <p>
      While i give you the stuff (like boobs sync, Just Plots, WWFC server, etc) with some being on
      free services, nothing can be free forever and it has it's limits!
    </p>
    <p>
      You can be welcome at any time to donate me (if you are not being a jack-ass that is), which
      can allow me to keep it running as long as it goes!
    </p>
    <div class="panel form">
      <div class="field">
        <span class="label">for what type are you donating for: <em>(services)</em></span>
        <div class="pills">
          <button
            v-for="item in services"
            :key="item.value"
            type="button"
            class="pill"
            :class="{ 'is-on': service === item.value }"
            @click="service = item.value"
          >
            {{ item.label }}
            <span v-if="item.price" class="price">{{ item.price }}€</span>
          </button>
        </div>
      </div>

      <div class="controls">
        <div v-if="!isFixed && interval === 'one-time'" class="field">
          <span class="label">amount (€)</span>
          <div class="pills">
            <button
              v-for="preset in ['3', '5', '10']"
              :key="preset"
              type="button"
              class="pill"
              :class="{ 'is-on': amount === preset }"
              @click="amount = preset"
            >
              {{ preset }}€
            </button>
            <input
              v-model.lazy="amount"
              class="control amount"
              type="number"
              min="2"
              max="500"
              step="0.01"
              inputmode="decimal"
              aria-label="amount in euro"
            />
          </div>
        </div>

        <div class="field">
          <span class="label">interval</span>
          <div class="pills">
            <button
              v-for="item in intervals"
              :key="item.value"
              type="button"
              class="pill"
              :class="{ 'is-on': interval === item.value }"
              @click="interval = item.value"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="warning" class="gate">
        <span class="gate-whoa">{{ warning.title }}</span>
        <p class="gate-note">{{ warning.text }}</p>
      </div>

      <template v-else>
        <button v-if="interval === 'one-time'" type="button" class="cta" @click="go">
          {{ ctaLabel }}
        </button>

        <template v-else-if="service === 'none'">
          <p class="hint">ko-fi has its own amount, sorry!</p>

          <div v-if="!kofiLoaded" class="gate">
            <span class="gate-whoa">hi im a widget</span>
            <p class="gate-note">
              if you click on "Load it" it will load ko-fi's page, make sure you are safe!!!
            </p>
            <button type="button" class="cta small" @click="kofiLoaded = true">
              load it
            </button>
          </div>

          <iframe
            v-else
            class="kofi-frame"
            :src="KOFI_PANEL"
            title="Ko-fi tip panel"
            height="712"
            loading="lazy"
          ></iframe>
        </template>

        <a v-else class="cta" :href="KOFI_TIERS" target="_blank" rel="noopener">
          Open it on Ko-Fi's Tiers
        </a>
      </template>

      <template v-if="service === 'justplots'">
        <div class="or"><span>OR</span></div>
        <a
          class="alt-link"
          href="https://plots.ehis.gay/donate"
          target="_blank"
          rel="noopener"
        >
          Donate in the Just Plots website instead
        </a>
      </template>

      <details class="terms">
        <summary>terms for payment</summary>
        <div class="terms-body">
          <p>
            One-time contributions are processed by <strong>PayPal</strong> and handled over to their
            website, so anything you type will be the amount that is sent to PayPal and not held by
            this website
          </p>
          <p>
            Monthly contributions however are processed by <strong>Ko-Fi</strong>, which THEN goes to
            PayPal (sorry that's the way it has to go)
          </p>
          <p>
            This is a voluntary contribution to keep the hosting services i use paid! (nothing is
            owed back to you)
          </p>
          <p>
            By contributing you agree to PayPal's
            <a href="https://www.paypal.com/legalhub/useragreement-full" target="_blank" rel="noopener">
              terms
            </a>
            and
            <a href="https://www.paypal.com/legalhub/privacy-full" target="_blank" rel="noopener">
              privacy policy
            </a>
            for one-time and Ko-fi's
            <a href="https://more.ko-fi.com/terms" target="_blank" rel="noopener">Terms</a>
            and
            <a href="https://more.ko-fi.com/privacy" target="_blank" rel="noopener">Privacy Policy</a>
            for monthly
          </p>
        </div>
      </details>
    </div>
  </section>
</template>

<style scoped>
.donate {
  align-items: center;
  text-align: center;
}

.donate h1 {
  align-self: flex-start;
  text-align: left;
}

.nav-center {
  display: flex;
  justify-content: flex-start;
  align-self: stretch;
  width: 100%;
}

.donate .panel {
  width: min(100%, 620px);
}

.form {
  gap: 1rem;
  align-items: center;
}

.field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
}

.label {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  color: var(--text-dim);
}

.label em {
  font-style: italic;
  color: var(--text-muted);
}

.pills {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  cursor: pointer;
  transition: border-color 140ms ease, color 140ms ease, background 140ms ease;
}

.pill:hover {
  border-color: var(--border-hi);
  color: var(--text);
}

.pill.is-on {
  border-color: var(--pink-mid);
  color: var(--pink);
  background: #1b171b;
}

.price {
  font-size: 0.62rem;
  color: var(--text-muted);
}

.pill.is-on .price {
  color: var(--pink-mid);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.25rem;
}

.control {
  appearance: none;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-align: center;
  outline: none;
  transition: border-color 140ms ease;
}

.control:focus {
  border-color: var(--border-hi);
}

.amount {
  width: 76px;
}

.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--pink-mid);
  border-radius: 10px;
  background: #1b171b;
  color: var(--pink);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.02em;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 140ms ease, color 140ms ease, background 140ms ease;
}

.cta:hover {
  border-color: var(--pink);
  color: var(--text);
  background: #211a21;
}

.hint {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--text-muted);
}

.kofi-frame {
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #0d0d0d;
  filter: invert(0.93) hue-rotate(180deg) saturate(1.12) contrast(0.95);
}

.cta.small {
  width: auto;
  padding: 0.55rem 1.4rem;
  font-size: 0.74rem;
}

.gate {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  border: 1px dashed var(--border);
  border-radius: 12px;
  background: var(--bg);
  padding: 1rem;
}

.gate-whoa {
  font-family: var(--font-mono);
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--pink);
}

.gate-note {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  line-height: 1.7;
  color: var(--text-muted);
  max-width: 44ch;
}

.or {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  margin: 0.4rem 0;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  letter-spacing: 0.4em;
  user-select: none;
}

.or span {
  flex-shrink: 0;
}

.or::before,
.or::after {
  content: "";
  flex: 1;
  height: 2px;
  background: var(--border-hi);
}

.alt-link {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text);
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  transition: border-color 140ms ease, color 140ms ease;
}

.alt-link:hover {
  border-color: var(--pink-mid);
  color: var(--pink);
}

.terms {
  width: 100%;
  border-top: 1px solid var(--border);
  padding-top: 0.9rem;
  text-align: left;
}

.terms summary {
  cursor: pointer;
  list-style: none;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-dim);
  transition: color 140ms ease;
}

.terms summary::-webkit-details-marker {
  display: none;
}

.terms summary::before {
  content: "+ ";
  color: var(--pink-mid);
}

.terms[open] summary::before {
  content: "- ";
}

.terms summary:hover {
  color: var(--text);
}

.terms-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.7rem;
}

.terms-body p {
  font-size: 0.7rem;
  line-height: 1.75;
  color: var(--text-dim);
  max-width: 66ch;
}

.terms-body a {
  color: var(--blue);
  border-bottom: 1px solid transparent;
}

.terms-body a:hover {
  color: var(--pink);
  border-bottom-color: color-mix(in srgb, var(--pink) 45%, transparent);
}

.terms-body strong {
  color: var(--text);
  font-weight: 500;
}
</style>