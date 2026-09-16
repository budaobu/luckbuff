import { getLotType } from '~~/server/utils/tools/draw-a-lot-data'

export default defineSitemapEventHandler(() => {
  const wongTaiSin = getLotType('wong-tai-sin')
  return Array.from({ length: wongTaiSin?.count ?? 0 }, (_, index) => asSitemapUrl({
    loc: `/tools/wong-tai-sin-lots/${index + 1}`,
    changefreq: 'monthly',
    priority: 0.6,
    _i18nTransform: true,
  }))
})
