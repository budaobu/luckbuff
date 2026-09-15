import { getLotType } from '~~/server/utils/tools/draw-a-lot-data'

export default defineSitemapEventHandler(() => {
  const guandi = getLotType('guandi')
  return Array.from({ length: guandi?.count ?? 0 }, (_, index) => asSitemapUrl({
    loc: `/tools/guandi-lots/${index + 1}`,
    changefreq: 'monthly',
    priority: 0.6,
    _i18nTransform: true,
  }))
})
