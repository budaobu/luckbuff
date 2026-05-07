# luckbuff — Product Requirements Document

> 面向 Claude Code 直接使用的完整开发规格。所有实现细节已内嵌，无需再查阅外部文档。

---

## 一、项目概览

**项目名**：`luckbuff`

**产品灵魂（一句话）**：「五千年前就写好的你，今天 AI 读给你听。」

**首页副标题**：「输入你的生辰，看古人如何描述今天的你。」

**产品定位**：自我认知工具，以五千年命理体系为算法底层，以 AI 为翻译官，将天干地支描述的命格翻译成现代人听得懂、感受得到的语言。不是"算命网站"，是有历史厚度的人格镜子。

**核心用户场景**：人生十字路口的决策焦虑者——失业、分手、选择城市、选择伴侣、要不要辞职的深夜时刻。他们需要一个看起来科学、有数据支撑的"参考意见"，以及一种被理解的感觉。

**核心价值**：AI 解读是主角（默认展示，最先看到），专业排盘是信任背书（折叠或次级 Tab，让产品看起来认真），可视化图表是记忆点（让结果变得可分享）。三者职责明确，不互相替代。

**语言**：仅支持简体中文（V1）。多语言待用户量验证后再做。

---

## 二、技术栈与约束

- **框架**：Nuxt `v4.4.2`，`compatibilityVersion: 4`，使用 `app/` 目录结构
- **语言**：TypeScript，严格模式
- **包管理**：pnpm（禁止 npm/yarn）
- **UI 组件库**：`@nuxt/ui v4.6.1`（主力，已捆绑 `@nuxt/icon` 和 Tailwind CSS v4，**禁止**单独注册这两个模块）
- **图表**：`vue-chartjs` + `chart.js`（雷达图、蜡烛图等）
- **截图/分享**：`html2canvas`（纯客户端；移动端降级为文案 Dialog）
- **安全**：`nuxt-security`（必须安装，开发环境需条件禁用 `upgrade-insecure-requests`）
- **边框动画**：原生 CSS `@keyframes` + `conic-gradient` 实现 GlowCard 光晕扫边效果，**不引入** `border-beam` 等第三方包
- **动画**：原生 CSS animation 优先，`@vueuse/motion` 辅助页面级过渡
- **语言**：仅简体中文，**不引入** `@nuxtjs/i18n`（V1 不做多语言）
- **AI 服务**：开发环境用本地 Ollama，生产环境换第三方 AI API（OpenAI 兼容接口），通过环境变量切换，代码层零改动
- **部署目标**：Ubuntu 服务器，Nitro server preset；生产环境通过系统环境变量或 PM2 `env` 块注入，**不依赖** `.env` 文件自动加载

---

## 三、目录结构

```
luckbuff/
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css
│   ├── components/
│   │   ├── AppNav.vue
│   │   ├── AppFooter.vue
│   │   ├── GlowCard.vue              # 原生 CSS 光晕扫边通用卡片
│   │   ├── AiStreamCard.vue          # AI 流式输出卡片（通用）
│   │   ├── TianganDizhi.vue          # 天干地支旋转圆盘（通用等待动画）
│   │   ├── HexagramSpin.vue          # 六十四卦转动等待动画
│   │   ├── WuxingRadar.vue           # 五行雷达图
│   │   ├── DayunCandle.vue           # 大运流年蜡烛图
│   │   ├── FortuneRadar.vue          # 运势五维雷达图（AI 解读结果）
│   │   ├── ProfileCard.vue           # 单个用户档案卡片（展示+编辑+删除）
│   │   ├── ProfileForm.vue           # 新建/编辑档案表单（UModal 内使用）
│   │   ├── BaziForm.vue              # 输入表单 + 档案选择器
│   │   ├── BaziPan.vue               # 排盘计算 tab：四柱表格 + 大运表
│   │   ├── BaziPanPreview.vue        # AI 等待期间的排盘预览（四柱+当前大运）
│   │   ├── BaziAnalysis.vue          # 综合分析 tab：六大维度（纯前端逻辑）
│   │   ├── BaziDayunTable.vue        # 大运表格子组件
│   │   ├── BaziAiInterpret.vue       # AI 解读 tab（动画→streaming→图表）
│   │   ├── ZhouyiForm.vue            # 周易输入表单
│   │   └── ZhouyiResult.vue          # 起卦/排爻/断卦结果
│   ├── composables/
│   │   ├── useProfiles.ts                    # 多用户档案快捷读取
│   │   ├── useAiStream.ts                    # AI API streaming 封装
│   │   ├── useBaziCalc.ts                    # 八字排盘纯计算逻辑（含 currentDaYun getter）
│   │   ├── useBaziPrompt.ts                  # 八字 AI prompt 构建函数
│   │   ├── useZhouyiCalc.ts                  # 周易起卦计算逻辑
│   │   ├── useZhouyiPrompt.ts                # 周易 AI prompt 构建函数
│   │   ├── useShare.ts                       # 分享功能：文案 + URL + 分享图
│   │   └── useEvent.ts                       # 行为事件埋点（fire-and-forget）
│   ├── layouts/
│   │   └── default.vue
│   ├── pages/
│   │   ├── index.vue                         # 首页
│   │   ├── tools/
│   │   │   ├── index.vue                     # 算命工具列表页
│   │   │   ├── bazi.vue                      # 四柱八字详情页
│   │   │   └── zhouyi.vue                    # 周易八卦详情页
│   │   ├── settings.vue                      # 用户档案管理页
│   │   ├── terms.vue                         # 使用条款页
│   │   └── privacy.vue                       # 隐私说明页
│   ├── server/
│   │   └── api/
│   │       └── ai/
│   │           └── stream.post.ts            # AI 流式代理端点（所有 AI 请求走此处）
│   ├── stores/
│   │   └── profiles.ts                       # Pinia store（多用户档案，持久化到 localStorage）
│   ├── types/
│   │   ├── bazi.ts
│   │   ├── zhouyi.ts
│   │   └── user.ts
│   └── utils/
│       ├── bazi/
│       │   ├── constants.ts                  # 所有干支、五行、十神常量表
│       │   ├── calendar.ts                   # 万年历、节气、阴历转换
│       │   ├── pillars.ts                    # 四柱排盘计算
│       │   ├── dayun.ts                      # 大运计算
│       │   ├── shishen.ts                    # 十神计算
│       │   └── analysisText.ts               # 综合分析固定文本模板库
│       └── zhouyi/
│           ├── constants.ts                  # 六十四卦完整常量（64 条全部硬编码）
│           └── strategies/
│               ├── index.ts                  # GuaStrategy 接口定义
│               └── meihuaMethod.ts           # 梅花易数起卦法实现（当前唯一策略）
├── public/
│   └── favicon.ico
├── nuxt.config.ts
├── .env
└── .env.example
```

---

## 四、环境变量

**开发环境** `.env`（本地 Ollama）：

