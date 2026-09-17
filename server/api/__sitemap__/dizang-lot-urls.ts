import { getLotType } from '~~/server/utils/tools/draw-a-lot-data'

export default defineSitemapEventHandler(() => {
  const dizang = getLotType('dizang')
  return Array.from({ length: dizang?.count ?? 0 }, (_, index) => asSitemapUrl({
    loc: `/tools/dizang-lots/${index + 1}`,
    changefreq: 'monthly',
    priority: 0.6,
    _i18nTransform: true,
  }))
})
