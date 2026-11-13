import type { BaziChart } from '~/types/bazi'

export interface NamingPromptInput {
  surname: string
  gender?: 'male' | 'female'
  chart: BaziChart
  locale?: string
  nameStyle?: string
}

type LocaleProfile = {
  language: string
  namingRule: string
  outputFormat: string
  userInstruction: string
}

const LOCALE_PROFILES: Record<string, LocaleProfile> = {
  'zh-CN': {
    language: '请使用简体中文输出。',
    namingRule: '推荐符合现代中文命名习惯的中文给定名，包含单字名与双字名。',
    outputFormat: `### 推荐名字 N：{名字}
- **拼音**：{拼音}
- **五行属性**：{字1}（{五行}）· {字2}（{五行}）
- **八字契合**：{为什么这个名字适合该八字，结合喜用神说明}
- **字义寓意**：{字义与整体寓意解读}
- **三才配置**：{天格五行} · {人格五行} · {地格五行}（{吉凶判断}）`,
    userInstruction: '请根据八字五行喜忌，结合姓氏推荐 5–8 个吉祥好名，并按指定格式输出。',
  },
  'zh-TW': {
    language: '請使用繁體中文輸出。',
    namingRule: '推薦符合現代中文命名習慣的中文給定名，包含單字名與雙字名。',
    outputFormat: `### 推薦名字 N：{名字}
- **拼音**：{拼音}
- **五行屬性**：{字1}（{五行}）· {字2}（{五行}）
- **八字契合**：{為什麼這個名字適合該八字，結合喜用神說明}
- **字義寓意**：{字義與整體寓意解讀}
- **三才配置**：{天格五行} · {人格五行} · {地格五行}（{吉凶判斷}）`,
    userInstruction: '請根據八字五行喜忌，結合姓氏推薦 5–8 個吉祥好名，並按指定格式輸出。',
  },
  en: {
    language: 'Write all output in English.',
    namingRule: 'Recommend English given names that follow contemporary English naming conventions. Do not replace them with Chinese character names; keep the supplied surname unchanged.',
    outputFormat: `### Recommended name N: {English given name}
- **Meaning and origin**: {meaning, language origin, and positive associations}
- **Bazi fit**: {why the meaning, sound, or symbolic elements support the favorable elements}
- **Sound and usage**: {nickname options, pronunciation, and how naturally it pairs with the surname}
- **Practical notes**: {style, popularity, and cultural considerations}`,
    userInstruction: 'Recommend 5-8 auspicious English given names based on the Five Elements balance, then use the required format.',
  },
  ja: {
    language: 'すべて日本語で出力してください。',
    namingRule: '現代日本の命名習慣に合う日本名（名）を漢字または仮名で推薦してください。姓は入力された姓をそのまま使います。',
    outputFormat: `### 推薦名 N：{日本名}
- **読み方**：{ひらがな・カタカナ読み}
- **五行・漢字要素**：{喜用神に合わせた意味・字面・画数の理由}
- **八字適合**：{この名が命式の喜用神や五行バランスに合う理由}
- **意味と印象**：{名の意味、温かさ、品格など}
- **実用メモ**：{書きやすさ、呼びやすさ、性別とのバランス}`,
    userInstruction: '八字の五行バランスと喜用神に基づいて、5〜8個の縁起の良い日本名を推薦し、指定形式で出力してください。',
  },
  ko: {
    language: '모든 출력을 한국어로 작성하세요.',
    namingRule: '현대 한국 명명 관습에 맞는 한국어 이름(이름)을 추천하세요. 한자 표기는 뜻을 설명할 때만 보조적으로 사용하고, 성은 입력된 성을 그대로 유지합니다.',
    outputFormat: `### 추천 이름 N: {한국어 이름}
- **의미와 어원**: {이름의 뜻, 어원, 긍정적 인상}
- **八字 적합성**: {오행 균형과 용신에 어울리는 이유}
- **발음과 사용**: {발음, 호칭, 성과의 자연스러운 연결}
- **실용 메모**: {남성적/여성적 인상, 사용 빈도, 기억하기 쉬운 정도}`,
    userInstruction: '八字 오행 균형과 용신에 맞는 좋은 한국어 이름 5~8개를 추천하고 지정된 형식으로 출력하세요.',
  },
}

