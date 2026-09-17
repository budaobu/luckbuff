import { getLotType } from '~~/server/utils/tools/draw-a-lot-data'

export default defineSitemapEventHandler(() => {
  const tudigong = getLotType('tudigong')
  return Array.from({ length: tudigong?.count ?? 0 }, (_, index) => asSitemapUrl({
    loc: `/tools/tudigong-lots/${index + 1}`,
    changefreq: 'monthly',
    priority: 0.6,
    _i18nTransform: true,
  }))
})