```dotenv
# Site
NUXT_PUBLIC_SITE_URL=http://localhost:3000

# Search Engine Verification（生产才填）
NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NUXT_PUBLIC_MS_SITE_VERIFICATION=
NUXT_PUBLIC_YANDEX_VERIFICATION=

# Analytics
NUXT_PUBLIC_BAIDU_ANALYTICS_ID=

# AI API — 开发环境：本地 Ollama
AI_BASE_URL=http://127.0.0.1:11434/api/generate
AI_API_KEY=ollama
AI_MODEL=gemma3:4b
AI_MAX_TOKENS=4096
# Ollama 接口类型标识（影响请求体格式）
AI_PROVIDER=ollama
```

**生产环境**（系统环境变量或 PM2 env 块，替换以下值）：

```dotenv
# AI API — 生产环境：第三方 OpenAI 兼容服务（如 DeepSeek、硅基流动、Groq 等）
AI_BASE_URL=https://api.deepseek.com/v1/chat/completions
AI_API_KEY=sk-xxxxxxxxxxxxxxxx
AI_MODEL=deepseek-chat
AI_MAX_TOKENS=4096
AI_PROVIDER=openai   # openai 兼容接口
```

**安全约束**：AI 相关变量全部私有（无 `NUXT_PUBLIC_` 前缀），客户端永远读不到。所有 AI 请求经 `server/api/ai/stream.post.ts` 代理，切换生产 API 只需改环境变量，代码零改动。

**`AI_PROVIDER` 说明**：`ollama` 时请求体用 `{ model, prompt, stream, options: { num_predict } }` 格式；`openai` 时用 `{ model, messages: [{role,content}], stream, max_tokens }` 格式。服务端代理根据此字段自动选择请求格式。

**`AI_MAX_TOKENS` 说明**：保守设置为 4096，足够覆盖完整八字解读（约 2000 汉字 + JSON）。不要设置超过模型实际上下文窗口，否则 Ollama 会静默截断或报错。

---

## 五、`nuxt.config.ts` 关键配置

```ts
export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },

  modules: [
    '@nuxt/ui',                            // v4.6.1，已捆绑 @nuxt/icon 和 Tailwind CSS v4
    'nuxt-security',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    // 不引入 @nuxtjs/i18n（V1 仅中文）
    // 不引入 @nuxt/icon（@nuxt/ui 已捆绑）
  ],

  css: ['~/assets/css/main.css'],

  security: {
    headers: {
      contentSecurityPolicy: {
        'upgrade-insecure-requests': process.env.NODE_ENV === 'production',
      },
    },
  },

  runtimeConfig: {
    // 私有（仅服务端），由环境变量覆盖
    aiBaseUrl: 'http://127.0.0.1:11434/api/generate',
    aiApiKey: 'ollama',
    aiModel: 'gemma3:4b',
    aiMaxTokens: 4096,
    aiProvider: 'ollama',   // 'ollama' | 'openai'，决定请求体格式
    // 公开
    public: {
      siteUrl: '',
    },
  },
})
```

**`app/assets/css/main.css`**：

```css
@import "@nuxt/ui";   /* @nuxt/ui v4 必要入口，内含 Tailwind v4 */

:root {
  --background: #0a0a0f;
  --foreground: #e8e0d0;
  --accent: #c9a227;
  --accent-purple: #8b5cf6;
  --card: rgba(255, 255, 255, 0.04);
}

/* GlowCard 光晕扫边动画（原生 CSS，无第三方依赖） */
@property --glow-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes glow-rotate {
  to { --glow-angle: 360deg; }
}

.glow-card {
  position: relative;
  border-radius: 0.75rem;
  background: var(--card);
}

.glow-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(
    from var(--glow-angle),
    transparent 75%,
    #c9a227 85%,
    #f5e6c0 92%,
    #c9a227 95%,
    transparent 100%
  );
  animation: glow-rotate 6s linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  padding: 1px;
}
```

**安装命令**：

```bash
pnpm add nuxt@4.4.2
pnpm add @nuxt/ui@4.6.1
pnpm add nuxt-security @pinia/nuxt @pinia-plugin-persistedstate/nuxt
pnpm add vue-chartjs chart.js html2canvas marked nanoid
```

---

## 六、数据类型定义

### `app/types/user.ts`

```ts
export interface UserProfile {
  id: string                // nanoid() 生成
  label: string             // 档案标签，必填且在列表内唯一（校验见 profiles store）
  name?: string
  formerName?: string
  formerNameChangedYear?: number
  gender: 'male' | 'female'
  birthDate?: string        // YYYY-MM-DD 阳历
  birthHour?: DiZhi         // 出生时辰地支
  birthProvince?: string
  isDefault?: boolean
}

export type TianGan = '甲'|'乙'|'丙'|'丁'|'戊'|'己'|'庚'|'辛'|'壬'|'癸'
export type DiZhi  = '子'|'丑'|'寅'|'卯'|'辰'|'巳'|'午'|'未'|'申'|'酉'|'戌'|'亥'

export const SHICHEN_OPTIONS = [
  { dizhi: '子' as DiZhi, label: '子时', range: '23:00~01:00' },
  { dizhi: '丑' as DiZhi, label: '丑时', range: '01:00~03:00' },
  { dizhi: '寅' as DiZhi, label: '寅时', range: '03:00~05:00' },
  { dizhi: '卯' as DiZhi, label: '卯时', range: '05:00~07:00' },
  { dizhi: '辰' as DiZhi, label: '辰时', range: '07:00~09:00' },
  { dizhi: '巳' as DiZhi, label: '巳时', range: '09:00~11:00' },
  { dizhi: '午' as DiZhi, label: '午时', range: '11:00~13:00' },
  { dizhi: '未' as DiZhi, label: '未时', range: '13:00~15:00' },
  { dizhi: '申' as DiZhi, label: '申时', range: '15:00~17:00' },
  { dizhi: '酉' as DiZhi, label: '酉时', range: '17:00~19:00' },
  { dizhi: '戌' as DiZhi, label: '戌时', range: '19:00~21:00' },
  { dizhi: '亥' as DiZhi, label: '亥时', range: '21:00~23:00' },
] as const
```

### `app/types/bazi.ts`

```ts
import type { TianGan, DiZhi } from './user'

export interface Pillar {
  gan: TianGan
  zhi: DiZhi
  shishen?: string
  canggan: { gan: TianGan; type: '本气'|'中气'|'余气' }[]
}

export interface DaYun {
  index: number
  ageRange: [number, number]
  gan: TianGan
  zhi: DiZhi
  fortune?: '大吉'|'吉'|'平'|'凶'|'大凶'   // AI 解读后填入
  score?: number                             // AI 解读后填入，0-100
}

export interface WuxingScore {
  木: number; 火: number; 土: number; 金: number; 水: number
}

export interface BaziChart {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar | null       // 时辰未知为 null
  riZhu: TianGan
  riZhuStrength: '身旺'|'身弱'|'从强'|'从弱'
  wuxingScore: WuxingScore
  geju: string
  xiyong: string
  jishen: string
  dayuns: DaYun[]
  qiyunAge: number
  currentAge: number        // 由 useBaziCalc 根据当前年份计算
  currentDaYun: DaYun | null  // 由 useBaziCalc 计算，非 AI 生成
}

// AI 解读结果（从流式输出解析）
export interface BaziAiResult {
  text: string
  dimensionScores: {
    感情运: number; 事业运: number; 财运: number; 健康运: number; 学业运: number
  }
  dayunScores: Array<{
    index: number; ganZhi: string; ageRange: string; score: number; fortune: string
  }>
  historicalPredictions: Array<{
    age: number; year: number; description: string
  }>
  comprehensiveAdvice: string[]  // 3 条可执行建议
}
```

