// 六十四卦策略速查表（来自 meihua-yishu SKILL.md）
export interface GuaStrategy {
  id: number
  name: string
  jilv: number      // 吉率 %
  type: string      // 吸引子/排斥子/福地/困境/陷阱/一般
  strategy: string   // 留/走/守/变/慎/观
  nextStep: string  // 【下一步】建议内容
}

export const GUA_STRATEGIES: GuaStrategy[] = [
  { id: 1, name: '乾', jilv: 0, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第4爻可达履卦（吉率50%）。' },
  { id: 2, name: '坤', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。情况中等，需要更多信息才能判断。变第4爻可达谦卦（吉率83%）。' },
  { id: 3, name: '屯', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。创业维艰，宜静待时机。变第6爻可达比卦（吉率67%）。' },
  { id: 4, name: '蒙', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。启蒙阶段，需耐心引导。变第6爻可达损卦（吉率50%）。' },
  { id: 5, name: '需', jilv: 67, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。目前位置有利，变动反而损失。' },
  { id: 6, name: '讼', jilv: 67, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。争讼适可而止，不宜坚持到底。' },
  { id: 7, name: '师', jilv: 17, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第6爻可达临卦（吉率83%）。' },
  { id: 8, name: '比', jilv: 67, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。亲比团结，依附有力量者为吉。' },
  { id: 9, name: '小畜', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。小有蓄积，时机未到需继续积累。变第5爻可达家人卦（吉率67%）。' },
  { id: 10, name: '履', jilv: 50, type: '福地', strategy: '守', nextStep: '稳守不动，静观其变。位置尚可，不主动出击，等待时机。' },
  { id: 11, name: '泰', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。否极泰来，好运开始但需谨慎。变第4爻可达临卦（吉率83%）。' },
  { id: 12, name: '否', jilv: 50, type: '福地', strategy: '守', nextStep: '稳守不动，静观其变。闭塞不通，宜守不宜进，静待变化。' },
  { id: 13, name: '同人', jilv: 17, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第6爻可达遁卦（吉率67%）。' },
  { id: 14, name: '大有', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。富有丰盛但盛极必衰，需谨慎。变第6爻可达鼎卦（吉率67%）。' },
  { id: 15, name: '谦', jilv: 83, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。谦受益满招损，唯一全吉卦。' },
  { id: 16, name: '豫', jilv: 17, type: '困境', strategy: '变', nextStep: '必须改变，不变则困。当前困境需主动突破，犹豫更糟。变第1爻可达晋卦（吉率67%）。' },
  { id: 17, name: '随', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。随从顺势，随机应变。变第6爻可达萃卦（吉率50%）。' },
  { id: 18, name: '蛊', jilv: 17, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第3爻可达鼎卦（吉率67%）。' },
  { id: 19, name: '临', jilv: 83, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。贵人降临，好运有时限需珍惜。' },
  { id: 20, name: '观', jilv: 0, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第1爻可达比卦（吉率67%）。' },
  { id: 21, name: '噬嗑', jilv: 17, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第6爻可达晋卦（吉率67%）。' },
  { id: 22, name: '贲', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。文饰外表，内在才是关键。变第2爻可达家人卦（吉率67%）。' },
  { id: 23, name: '剥', jilv: 17, type: '困境', strategy: '变', nextStep: '必须改变，不变则困。当前困境需主动突破，犹豫更糟。变第3爻可达晋卦（吉率67%）。' },
  { id: 24, name: '复', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。一阳来复，好运回转但需耐心。变第5爻可达临卦（吉率83%）。' },
  { id: 25, name: '无妄', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。不妄为，无妄之灾需防范。变第6爻可达否卦（吉率50%）。' },
  { id: 26, name: '大畜', jilv: 50, type: '福地', strategy: '守', nextStep: '稳守不动，静观其变。蓄积力量，待时而动。' },
  { id: 27, name: '颐', jilv: 50, type: '福地', strategy: '守', nextStep: '稳守不动，静观其变。颐养修身，养生之道。' },
  { id: 28, name: '大过', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。过度危机，需非常手段。' },
  { id: 29, name: '坎', jilv: 0, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第5爻可达比卦（吉率67%）。' },
  { id: 30, name: '离', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。光明依附，依附正道为吉。变第1爻可达丰卦（吉率50%）。' },
  { id: 31, name: '咸', jilv: 17, type: '困境', strategy: '变', nextStep: '必须改变，不变则困。当前困境需主动突破，犹豫更糟。变第1爻可达遁卦（吉率67%）。' },
  { id: 32, name: '恒', jilv: 0, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第3爻可达升卦（吉率67%）。' },
  { id: 33, name: '遁', jilv: 67, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。退避隐居，识时务者为俊杰。' },
  { id: 34, name: '大壮', jilv: 50, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。强盛但要守正，不宜妄动。' },
  { id: 35, name: '晋', jilv: 67, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。晋升上进，升迁有望。' },
  { id: 36, name: '明夷', jilv: 17, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第6爻可达谦卦（吉率83%）。' },
  { id: 37, name: '家人', jilv: 67, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。家庭和睦，家和万事兴。' },
  { id: 38, name: '睽', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。乖离散异，意见分歧需沟通。变第6爻可达未济卦（吉率50%）。' },
  { id: 39, name: '蹇', jilv: 17, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第2爻可达谦卦（吉率83%）。' },
  { id: 40, name: '解', jilv: 50, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。解除困难，雨过天晴。' },
  { id: 41, name: '损', jilv: 50, type: '福地', strategy: '守', nextStep: '稳守不动，静观其变。减损付出，损下益上。' },
  { id: 42, name: '益', jilv: 50, type: '福地', strategy: '守', nextStep: '稳守不动，静观其变。增益获得，损上益下。' },
  { id: 43, name: '夬', jilv: 0, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第3爻可达需卦（吉率67%）。' },
  { id: 44, name: '姤', jilv: 17, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第5爻可达遁卦（吉率67%）。' },
  { id: 45, name: '萃', jilv: 50, type: '福地', strategy: '守', nextStep: '稳守不动，静观其变。荟萃聚集，人才汇聚。' },
  { id: 46, name: '升', jilv: 67, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。稳步上升，升迁有望。' },
  { id: 47, name: '困', jilv: 17, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第1爻可达讼卦（吉率67%）。' },
  { id: 48, name: '井', jilv: 17, type: '困境', strategy: '变', nextStep: '必须改变，不变则困。当前困境需主动突破，犹豫更糟。变第6爻可达需卦（吉率67%）。' },
  { id: 49, name: '革', jilv: 50, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。变革革新，革故鼎新。' },
  { id: 50, name: '鼎', jilv: 67, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。鼎新更新，革新后的稳定。' },
  { id: 51, name: '震', jilv: 17, type: '陷阱', strategy: '慎', nextStep: '谨慎行事，小心陷阱。周围环境不佳，任何动作都要三思。' },
  { id: 52, name: '艮', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。止静不动，适可而止。变第1爻可达谦卦（吉率83%）。' },
  { id: 53, name: '渐', jilv: 50, type: '福地', strategy: '守', nextStep: '稳守不动，静观其变。循序渐进，女归吉利。' },
  { id: 54, name: '归妹', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。嫁娶归依，婚姻需谨慎。变第3爻可达临卦（吉率83%）。' },
  { id: 55, name: '丰', jilv: 50, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。丰盛盛大，盛极必衰需警惕。' },
  { id: 56, name: '旅', jilv: 0, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第5爻可达鼎卦（吉率67%）。' },
  { id: 57, name: '巽', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。谦逊顺从，以柔克刚。变第5爻可达渐卦（吉率50%）。' },
  { id: 58, name: '兑', jilv: 50, type: '吸引子', strategy: '留', nextStep: '维持现状，不宜改变。喜悦和悦，和谐相处。' },
  { id: 59, name: '涣', jilv: 33, type: '一般', strategy: '观', nextStep: '观察局势，再做决定。涣散离散，聚散离合。变第3爻可达讼卦（吉率67%）。' },
  { id: 60, name: '节', jilv: 17, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第2爻可达临卦（吉率83%）。' },
  { id: 61, name: '中孚', jilv: 17, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第5爻可达益卦（吉率50%）。' },
  { id: 62, name: '小过', jilv: 0, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第3爻可达谦卦（吉率83%）。' },
  { id: 63, name: '既济', jilv: 0, type: '排斥子', strategy: '走', nextStep: '积极改变，离开当前状态。此位置不利久留，宜主动求变。变第5爻可达需卦（吉率67%）。' },
  { id: 64, name: '未济', jilv: 50, type: '福地', strategy: '守', nextStep: '稳守不动，静观其变。功败垂成，仍需努力。' },
]

export function getGuaStrategy(guaId: number): GuaStrategy | undefined {
  return GUA_STRATEGIES.find(g => g.id === guaId)
}
