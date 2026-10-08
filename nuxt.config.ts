// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

const themeInitScript = `(function(){try{var t=localStorage.getItem('reflow-theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      title: 'Reflow — PDFs, rebuilt as real web pages',
      meta: [
        { name: 'description', content: 'Reflow turns any PDF page into clean, responsive, editable HTML and CSS.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap' },
      ],
      // Runs before paint so the saved/system theme applies without a flash.
      script: [{ innerHTML: themeInitScript, tagPosition: 'head' }],
    },
  },
  routeRules: {
    '/auth': { redirect: '/' },
  },
})