---

## 七、页面规格

### 7.1 首页 `/`

Hero section：全屏高度，居中，主标题「五千年前就写好的你，今天 AI 读给你听。」，副标题「输入你的生辰，看古人如何描述今天的你。」，"立即开始"CTA 按钮，背景深色粒子/星空动效。

**新用户引导 Banner**（首次访问时，`localStorage` 无档案数据）：Hero 下方显示一条引导条："建议先[保存你的生辰信息]，算命时自动填入，随时可为家人朋友添加多份档案。"点击跳转设置页，或直接关闭继续。

Why Us section：4 个特性 `GlowCard`：五千年命理算法、AI 白话翻译、数据可视化、支持多人档案。

工具预览 section：2 个主工具简介卡片，点击跳转。

FAQ section：Accordion，5~8 条，包含"算命结果准吗""数据安全吗""和其他算命网站有什么不同"等。

**留存钩子**：首页底部展示"流年速览"区块，若 `localStorage` 有默认档案，显示"[姓名] 的 [当前年份] 流年：[当年天干地支] 运势概览"，点击跳转八字工具页并自动预填档案。每年元旦前后内容更新，用户有理由回来。

### 7.2 工具列表页 `/tools`

3 列网格，`GlowCard` 卡片，当前 2 个工具 + 预留扩展位（显示"即将上线"角标）。

### 7.3 四柱八字详情页 `/tools/bazi`

布局单列，`max-w-2xl mx-auto`。

页面状态机：`phase: 'form' | 'animating' | 'result'`，初始为 `'form'`。

---

**阶段 1 — 用户信息收集（`phase === 'form'`）**

`BaziForm.vue`，完整显示。

顶部档案快选区：从 `profiles` store 读取，以 Badge 平铺展示所有档案（显示 `label`）。点击任意 Badge 将该档案数据填入下方表单。有默认档案时进入页面自动预填。档案列表为空时隐藏此区域，显示提示文案"尚无保存档案，[前往设置]创建"。

**表单字段与填写规则**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 性别 | Radio | ✅ | 乾造（男）/ 坤造（女） |
| 阳历生日 | 日期选择器 | ✅ | 选后行内实时显示干支，如"甲子年 丙寅月" |
| 出生时辰 | 下拉 | ❌ | 格式：`子时（23:00~01:00）`；不填则七字分析 |
| 姓名 | 文本 | ❌ | |
| 曾用名 | 文本 | ❌ | 有值时显示"改名年份"字段 |
| 出生地点 | 文本 | ❌ | 省级行政单位 |

**档案与表单的关系**：用户在表单里手动修改任何字段，**不会自动写回档案**，避免误覆盖。只有在顶部档案快选区已选中某个档案时，表单底部出现"保存到当前档案"按钮，点击后才将当前表单值覆写进该档案。

"**立即推演**"按钮：验证性别和阳历生日，通过后将表单值快照保存到 `lastFormValues`（供重新推演时回填），然后 `phase = 'animating'`。

---

**阶段 2 — 推演动画（`phase === 'animating'`）**

全宽居中显示 `TianganDizhi.vue`（`size="full"`），文案"天机推演中..."。

同时在后台执行排盘计算（`useBaziCalc`，几乎瞬时完成）。动画**最少播放 1.5 秒**（视觉缓冲），计算完成且满 1.5s 后切换 `phase = 'result'`。

`TianganDizhi.vue` 不内置定时器，完全由父组件控制显示/隐藏，可在任意异步等待场景复用。

---

**阶段 3 — 结果展示（`phase === 'result'`）**

三 Tab（`@nuxt/ui` `UTabs`）：**AI 解读**（默认选中）| **排盘计算** | **综合分析**

AI 解读是主角，排盘计算和综合分析是信任背书，按使用频率从左到右排列。

**Tab 切换规则**：
- AI 解读 tab：`phase` 切为 `result` 时立即触发 AI 请求，**不等用户主动点击**；切走后 streaming 在后台继续；切回后显示已接收内容继续填充；完成后再切入直接显示完整结果，不重复请求
- 排盘计算、综合分析 tab：随时可切，数据在阶段 2 瞬时计算完毕
- 三个 Tab 任何时候均可自由切换，不锁定

---

**AI 解读 Tab**（`BaziAiInterpret.vue`，默认展示）：

AI 请求在进入 `phase === 'result'` 时立即发出。**等待首个 token 期间**，不显示空白，而是在 Tab 内容区上半部分先渲染排盘计算的核心内容（四柱表 + 当前大运，只读展示），下半部分显示 `TianganDizhi.vue`（`size="compact"`）+ 文案"AI 正在解读命盘..."。这样用户等待 AI 时有内容可看，不会感到页面空洞。

首个 token 到达（`aiStream.started = true`）后：上方排盘预览收起，`AiStreamCard.vue` 全宽淡入，streaming 文字填充，末尾光标闪烁。

完成阶段（`aiStream.streaming = false`）：解析 JSON 块，追加可视化子卡片：
- `FortuneRadar.vue`：感情/事业/财运/健康/学业 5 维雷达图
- `DayunCandle.vue`：各步大运评分蜡烛图
- 历史事件校准卡（纯展示）：AI 预测的 3~5 条历史关键时期，供用户自行对照
- 综合建议卡：3 条可执行建议

Tab 顶部固定灰色小字：「AI 解读每次表述略有差异，排盘数据（干支/十神/大运）为确定性计算。」

AI 请求失败时：`TianganDizhi` 动画继续播放，显示"AI 服务暂时繁忙"+ "重试"按钮。

```vue
<template>
  <p class="text-xs text-muted-foreground mb-4">
    AI 解读每次表述略有差异，排盘数据（干支/十神/大运）为确定性计算。
  </p>

  <!-- 等待首个 token：上方展示核心排盘，下方动画 -->
  <div v-if="!aiStream.started">
    <BaziPanPreview :chart="chart" class="mb-6 opacity-60" />
    <div class="flex flex-col items-center py-8">
      <TianganDizhi size="compact" label="AI 正在解读命盘..." />
    </div>
  </div>

  <!-- 首个 token 到达后 -->
  <Transition name="fade">
    <div v-if="aiStream.started">
      <AiStreamCard :streaming="aiStream.streaming" :content="aiStream.content" title="AI 解读" />
      <template v-if="!aiStream.streaming && aiResult">
        <FortuneRadar :scores="aiResult.dimensionScores" />
        <DayunCandle :dayuns="mergedDayuns" />
        <GlowCard title="历史事件校准">
          <p class="text-xs text-muted-foreground mb-3">根据命盘推算的历史关键时期，供您自行对照：</p>
          <div v-for="p in aiResult.historicalPredictions" :key="p.year" class="mb-2 text-sm">
            <span class="text-[#c9a227] font-medium">{{ p.age }}岁（{{ p.year }}年）</span>：{{ p.description }}
          </div>
        </GlowCard>
        <GlowCard title="综合建议">
          <div v-for="(advice, i) in aiResult.comprehensiveAdvice" :key="i" class="mb-2 text-sm">
            {{ i + 1 }}. {{ advice }}
          </div>
        </GlowCard>
      </template>
    </div>
  </Transition>
</template>
```

