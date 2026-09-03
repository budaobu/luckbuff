import { getLotType } from '~~/server/utils/tools/draw-a-lot-data'

export default defineSitemapEventHandler(() => {
  const guanyin = getLotType('guanyin')
  return Array.from({ length: guanyin?.count ?? 0 }, (_, index) => asSitemapUrl({
    loc: `/tools/guanyin-lots/${index + 1}`,
    changefreq: 'monthly',
    priority: 0.5,
    _i18nTransform: true,
  }))
})