function getLocaleProfile(locale: string): LocaleProfile {
  return LOCALE_PROFILES[locale] ?? LOCALE_PROFILES['zh-CN']!
}

export function buildSystemPrompt(locale: string): string {
  const profile = getLocaleProfile(locale)

  return `你是一位精通八字命理与跨文化命名实践的起名顾问。你的任务是根据用户提供的生辰八字命盘与姓氏，分析五行喜忌，推荐适合该命局、寓意吉祥且符合目标语言命名习惯的名字。

${profile.language}

## 命名要求

${profile.namingRule}

## 八字起名核心原则

1. **分析八字**：先看日主强弱、五行分布、喜用神与忌神。
2. **五行补益**：名字的义、音、形或字面要素应支持喜用神，避免强化忌神。
3. **文化适配**：名字必须符合目标语言的常见书写、称呼与审美习惯。
4. **性别倾向**：在尊重用户风格偏好的前提下考虑性别气质。
5. **实际可用**：避免罕见、难读、易误会或负面联想的名字。

## 输出格式

每个名字独立成段，严格按以下结构输出：

${profile.outputFormat}

## 约束

- 共推荐 5–8 个名字。
- 每个名字必须解释其与八字喜用神的关系。
- 不要添加总结性段落、免责声明或 AI 身份说明。
- 所有解释必须具体，不能空泛。`
}

export function buildUserPrompt(input: NamingPromptInput, locale: string): string {
  const profile = getLocaleProfile(locale)
  const genderText =
    input.gender === 'male' ? '男 / male' : input.gender === 'female' ? '女 / female' : '不限 / unspecified'
  const chart = input.chart

  const currentDaYun = chart.currentDaYun
    ? `${chart.currentDaYun.gan}${chart.currentDaYun.zhi}（${chart.currentDaYun.ageRange[0]}-${chart.currentDaYun.ageRange[1]}岁）`
    : '尚未起运 / not yet started'
  const dayunCompact = chart.dayuns
    .map(d => `${d.index}.${d.gan}${d.zhi}(${d.ageRange[0]}-${d.ageRange[1]})`)
    .join(', ')
  const styleHint = input.nameStyle?.trim()
    ? `\n【名字风格偏好 / style】${input.nameStyle.trim()}`
    : ''

  return `请为以下信息推荐名字 / Recommend names for this input:

【姓氏 / surname】${input.surname}
【性别 / gender】${genderText}${styleHint}

八字命盘 / Four Pillars chart:
- 年 / year：${chart.year.gan}${chart.year.zhi}
- 月 / month：${chart.month.gan}${chart.month.zhi}
- 日 / day：${chart.day.gan}${chart.day.zhi}
- 时 / hour：${chart.hour ? chart.hour.gan + chart.hour.zhi : '未知 / unknown'}
- 日主 / day master：${chart.riZhu}（${chart.riZhuStrength}）
- 格局 / structure：${chart.geju}
- 喜用 / favorable elements：${chart.xiyong}
- 忌 / unfavorable elements：${chart.jishen}
- 五行 / elements：木${chart.wuxingScore['木']}% 火${chart.wuxingScore['火']}% 土${chart.wuxingScore['土']}% 金${chart.wuxingScore['金']}% 水${chart.wuxingScore['水']}%
- 当前大运 / current luck cycle：${currentDaYun}
- 大运 / luck cycles：${dayunCompact}
- 起运年龄 / starting age：${chart.qiyunAge}岁
- 当前年龄 / current age：${chart.currentAge}岁

${profile.userInstruction}`
}