**新增组件**：`BaziPanPreview.vue`，从 `BaziPan.vue` 提取四柱表 + 当前大运两个核心卡片，仅用于 AI 等待期间的预览展示，不含大运完整列表。

---

**排盘计算 Tab**（`BaziPan.vue`，确定性算法，无 AI）：

单列 `GlowCard` 顺序展示，加 `data-share-target` 属性：

卡片 1 — 命盘四柱表：

|      | 年柱 | 月柱 | 日柱 | 时柱 |
|------|------|------|------|------|
| 天干 | X    | X    | X    | X（或—）|
| 地支 | X    | X    | X    | X（或—）|
| 十神 |      |      | 日主 |      |
| 藏干 |      |      |      |      |

时辰未知时时柱显示"—"，卡片底部警告"⚠ 出生时辰未知，仅做七字分析"。

卡片 2 — 大运排列（`BaziDayunTable.vue`）：当前所处大运行金色高亮。

---

**综合分析 Tab**（`BaziAnalysis.vue`，纯前端逻辑 + 固定文本库，6 个维度）：

> ⚠ 实现风险提示：固定模板生成的命理文本质量需在开发前手动验证。如验证结果质量不及预期，将此 Tab 内容改由 AI 生成，`analysisText.ts` 降级为 AI prompt 的上下文素材。

每个维度一张 `GlowCard`，标题带金色图标，内容由计算数据 + 固定文本模板生成：

1. **日主分析**：旺衰判断 + 五行性格特征
2. **十神分析**：各柱十神 + 六亲对应
3. **五行平衡**：`WuxingRadar.vue` + 喜用神/忌神
4. **格局判定**：格局名称 + 高低成败，引用典籍
5. **大运分析**：当前大运 + 各步趋势
6. **流年分析**：当年冲合刑害 + 近 1~3 年展望

`BaziAnalysis.vue` 通过 `defineExpose` 暴露 `getSummary(): string`，供 prompt 构建使用。

---

**底部操作区**（`phase === 'result'` 始终可见）：

```html
<div class="flex gap-3 justify-center mt-10 flex-wrap">
  <Button variant="outline" @click="resetToForm">重新推演</Button>
  <Button variant="outline" @click="handleShare">一键分享</Button>
  <Button variant="ghost" @click="navigateTo('/')">回到首页</Button>
</div>
```

`resetToForm()`：`phase = 'form'`，用 `lastFormValues` 回填表单（保留上次输入，用户只需修改需要更改的字段），清空 `chart` 和 `aiResult`，重置 `aiStream` 状态（下次切 AI Tab 时重新请求），滚动到顶部。

`handleShare()`：调用 `useShare`，同时执行三件事（见第九节）。

### 7.4 周易八卦详情页 `/tools/zhouyi`

布局同上，单列。

档案快选区与输入表单同 7.3（多一个"具体诉求"文本域，必填）。点击"立即起卦"后进入动画阶段。

动画：`HexagramSpin.vue`，文案"蓍草卜卦中..."，最少 1.5 秒后展示结果。

结果展示（三流程 + AI 断语，四张 `GlowCard`，顺序展开）：
1. **起卦卡片**：起卦方法说明（梅花易数）+ 本卦卦象（卦名、六爻图）
2. **排爻卡片**：动爻位置 + 变卦卦象
3. **断卦卡片**：本卦/变卦含义 + 动爻特殊含义 + 针对诉求的初步判断
4. **AI 断语卡片**：断卦展示完毕后自动触发 AI 请求，等待期间卡片内显示 `TianganDizhi.vue`（`size="compact"`），首个 token 到达后 streaming 填充文字

底部同样有"重新推演"、"一键分享"和"回到首页"按钮。

### 7.5 用户档案管理页 `/settings`

标题"我的档案" + 右侧"新建档案"按钮（打开 `ProfileForm` Dialog）。

档案列表：2 列网格（移动端 1 列），每个档案一张 `ProfileCard.vue`。卡片内容：档案标签（大字）、姓名/性别/生日/时辰，右上角编辑/删除图标，底部"设为默认"开关。默认档案加金色"默认"角标。

`ProfileForm.vue`（Dialog，新建/编辑复用）：

| 字段 | 必填 | 说明 |
|------|------|------|
| 档案标签 | ✅ | 同列表内唯一，保存时校验，重复则内联报错"标签已存在，请使用其他名称" |
| 性别 | ✅ | |
| 阳历生日 | ✅ | 选后实时显示干支 |
| 出生时辰 | ❌ | |
| 姓名 | ❌ | |
| 曾用名 | ❌ | 有值时出现"改名年份" |
| 出生地点 | ❌ | |
| 设为默认 | ❌ | 勾选则清除其他档案的默认标记 |

**`stores/profiles.ts`**：

```ts
import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'
import type { UserProfile } from '~/types/user'

export const useProfilesStore = defineStore('profiles', {
  state: () => ({
    list: [] as UserProfile[],
  }),

  getters: {
    defaultProfile: (state): UserProfile | null =>
      state.list.find(p => p.isDefault) ?? state.list[0] ?? null,
  },

  actions: {
    isLabelUnique(label: string, excludeId?: string): boolean {
      return !this.list.some(p => p.label === label && p.id !== excludeId)
    },
    add(data: Omit<UserProfile, 'id'>): { ok: boolean; error?: string } {
      if (!this.isLabelUnique(data.label)) {
        return { ok: false, error: '标签已存在，请使用其他名称' }
      }
      if (data.isDefault) this._clearDefault()
      this.list.push({ ...data, id: nanoid() })
      return { ok: true }
    },
    update(id: string, data: Partial<Omit<UserProfile, 'id'>>): { ok: boolean; error?: string } {
      const idx = this.list.findIndex(p => p.id === id)
      if (idx === -1) return { ok: false, error: '档案不存在' }
      if (data.label !== undefined && !this.isLabelUnique(data.label, id)) {
        return { ok: false, error: '标签已存在，请使用其他名称' }
      }
      if (data.isDefault) this._clearDefault()
      this.list[idx] = { ...this.list[idx], ...data }
      return { ok: true }
    },
    remove(id: string) {
      this.list = this.list.filter(p => p.id !== id)
      // 删除后若列表非空且无默认，自动将第一个设为默认
      if (this.list.length > 0 && !this.list.some(p => p.isDefault)) {
        this.list[0].isDefault = true
      }
    },
    _clearDefault() {
      this.list.forEach(p => { p.isDefault = false })
    },
  },

  persist: true,
})
```

