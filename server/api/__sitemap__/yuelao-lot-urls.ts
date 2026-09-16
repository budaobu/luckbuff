import { yuelaoLotCount } from '~~/server/utils/tools/yuelao-lot-data'

export default defineSitemapEventHandler(() => {
  return Array.from({ length: yuelaoLotCount }, (_, index) => asSitemapUrl({
    loc: `/tools/yuelao-lots/${index + 1}`,
    changefreq: 'monthly',
    priority: 0.6,
    _i18nTransform: true,
  }))
})
