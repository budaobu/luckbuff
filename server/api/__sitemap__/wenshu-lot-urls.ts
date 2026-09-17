import { getLotType } from '~~/server/utils/tools/draw-a-lot-data'

export default defineSitemapEventHandler(() => {
  const wenshu = getLotType('wenshu')
  return Array.from({ length: wenshu?.count ?? 0 }, (_, index) => asSitemapUrl({
    loc: `/tools/wenshu-lots/${index + 1}`,
    changefreq: 'monthly',
    priority: 0.6,
    _i18nTransform: true,
  }))
})