### 7.6 使用条款页 `/terms` 与隐私说明页 `/privacy`

静态内容页，中英双语。内容含标准免责声明：算命结果仅供文化娱乐参考，不构成任何专业建议。

---

## 八、通用组件规格

### `TianganDizhi.vue`（通用等待动画）

**无内置定时器，父组件控制显示/隐藏**，持续播放直到父组件隐藏。

Props：

```ts
interface Props {
  label?: string                          // 圆盘下方文案，默认"推演中..."
  size?: 'full' | 'compact'              // full=280px，compact=140px
}
```

实现：纯 CSS 同心圆：
- 外圆（full: 280px，compact: 140px）：12 地支，顺时针，6s/圈
- 内圆（full: 180px，compact: 90px）：10 天干，逆时针，8s/圈
- 中心：太极鱼眼 SVG
- 文字：金色 `#c9a227`，毛玻璃背景

使用场景：
1. 八字推演阶段 2（`size="full"`，父控制最少 1.5s）
2. 八字 AI 解读 Tab 等待首个 token（`size="full"`，`aiStream.started` 变 true 后淡出）
3. 周易 AI 断语卡片内 loading（`size="compact"`，嵌入卡片）

### `HexagramSpin.vue`

同理无内置定时器，父控制显示。单圆盘，8 个卦象符号循环旋转，中心显示文案。

Props：`label?: string`，`size?: 'full' | 'compact'`（同 TianganDizhi）。

### `GlowCard.vue`

```ts
interface Props {
  title?: string
  glowSpeed?: number   // 光晕旋转速度，单位秒，默认 6
  glowFrom?: string    // 光晕起色，默认 #c9a227
  glowTo?: string      // 光晕终色，默认 #f5e6c0
}
```

根元素 class 包含 `glow-card`，CSS 扫边动画由 `main.css` 的 `@keyframes glow-rotate` 驱动。

### `AiStreamCard.vue`

```ts
interface Props {
  title: string
  streaming: boolean
  content: string      // 已接收的 Markdown 文本
}
```

内部用 `marked` 渲染 Markdown，`streaming=true` 时末尾显示 `|` 光标 CSS animation。

### `AppNav.vue`

Logo + 导航链接（首页、算命工具、我的档案）。移动端汉堡菜单。无登录相关元素，无语言切换（V1 仅中文）。

---

## 九、分享功能（`composables/useShare.ts`）

"一键分享"同时执行三件事：生成分享文案、复制页面 URL、下载分享图。

```ts
import html2canvas from 'html2canvas'

export function useShare() {
  /**
   * 一键分享：
   * 1. 将分享文案 + URL 复制到剪贴板
   * 2. 同时触发分享图下载
   * 3. Toast 提示"分享内容已复制，图片正在下载"
   */
  async function share(options: {
    tool: 'bazi' | 'zhouyi'
    name?: string          // 用户姓名，用于文案和文件名
    summary?: string       // 一句话结果摘要，如"日主甲木身旺，格局正官"
    shareTargetSelector: string  // 截图目标 DOM 选择器
    filename: string       // 下载文件名，如 "bazi-张三-20250423.png"
  }) {
    const { tool, name, summary, shareTargetSelector, filename } = options

    // 1. 构造分享文案（口语化钩子，让普通人愿意转发）
    const toolName = tool === 'bazi' ? '八字' : '卦象'
    const nameStr = name ? `${name}的` : '我的'
    const hookLines: Record<string, string> = {
      bazi: summary
        ? `AI 算出我：${summary}，你的命格是什么？`
        : `五千年前就写好的我，今天 AI 读给我听了`,
      zhouyi: summary
        ? `卦象说：${summary}。你也来问一卦？`
        : `刚用周易问了一卦，结果让我细思极恐`,
    }
    const hook = hookLines[tool]
    const url = window.location.href
    const copyText = `${hook}\n\n👉 ${url}\n（${nameStr}${toolName}推演结果，由 LuckBuff 生成）`

    // 2. 复制文案 + URL 到剪贴板
    await navigator.clipboard.writeText(copyText).catch(() => {})

    // 3. 生成并下载分享图
    const el = document.querySelector(shareTargetSelector) as HTMLElement | null
    if (el) {
      const canvas = await html2canvas(el, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        useCORS: true,
      })
      // 水印
      const ctx = canvas.getContext('2d')!
      ctx.font = `${24 * 2}px sans-serif`
      ctx.fillStyle = 'rgba(201,162,39,0.35)'
      ctx.textAlign = 'right'
      ctx.fillText('LuckBuff · luckbuff.com', canvas.width - 32, canvas.height - 32)

      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = filename
      a.click()
    }

    // 4. Toast 提示
    // 调用方通过 useToast() 处理，此处 return 成功标志
    return { ok: true }
  }

  return { share }
}
```

**调用示例**（`bazi.vue` 底部"一键分享"按钮）：

```ts
const { share } = useShare()
const { toast } = useToast()

async function handleShare() {
  await share({
    tool: 'bazi',
    name: formValues.name,
    summary: chart.value ? `日主${chart.value.riZhu}（${chart.value.riZhuStrength}），${chart.value.geju}` : undefined,
    shareTargetSelector: '[data-share-target]',
    filename: `bazi-${formValues.name ?? '命盘'}-${new Date().toISOString().slice(0,10)}.png`,
  })
  toast({ title: '分享内容已复制到剪贴板，图片正在下载' })
}
```

`data-share-target` 属性加在排盘计算 Tab 的四柱表 + 大运表容器 div 上。

---

## 十、AI API 集成

### `server/api/ai/stream.post.ts`

根据 `AI_PROVIDER` 自动选择请求格式，开发/生产环境零代码切换：

```ts
export default defineEventHandler(async (event) => {
  const { prompt, systemPrompt } = await readBody(event)
  const config = useRuntimeConfig()
  const provider = config.aiProvider  // 'ollama' | 'openai'

  // 构造请求体
  const body = provider === 'openai'
    ? JSON.stringify({
        model: config.aiModel,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        stream: true,
        max_tokens: Number(config.aiMaxTokens),
      })
    : JSON.stringify({
        model: config.aiModel,
        prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        stream: true,
        options: { num_predict: Number(config.aiMaxTokens) },
      })

  const response = await fetch(config.aiBaseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.aiApiKey}`,
    },
    body,
  })

  if (!response.ok) {
    throw createError({ statusCode: response.status, message: 'AI 服务暂时不可用' })
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  })

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    await sendStream(event, decoder.decode(value))
  }
})
```

### `composables/useAiStream.ts`

解析层同样需要适配两种流式格式：

```ts
export function useAiStream() {
  const content  = ref('')
  const streaming = ref(false)
  const started  = ref(false)
  const error    = ref<string | null>(null)

  async function startStream(prompt: string, systemPrompt?: string) {
    content.value  = ''
    streaming.value = true
    started.value  = false
    error.value    = null

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemPrompt }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader  = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value).split('\n').filter(Boolean)) {
          // 兼容 Ollama 格式：{"response":"...","done":false}
          // 兼容 OpenAI SSE 格式：data: {"choices":[{"delta":{"content":"..."}}]}
          const raw = line.startsWith('data: ') ? line.slice(6) : line
          if (raw === '[DONE]') continue
          try {
            const data = JSON.parse(raw)
            const token = data.response           // Ollama
              ?? data.choices?.[0]?.delta?.content // OpenAI
            if (token) {
              if (!started.value) started.value = true
              content.value += token
            }
          } catch { /* 非 JSON 行忽略 */ }
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      streaming.value = false
    }
  }

  function reset() {
    content.value = ''; streaming.value = false
    started.value = false; error.value = null
  }

  return { content, streaming, started, error, startStream, reset }
}

