export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  srcDir: 'app',
  serverDir: 'server',

  modules: [
    '@nuxt/ui',
    'nuxt-security',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  security: {
    headers: {
      contentSecurityPolicy: {
        'upgrade-insecure-requests': process.env.NODE_ENV === 'production',
      },
    },
    csrf: false,
    xssValidator: false,
  },

  icon: {
    serverBundle: {
      collections: ['heroicons'],
    },
  },

  runtimeConfig: {
    aiBaseUrl: 'https://api.gptniux.com/v1/chat/completions',
    aiApiKey: '',
    aiModel: 'gpt-5',
    aiMaxTokens: 8192,
    aiProvider: 'newapi',
    public: {
      siteUrl: '',
    },
  },
})
