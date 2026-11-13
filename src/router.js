import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import StuffPage from './pages/StuffPage.vue'
import WallpapersPage from './pages/WallpapersPage.vue'
import DownloadsPage from './pages/DownloadsPage.vue'
import DonatePage from './pages/DonatePage.vue'
import EhNewTabPage from './pages/EhNewTabPage.vue'
import ErrorPage from './pages/ErrorPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/stuff', name: 'stuff', component: StuffPage },
    { path: '/wallpapers', name: 'wallpapers', component: WallpapersPage },
    { path: '/downloads', name: 'downloads', component: DownloadsPage },
    { path: '/donate', name: 'donate', component: DonatePage },
    { path: '/ehnewtab', name: 'ehnewtab', component: EhNewTabPage },
    { path: '/license', name: 'license', component: () => import('./pages/LicensePage.vue') },
    { path: '/terms', name: 'terms', component: () => import('./pages/TermsPage.vue') },
    {
      path: '/legal/api/tos',
      name: 'legal-api-tos',
      component: () => import('./pages/LegalDocPage.vue'),
      meta: { doc: 'api-tos' }
    },
    {
      path: '/legal/api/privacy',
      name: 'legal-api-privacy',
      component: () => import('./pages/LegalDocPage.vue'),
      meta: { doc: 'api-privacy' }
    },
    { path: '/:pathMatch(.*)*', name: 'error', component: ErrorPage, props: { code: 404 } }
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  }
})