import { GAN_WUXING, GAN_YANG, WUXING_SHENG, WUXING_KE, ZHI_CANGGAN } from './constants'

export function getShiShenFull(riGan: string, targetGan: string): string {
  const riWx = GAN_WUXING[riGan]
  const tgWx = GAN_WUXING[targetGan]
  const same = GAN_YANG[riGan] === GAN_YANG[targetGan]
  if (riWx === tgWx) return same ? '比肩' : '劫财'
  if (WUXING_SHENG[riWx] === tgWx) return same ? '食神' : '伤官'
  if (WUXING_KE[riWx] === tgWx) return same ? '偏财' : '正财'
  if (WUXING_SHENG[tgWx] === riWx) return same ? '偏印' : '正印'
  if (WUXING_KE[tgWx] === riWx) return same ? '七杀' : '正官'
  return '未知'
}

// 统计八字中各十神的出现次数（包括天干和藏干）
export function countShiShen(
  riGan: string,
  pillars: Array<{ gan: string; zhi: string } | null>,
): Record<string, number> {
  const counts: Record<string, number> = {}

  for (const pillar of pillars) {
    if (!pillar) continue

    // 天干十神
    if (pillar.gan !== riGan) {
      const ss = getShiShenFull(riGan, pillar.gan)
      counts[ss] = (counts[ss] || 0) + 1
    }

    // 藏干十神
    const canggan = ZHI_CANGGAN[pillar.zhi] || []
    for (const cg of canggan) {
      if (cg.gan !== riGan) {
        const ss = getShiShenFull(riGan, cg.gan)
        counts[ss] = (counts[ss] || 0) + 1
      }
    }
  }

  return counts
}
