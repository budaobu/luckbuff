/**
 * 风水摆件规则库（独立配置，不写死在业务逻辑里）
 *
 * 五行判定类型 → 候选物件池映射表。
 * 设计文档第 8 节明确：该映射表由实现阶段一并产出，做成独立配置文件，
 * 便于后续调整物件池时不动代码逻辑。
 *
 * 物件池注入 reading.post.ts 的 AI prompt，AI 只能在池内挑选；
 * 用途标签（usageTags）供 AI 按房间类型/逐人诉求挑选。
 */

export type ElementGap =
  | 'metal_drain'
  | 'water_boost'
  | 'wood_boost'
  | 'fire_boost'
  | 'earth_boost'
  | 'avoid_only'
  | 'neutral'

export interface OrnamentRuleItem {
  /** 物件中文名（注入 AI prompt 用） */
  label: string
  /** 该物件适合的用途场景，供 AI 结合房间类型/逐人诉求挑选 */
  usageTags: Array<'general' | 'wealth' | 'study' | 'health' | 'harmony' | 'career' | 'romance'>
}

export interface OrnamentRule {
  gap: ElementGap
  /** 判定逻辑一句话依据（喂给 AI「为什么」区，i18n key: ornamentRules.rationale.<gap>） */
  rationaleKey: string
  items: OrnamentRuleItem[]
}

export const ORNAMENT_RULES: Record<Exclude<ElementGap, 'neutral'>, OrnamentRule> = {
  metal_drain: {
    gap: 'metal_drain',
    rationaleKey: 'metalDrain',
    items: [
      { label: '铜铃铛', usageTags: ['general', 'health'] },
      { label: '金属风铃', usageTags: ['general', 'harmony'] },
      { label: '白水晶簇', usageTags: ['general', 'study', 'career'] },
      { label: '铜钱剑挂饰', usageTags: ['wealth', 'general'] },
      { label: '铜葫芦', usageTags: ['health', 'general'] },
      { label: '金属摆台', usageTags: ['career', 'general'] },
    ],
  },
  water_boost: {
    gap: 'water_boost',
    rationaleKey: 'waterBoost',
    items: [
      { label: '小型鱼缸', usageTags: ['wealth', 'general'] },
      { label: '流水摆件', usageTags: ['wealth', 'career'] },
      { label: '黑曜石球', usageTags: ['general', 'career'] },
      { label: '海蓝宝摆件', usageTags: ['career', 'general'] },
      { label: '深色玻璃花瓶', usageTags: ['general', 'harmony'] },
    ],
  },
  wood_boost: {
    gap: 'wood_boost',
    rationaleKey: 'woodBoost',
    items: [
      { label: '绿萝盆栽', usageTags: ['general', 'harmony'] },
      { label: '富贵竹', usageTags: ['wealth', 'general'] },
      { label: '文竹', usageTags: ['study', 'career'] },
      { label: '发财树', usageTags: ['wealth', 'career'] },
      { label: '绿幽灵水晶', usageTags: ['study', 'health'] },
      { label: '文昌塔', usageTags: ['study', 'career'] },
    ],
  },
  fire_boost: {
    gap: 'fire_boost',
    rationaleKey: 'fireBoost',
    items: [
      { label: '紫水晶洞', usageTags: ['study', 'harmony'] },
      { label: '红玛瑙摆件', usageTags: ['health', 'general'] },
      { label: '暖光台灯', usageTags: ['general', 'harmony'] },
      { label: '红色中国结挂件', usageTags: ['wealth', 'general'] },
      { label: '朱砂平安扣摆件', usageTags: ['general', 'health'] },
      { label: '红鸫款台灯', usageTags: ['wealth', 'career'] },
    ],
  },
  earth_boost: {
    gap: 'earth_boost',
    rationaleKey: 'earthBoost',
    items: [
      { label: '黄水晶球', usageTags: ['wealth', 'general'] },
      { label: '陶瓷花瓶', usageTags: ['harmony', 'general'] },
      { label: '泰山石摆件', usageTags: ['health', 'general'] },
      { label: '黄玉摆件', usageTags: ['harmony', 'health'] },
      { label: '米色地毯', usageTags: ['general', 'health'] },
    ],
  },
  avoid_only: {
    gap: 'avoid_only',
    rationaleKey: 'avoidOnly',
    items: [
      { label: '粗盐碗（定期更换）', usageTags: ['general'] },
      { label: '六帝铜钱挂饰', usageTags: ['general', 'health'] },
      { label: '白水晶原石', usageTags: ['general'] },
      { label: '泰山石敢当', usageTags: ['general', 'health'] },
      { label: '静置清水一杯（常换）', usageTags: ['general', 'harmony'] },
    ],
  },
}

/** 供 reading.post.ts 注入 prompt 的物件池清单（i18n key + 用途标签） */
export function listOrnamentPool(gap: ElementGap): OrnamentRuleItem[] {
  if (gap === 'neutral') return []
  return ORNAMENT_RULES[gap].items
}
