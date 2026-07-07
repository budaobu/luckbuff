import type { MeihuaResult } from '~/types/zhouyi'
import { getGuaById } from '~/utils/zhouyi/constants'
import { getYaoci } from '~/utils/zhouyi/yaoci'

// 语言钩子映射
const LANGUAGE_HOOKS: Record<string, { system: string; user: string }> = {
  'zh-CN': {
    system: '请使用简体中文输出。',
    user: '请使用简体中文输出所有内容。',
  },
  'zh-TW': {
    system: '請使用繁體中文輸出。',
    user: '請使用繁體中文輸出所有內容。',
  },
  en: {
    system: 'Please output in English.',
    user: 'Please output all content in English.',
  },
}

export function useZhouyiPrompt() {
  function build(
    result: MeihuaResult,
    query: string,
    locale: string = 'zh-CN',
  ): { systemPrompt: string; userPrompt: string } {
    const langHook = LANGUAGE_HOOKS[locale] || LANGUAGE_HOOKS['zh-CN']!
    const benGua = getGuaById(result.benGuaId)
    const bianGua = getGuaById(result.bianGuaId)
    const huGua = getGuaById(result.huGuaId)
    const yaoci = getYaoci(result.benGuaId, result.dongYao)

    const systemPrompt = `你是一位精通《梅花易数》的解卦师。请使用 Markdown 格式返回解卦结果，严格按照以下分段结构，每段以 ## 中文标题 开头：
${langHook.system}

## 总览 / Overview
一句话概括卦象核心含义和整体吉凶判断。

## 动爻解读 / Moving Line Analysis
结合用户诉求，解读动爻爻辞的含义。

## 体用分析 / Body & Application
分析体卦和用卦的五行生克关系，结合旺衰判断吉凶。

## 互卦分析 / Middle Phase
分析互卦代表的中期发展趋势。

## 变卦分析 / Transformation
分析变卦代表的最终结果和长远趋势。

## 应期推断 / Timing
推断事情可能发生的时间。

## 策略建议 / Strategy
给出明确的行动策略和下一步建议。

## 温馨提示 / Note
卦象仅供参考，最终决策需结合实际情况。

## 解卦规则

1. **核心理念**：易=变。能变=吉，不变=凶。占卜目的是指引如何做出最佳改变。
2. **定体用**：动爻在下卦(1-3爻) → 下卦为「用」，上卦为「体」；动爻在上卦(4-6爻) → 上卦为「用」，下卦为「体」
3. **体用生克吉凶**：用生体→大吉；体克用→吉；比和→吉；用克体→凶；体生用→泄耗
4. **旺衰影响**：当令者旺，生我者相，我生者休，克我者囚，我克者死
5. **时间层次**：本卦=近期；互卦=中期；变卦=远期
6. **语气积极**，避免极端断语，使用「倾向」「可能」等非绝对用语

## 重要约束
- 必须严格按照上述 8 个段落输出，每段以 ## 中文标题 开头
- 段落内可以使用列表、加粗等 Markdown 语法增强可读性
- 不要输出任何与解卦无关的内容`

    const userPrompt = `请为以下卦象进行梅花易数解读：

【用户诉求】
${query || '未提供具体诉求'}

【起卦信息】
起卦方法：${result.methodName}
${result.calcDetail}

【时间层次】
- 近期（本卦/用卦）：${result.timeLevels.yongGua}
- 中期（互卦）：${result.timeLevels.huGua}
- 远期（变卦）：${result.timeLevels.bianGua}

【本卦（当前状态）】
${benGua?.name}（${benGua?.meaning}）
卦辞：${benGua?.guaci}

【互卦（发展过程）】
${huGua?.name}（${huGua?.meaning}）
卦辞：${huGua?.guaci}

【变卦（最终结果）】
${bianGua?.name}（${bianGua?.meaning}）
卦辞：${bianGua?.guaci}

【动爻分析】
- 动爻：第${result.dongYao}爻
- 爻辞：${yaoci || '暂无'}
- 爻位风险：${result.positionRisk?.riskLevel || '未知'}（系数${result.positionRisk?.coefficient.toFixed(3) || 0}）
${result.positionRisk?.warning ? `- 警告：${result.positionRisk.warning}` : ''}

【体用分析】
- 体卦（自身）：${getGuaById(result.tiGuaId)?.name} · ${result.tiWuxing} · ${result.tiWangshuai}
- 用卦（外境）：${getGuaById(result.yongGuaId)?.name} · ${result.yongWuxing} · ${result.yongWangshuai}
- 体用关系：${result.shengkeRelation}（${result.shengkeResult}）
- 当前季节当令五行：${result.seasonWuxing}

【策略参考】
- 本卦：${benGua?.name}
- 吉率：${result.jiRate ?? '未知'}%
- 卦象类型：${result.strategyType || '未知'}
- 建议策略：${result.strategyAction || '未知'}
- 【下一步】：${result.strategyNextStep || '未知'}
${result.changePath ? `- 变卦路径：${result.changePath}` : ''}

请严格按照标准解卦流程进行解读，必须输出【策略建议】部分。${langHook.user}`

    return { systemPrompt, userPrompt }
  }

  return { build }
}