---

## 十一、四柱八字核心算命逻辑

### 11.1 `app/utils/bazi/constants.ts`（完整常量）

```ts
export const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const
export const DI_ZHI   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const

export const GAN_WUXING: Record<string, string> = {
  甲:'木', 乙:'木', 丙:'火', 丁:'火', 戊:'土',
  己:'土', 庚:'金', 辛:'金', 壬:'水', 癸:'水',
}
export const GAN_YANG: Record<string, boolean> = {
  甲:true, 乙:false, 丙:true, 丁:false, 戊:true,
  己:false, 庚:true, 辛:false, 壬:true, 癸:false,
}
export const ZHI_WUXING: Record<string, string> = {
  子:'水', 丑:'土', 寅:'木', 卯:'木', 辰:'土', 巳:'火',
  午:'火', 未:'土', 申:'金', 酉:'金', 戌:'土', 亥:'水',
}
export const ZHI_YANG: Record<string, boolean> = {
  子:true, 丑:false, 寅:true, 卯:false, 辰:true, 巳:false,
  午:true, 未:false, 申:true, 酉:false, 戌:true, 亥:false,
}
export const ZHI_CANGGAN: Record<string, {gan:string; type:'本气'|'中气'|'余气'}[]> = {
  子:[{gan:'癸',type:'本气'}],
  丑:[{gan:'己',type:'本气'},{gan:'癸',type:'中气'},{gan:'辛',type:'余气'}],
  寅:[{gan:'甲',type:'本气'},{gan:'丙',type:'中气'},{gan:'戊',type:'余气'}],
  卯:[{gan:'乙',type:'本气'}],
  辰:[{gan:'戊',type:'本气'},{gan:'乙',type:'中气'},{gan:'癸',type:'余气'}],
  巳:[{gan:'丙',type:'本气'},{gan:'庚',type:'中气'},{gan:'戊',type:'余气'}],
  午:[{gan:'丁',type:'本气'},{gan:'己',type:'中气'}],
  未:[{gan:'己',type:'本气'},{gan:'丁',type:'中气'},{gan:'乙',type:'余气'}],
  申:[{gan:'庚',type:'本气'},{gan:'壬',type:'中气'},{gan:'戊',type:'余气'}],
  酉:[{gan:'辛',type:'本气'}],
  戌:[{gan:'戊',type:'本气'},{gan:'辛',type:'中气'},{gan:'丁',type:'余气'}],
  亥:[{gan:'壬',type:'本气'},{gan:'甲',type:'中气'}],
}

export const WUXING_SHENG: Record<string,string> = { 木:'火',火:'土',土:'金',金:'水',水:'木' }
export const WUXING_KE:   Record<string,string> = { 木:'土',土:'水',水:'火',火:'金',金:'木' }

export function getShiShen(riGan: string, targetGan: string): string {
  const riWx = GAN_WUXING[riGan], tgWx = GAN_WUXING[targetGan]
  const same = GAN_YANG[riGan] === GAN_YANG[targetGan]
  if (riWx === tgWx)              return same ? '比肩' : '劫财'
  if (WUXING_SHENG[riWx] === tgWx) return same ? '食神' : '伤官'
  if (WUXING_KE[riWx]   === tgWx) return same ? '偏财' : '正财'
  if (WUXING_SHENG[tgWx] === riWx) return same ? '偏印' : '正印'
  if (WUXING_KE[tgWx]   === riWx) return same ? '七杀' : '正官'
  return '未知'
}

// 日上起时法（五鼠遁元）：子时天干在 TIAN_GAN 中的索引
export const ZI_SHI_GAN_INDEX: Record<string, number> = {
  甲:0, 己:0, 乙:2, 庚:2, 丙:4, 辛:4, 丁:6, 壬:6, 戊:8, 癸:8,
}
// 年上起月法（五虎遁年）：寅月天干在 TIAN_GAN 中的索引
export const YIN_MONTH_GAN_INDEX: Record<string, number> = {
  甲:2, 己:2, 乙:4, 庚:4, 丙:6, 辛:6, 丁:8, 壬:8, 戊:0, 癸:0,
}
// 月令地支（以节为界，从寅月=正月开始）
export const MONTH_ZHI = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'] as const
```

### 11.2 `composables/useBaziCalc.ts` 主要导出

`currentDaYun` 和 `currentAge` 作为 `BaziChart` 的字段由此 composable 计算并返回，**不在任何 prompt 构建函数或模板字符串里做年龄/大运计算**。

```ts
export function useBaziCalc() {
  function calc(
    birthYear: number,
    birthMonth: number,      // 公历 1-12
    birthDay: number,
    birthHourDizhi: string | null,
    gender: 'male' | 'female',
  ): BaziChart {
    // ... 计算四柱、十神、藏干、五行分布、格局、大运 ...

    const currentAge = new Date().getFullYear() - birthYear
    const currentDaYun = dayuns.find(
      d => d.ageRange[0] <= currentAge && d.ageRange[1] >= currentAge
    ) ?? null

    return {
      year, month, day, hour,
      riZhu, riZhuStrength,
      wuxingScore, geju, xiyong, jishen,
      dayuns, qiyunAge,
      currentAge,
      currentDaYun,   // 直接可用，不需要调用方再算
    }
  }

  // 供表单实时显示干支（如"甲子年 丙寅月"）
  function dateToGanZhi(year: number, month: number, day: number): string { /* ... */ }

  return { calc, dateToGanZhi }
}
```

### 11.3 大运计算规则（`app/utils/bazi/dayun.ts`）

| 年干阴阳 | 性别 | 大运方向 |
|---------|------|----------|
| 阳年（甲丙戊庚壬） | 男 | 顺排 |
| 阳年 | 女 | 逆排 |
| 阴年（乙丁己辛癸） | 男 | 逆排 |
| 阴年 | 女 | 顺排 |

起运年龄：顺排从出生到下一个"节"天数 ÷ 3（四舍五入），逆排到上一个"节"。十二节：立春、惊蛰、清明、立夏、芒种、小暑、立秋、白露、寒露、立冬、大雪、小寒。每步大运管 10 年。

### 11.4 综合分析文本（`app/utils/bazi/analysisText.ts`）

以日干、身强弱、格局为 key 查表，返回对应文本段落。每段文本内嵌典籍引用，格式："根据《穷通宝典》……"。此文件只负责文本生成，不含计算逻辑。

### 11.5 AI 解读 Prompt（`composables/useBaziPrompt.ts`）

