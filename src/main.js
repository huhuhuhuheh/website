import { createApp } from 'vue'
import '@fontsource/syne/latin-400.css'
import '@fontsource/syne/latin-600.css'
import '@fontsource/syne/latin-800.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import '@fontsource/jetbrains-mono/latin-700.css'
import App from './App.vue'
import { router } from './router'
import './style.css'

createApp(App).use(router).mount('#app')
