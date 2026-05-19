import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const requireFromHere = createRequire(import.meta.url)
const piniaPkgPath = requireFromHere.resolve('pinia/package.json')
const piniaEsmPath = join(dirname(piniaPkgPath), 'dist/pinia.mjs')

export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  srcDir: 'app',
  serverDir: 'server',

  modules: [
    '@nuxt/ui',
    'nuxt-security',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n',
  ],

  i18n: {
    locales: [
      { code: 'zh-CN', name: '简体中文', file: 'zh-CN.json' },
      { code: 'zh-TW', name: '繁體中文', file: 'zh-TW.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'zh-CN',
    lazy: true,
    bundle: {
      commonJs: false,
    },
  },

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

  alias: {
    pinia: piniaEsmPath,
  },

  vite: {
    optimizeDeps: {
      include: ['nanoid'],
    },
    resolve: {
      alias: {
        pinia: piniaEsmPath,
      },
    },
  },

  icon: {
    serverBundle: 'remote',
  },

  runtimeConfig: {
    aiBaseUrl: 'https://api.gptniux.com/v1/chat/completions',
    aiApiKey: '',
    aiModel: 'gpt-5',
    aiMaxTokens: 8192,
    aiProvider: 'newapi',
    public: {
      siteUrl: '',
      googleSiteVerification: '',
      baiduAnalyticsId: '',
    },
  },
})