`currentDaYun` 直接从 `chart.currentDaYun` 读取，调用方无需做任何年龄推算：

```ts
export function useBaziPrompt() {
  function build(
    chart: BaziChart,
    profile: UserProfile,
    analysisSummary: string,    // BaziAnalysis.vue 的 getSummary() 返回值
  ): { systemPrompt: string; userPrompt: string } {

  const systemPrompt = `你是一位精通中国传统四柱八字命理的分析师，擅长将专业命理翻译成普通人易懂的语言。

输出要求：
1. 先输出 Markdown 格式的通俗解读（覆盖：性格特质、事业财运、感情婚姻、健康注意、人生建议），引用典籍时标注出处
2. 提出 3~5 条历史事件校准预测，格式：年龄 + 年份 + 一句话描述
3. 给出 3 条具体可执行的人生建议
4. 为 5 个维度打 0-100 分：感情运、事业运、财运、健康运、学业运
5. 为每步大运打 0-100 分
6. 语气积极，避免极端断语

最后输出一个 \`\`\`json 代码块（不要在 Markdown 内容里提及这个 JSON）：
{
  "dimensionScores": { "感情运":75, "事业运":82, "财运":68, "健康运":79, "学业运":71 },
  "dayunScores": [{"index":1,"ganZhi":"丁卯","ageRange":"5-14","score":65,"fortune":"平"}],
  "historicalPredictions": [{"age":25,"year":2015,"description":"应有事业方向的重大转变"}],
  "comprehensiveAdvice": ["建议一", "建议二", "建议三"]
}`

  const currentDaYunStr = chart.currentDaYun
    ? `${chart.currentDaYun.gan}${chart.currentDaYun.zhi}（${chart.currentDaYun.ageRange[0]}-${chart.currentDaYun.ageRange[1]}岁）`
    : '尚未起运'

  const userPrompt = `请为以下八字命盘进行 AI 解读：

姓名：${profile.name ?? '匿名'}
性别：${profile.gender === 'male' ? '乾造（男）' : '坤造（女）'}
出生：${profile.birthDate ?? '未知'}，当前年龄：${chart.currentAge}岁

四柱：年${chart.year.gan}${chart.year.zhi} 月${chart.month.gan}${chart.month.zhi} 日${chart.day.gan}${chart.day.zhi} 时${chart.hour ? chart.hour.gan + chart.hour.zhi : '未知'}
日主：${chart.riZhu}（${chart.riZhuStrength}）
格局：${chart.geju} | 喜用神：${chart.xiyong} | 忌神：${chart.jishen}
五行：木${chart.wuxingScore['木']}% 火${chart.wuxingScore['火']}% 土${chart.wuxingScore['土']}% 金${chart.wuxingScore['金']}% 水${chart.wuxingScore['水']}%
大运：${chart.dayuns.map(d => `${d.ageRange[0]}-${d.ageRange[1]}岁 ${d.gan}${d.zhi}`).join(' | ')}
当前大运：${currentDaYunStr}

专业综合分析摘要（供参考，请在此基础上进行通俗化 AI 解读）：
${analysisSummary}`

  return { systemPrompt, userPrompt }
  }

  return { build }
}
```

---

## 十二、周易八卦算命逻辑

### 12.1 起卦策略模式（可扩展）

**`app/utils/zhouyi/strategies/index.ts`**：

```ts
export interface GuaInput {
  birthYear: number
  birthMonth: number
  birthDay: number
  birthHourIndex: number    // 子=0, 丑=1, ..., 亥=11
  query: string
  currentHour?: number      // 起卦时刻的小时（梅花易数需要）
  currentMinute?: number
}

export interface GuaResult {
  benGuaId: number          // 本卦 1-64
  bianGuaId: number         // 变卦 1-64
  dongYao: number           // 动爻 1-6
  methodName: string        // 起卦方法名，用于 UI 展示说明
  calcDetail: string        // 起卦过程说明（供 UI 展示"如何起卦"）
}

export interface GuaStrategy {
  name: string
  calc(input: GuaInput): GuaResult
}
```

**`app/utils/zhouyi/strategies/meihuaMethod.ts`**（梅花易数，当前唯一实现）：

> **实现说明**：本项目采用"生辰梅花易数"变体——以用户出生年月日时起卦，而非传统梅花易数的"起卦当时时间"。这是一种常见的网络化改编，适合 Web 自动化场景（无需用户记录起卦时刻）。UI 中需注明"本卦采用生辰起卦法（梅花易数变体）"，避免懂行用户质疑。

```ts
export const meihuaMethod: GuaStrategy = {
  name: '梅花易数',

  calc({ birthYear, birthMonth, birthDay, birthHourIndex }) {
    // 年数：取年份后两位（如1990→90）或年份各位数字之和，传统用年份四位各位数字之和
    const yearSum = String(birthYear).split('').reduce((a, b) => a + Number(b), 0)

    // 上卦：(年数 + 月 + 日) % 8，余0取8
    const upperNum = ((yearSum + birthMonth + birthDay) % 8) || 8

    // 下卦：(年数 + 月 + 日 + 时辰序数) % 8，余0取8
    // 时辰序数：子=1, 丑=2, ..., 亥=12
    const hourSeq = birthHourIndex + 1
    const lowerNum = ((yearSum + birthMonth + birthDay + hourSeq) % 8) || 8

    // 动爻：(年数 + 月 + 日 + 时辰序数) % 6，余0取6
    const dongYao = ((yearSum + birthMonth + birthDay + hourSeq) % 6) || 6

    // 查卦（卦序对应：乾1 兑2 离3 震4 巽5 坎6 艮7 坤8）
    const benGua = LIUSHISI_GUA.find(g => g.shangGua === upperNum && g.xiaGua === lowerNum)!

    // 变卦：将 benGua 的第 dongYao 爻取反（从下往上数），重新查表
    const benYao = getYaoArray(benGua)  // 6位二进制爻组，index 0=初爻
    const bianYao = [...benYao]
    bianYao[dongYao - 1] = bianYao[dongYao - 1] === 1 ? 0 : 1
    const bianUpperNum = yaoToBaguaId(bianYao.slice(3))
    const bianLowerNum = yaoToBaguaId(bianYao.slice(0, 3))
    const bianGua = LIUSHISI_GUA.find(g => g.shangGua === bianUpperNum && g.xiaGua === bianLowerNum)!

    const calcDetail = `年数(${yearSum})+月(${birthMonth})+日(${birthDay})=${yearSum+birthMonth+birthDay}，` +
      `上卦序=${upperNum}（${BAGUA_NAMES[upperNum-1]}），` +
      `加时辰(${hourSeq})，下卦序=${lowerNum}（${BAGUA_NAMES[lowerNum-1]}），` +
      `动爻第${dongYao}爻`

    return {
      benGuaId: benGua.id,
      bianGuaId: bianGua.id,
      dongYao,
      methodName: '梅花易数',
      calcDetail,
    }
  }
}

