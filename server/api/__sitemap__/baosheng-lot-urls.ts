import { getLotType } from '~~/server/utils/tools/draw-a-lot-data'

export default defineSitemapEventHandler(() => {
  const baosheng = getLotType('baoshengdadi')
  return Array.from({ length: baosheng?.count ?? 0 }, (_, index) => asSitemapUrl({
    loc: `/tools/baosheng-lots/${index + 1}`,
    changefreq: 'monthly',
    priority: 0.6,
    _i18nTransform: true,
  }))
})
