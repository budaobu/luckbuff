export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: {
    ja: ['en'],
    ko: ['en'],
    default: ['en'],
  },
}))