const BAGUA_NAMES = ['乾','兑','离','震','巽','坎','艮','坤']
```

`useZhouyiCalc.ts` 默认使用 `meihuaMethod`，后期新增策略只需实现 `GuaStrategy` 接口并在 `useZhouyiCalc` 中提供切换入口。

### 12.2 六十四卦常量（`app/utils/zhouyi/constants.ts`）

**全部 64 条必须硬编码，不可留 `// ...` 占位**。每条格式：

```ts
{ id: number, name: string, shangGua: number, xiaGua: number, meaning: string, guaci: string }
```

`meaning`：现代中文卦义（2~4 字）。`guaci`：《周易》原文卦辞（公共领域）。

数据来源：《周易》通行本公共领域文本。64 条全部填入，示例（前 4 条）：

```ts
export const LIUSHISI_GUA = [
  { id:1,  name:'乾为天', shangGua:1, xiaGua:1, meaning:'刚健进取', guaci:'元亨利贞' },
  { id:2,  name:'坤为地', shangGua:8, xiaGua:8, meaning:'柔顺厚载', guaci:'元亨，利牝马之贞' },
  { id:3,  name:'水雷屯', shangGua:6, xiaGua:4, meaning:'初生艰难', guaci:'元亨利贞，勿用有攸往，利建侯' },
  { id:4,  name:'山水蒙', shangGua:7, xiaGua:6, meaning:'启蒙求知', guaci:'亨。匪我求童蒙，童蒙求我' },
  // ... 完整 64 条全部填入
] as const
```

---

## 十三、可视化图表组件规格

### `WuxingRadar.vue`（五行力量，排盘结果）

Chart.js Radar。5 维：木/火/土/金/水。配色：木`#4ade80`，火`#f97316`，土`#a3855a`，金`#e2c96a`，水`#60a5fa`。Props：`scores: WuxingScore`。

### `FortuneRadar.vue`（运势五维，AI 解读结果）

同 Radar 类型。5 维：感情运/事业运/财运/健康运/学业运。填充色：金色系半透明。Props：`scores: Record<string, number>`。

### `DayunCandle.vue`（大运运势蜡烛图）

Chart.js，X 轴各步大运年龄段，Y 轴 0-100 评分。蜡烛：评分 ≥ 60 金色（`#c9a227`），< 60 蓝灰（`#4a5568`）。当前大运高亮边框。Props：`dayuns: DaYun[]`（含 `score` 字段，AI 解读后才有值）。

---

## 十四、用户数据存储策略

纯客户端，无数据库无后端接口。

`@pinia-plugin-persistedstate/nuxt` 将 `profiles` store 自动序列化到 `localStorage`，key 为 `profiles`。SSR 阶段 store 为空，客户端水合后自动填充，无需额外处理。

`composables/useProfiles.ts`：

```ts
export function useProfiles() {
  const store = useProfilesStore()
  return {
    profiles: computed(() => store.list),
    defaultProfile: computed(() => store.defaultProfile),
    getById: (id: string) => store.list.find(p => p.id === id),
  }
}
```

---

## 十五、主题与设计规范

整体风格：深色主题，国风神秘感，现代数据可视化美学。

| 色彩用途 | 值 |
|---------|-----|
| 全局背景 | `#0a0a0f` |
| 正文 | `#e8e0d0` |
| 强调金（标题/高亮/BorderBeam/图表主色） | `#c9a227` |
| AI 解读相关元素 | `#8b5cf6` |
| 卡片背景 | `rgba(255,255,255,0.04)` |
| 蜡烛图吉运 | `#c9a227` |
| 蜡烛图凶运 | `#4a5568` |

**禁止**：红-紫-蓝渐变配色。

字体：中文系统字体栈（苹方 / 华文细黑 / 微软雅黑降级），标题可用 `Noto Serif SC` 衬线。

GlowCard 光晕扫边：金 `#c9a227` → 暖白 `#f5e6c0`，原生 CSS `conic-gradient` 实现，6s/圈。

---

## 十六、开发优先级与实现顺序

1. 项目初始化（`nuxt@4.4.2` + `@nuxt/ui@4.6.1`、环境变量、目录结构）
2. 常量表与排盘计算逻辑（`app/utils/bazi/`）— 核心，必须先做且做对
3. 通用组件（AppNav、AppFooter、GlowCard 原生 CSS 扫边、AiStreamCard、TianganDizhi）
4. `profiles` store + 用户档案管理页（ProfileCard、ProfileForm Modal）
5. Server 端 AI 代理（`server/api/ai/stream.post.ts`，支持 ollama/openai 双格式）
6. 四柱八字详情页：
   - 阶段 1：BaziForm（档案预填 + 新用户引导）
   - 阶段 2：动画（TianganDizhi full）
   - 阶段 3：三 Tab，**AI 解读为默认**，含等待期 BaziPanPreview + streaming 切换
7. 可视化图表组件（WuxingRadar、FortuneRadar、DayunCandle）
8. 综合分析文本模板（`analysisText.ts`）— **先手动验证质量再动工，不达预期则改为 AI 生成**
9. 分享功能（`useShare.ts`，口语化钩子文案）
10. 首页（含新用户引导 Banner + 流年留存钩子）
11. 工具列表页
12. 周易八卦详情页（含 HexagramSpin、梅花易数变体说明、64 卦完整常量）
13. 使用条款页 / 隐私说明页

---

## 十七、边界情况处理（必须实现）

| 情况 | 处理方式 |
|------|----------|
| 时辰未知 | 时柱显示"—"，卡片警告"⚠ 七字分析，时柱推断仅供参考" |
| 出生在节气交界日 | 提示"出生于节气交界日，月柱可能为 X 或 Y，以下按 X 分析" |
| 立春前后出生 | 精确判断年柱归属，必要时提示用户确认 |
| 夜子时（23:00-24:00） | 日柱归次日，页面注明"采用早晚子时法" |
| AI 请求失败 | 显示错误信息 + "重试"按钮，`TianganDizhi` 动画继续播放直到重试或用户放弃 |
| AI 输出 JSON 解析失败 | 只显示文本内容，不渲染图表，控制台 warn，不对用户报错 |
| profiles 列表为空 | 算命页档案区隐藏，显示"[前往设置]创建档案"，表单仍可手填 |
| 删除默认档案 | 列表非空时自动将第一个设为默认；清空后 defaultProfile 返回 null |
| 档案标签重复 | ProfileForm 保存时校验（`isLabelUnique`），内联显示错误，阻止提交 |
| 表单手动修改字段 | 不触发档案写回，仅在显式点"保存到当前档案"时才更新 |
| 重新推演 | 保留 `lastFormValues` 回填表单，清空 `chart`/`aiResult`/`aiStream`，AI 下次切 Tab 时重新请求 |
| `html2canvas` 失败 | Toast 提示"截图失败，请手动截图"，不崩溃 |
| 剪贴板 API 不可用 | 降级：将分享文案显示在 Dialog 内供用户手动复制 |

---

## 十八、SEO 与 Meta

每个页面 `useSeoMeta()` 配置 title 和 description。Search Engine Verification 通过 `useHead()` 注入 meta 标签读取环境变量。nuxt-security 的 CSP 不阻断爬虫：生产开启 `upgrade-insecure-requests`，开发禁用。

---

*END OF PRD*
