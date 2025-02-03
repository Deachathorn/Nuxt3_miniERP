// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
      src: '~/plugins/Vuelidate'
    },
  },

  modules: ['@vesp/nuxt-fontawesome'],
  fontawesome: {
    icons: {
      solid: [
        'house',
        'file-lines',
        'plus',
        'times',
        'check',
        'pencil',
        'trash',
        'sign-out',
        'user',
        'users',
        'box',
        'cogs',
        'receipt',
        'dollar-sign',
        'map',
        'chart-line',
        'list',
        'arrow-circle-down',
        'history',
        'save',
        'times',
        'paperclip',
        'clock',
        'search',
        'magnifying-glass'
      ],
      regular: [
        'folder-open'
      ],
      brands: []
    }
  }
})