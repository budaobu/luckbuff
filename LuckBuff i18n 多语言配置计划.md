# LuckBuff i18n 多语言配置计划

## 背景

项目当前无任何 i18n 基础设施，所有 UI 文本为硬编码中文。需要支持简体中文(zh-CN)、繁体中文(zh-TW)、英文(en)三语言。

## 代码库现状

- **50+ Vue 文件**（pages + components），**14+ TS 文件**（composables + stores）
- `@nuxt/ui` 硬编码 `zh_cn` locale
- 无 `@nuxtjs/i18n` 模块
- 文本分布：
  - UI chrome（导航、按钮、标签、提示）— 约 200+ 处
  - 命理专业术语（十神、星曜、卦名、宫位等）— 约 500+ 处
  - AI system prompts — 4 个大文件
  - utils 数据层（卦辞、星曜性格描述、策略建议等）— 数千行

## 用户已确认的关键决策

| # | 问题 | 用户选择 |
|---|---|---|
| 1 | 命理专业术语是否翻译？ | **UI 全译，术语保留中文** — 十神、星曜、卦名、宫位等专有名词在所有 locale 下保持中文 |
| 2 | AI Prompt 语言策略？ | **Prompt 也做 locale-aware** — 英文用户请求英文 AI 输出，需重构 prompt 系统 |
| 3 | utils 数据文件范围？ | **Phase 1 只翻译 UI** — utils 文化数据层（卦辞、星曜描述等）保持不变 |
| 4 | zh-TW 与 zh-CN 关系？ | **繁简转换生成** — zh-TW 从 zh-CN 繁简转换，人工校对术语差异 |

## 最终方案

若用户确认以上推荐选项，执行方案如下：

### Phase 1: 基础设施
1. `pnpm add @nuxtjs/i18n`
2. 配置 `nuxt.config.ts`：注册模块、定义 locales（zh-CN, zh-TW, en）、默认语言、策略
3. 创建 `app/i18n/i18n.config.ts` 和 `app/i18n/locales/zh-CN.json`、`zh-TW.json`、`en.json`
4. 更新 `app.vue`：移除硬编码 `zh_cn`，改为 `useI18n().locale` 动态绑定 Nuxt UI locale
5. 添加语言切换器组件（AppNav 右上角）

### Phase 2: UI Chrome 提取（按页面/组件分批替换硬编码中文 → `$t()`）
按优先级分批次：
1. **全局布局** — AppNav.vue, AppFooter.vue, error.vue, default.vue
2. **首页** — index.vue（Hero、CTA、Feature Cards、FAQ、SEO）
3. **工具列表页** — tools/index.vue
4. **档案管理** — settings.vue, ProfileForm.vue, ProfileCard.vue
5. **各工具表单** — BaziForm.vue, ZhouyiForm.vue, ZwdsForm.vue, ZwdsForm.vue
6. **结果与解读** — BaziPan, ZhouyiResult, ZwdsPan, AI 解读组件等
7. **通用交互** — useShare.ts（toast、分享文案）, useGeolocation.ts

### Phase 3: AI Prompt 多语言
重构 4 个 prompt composable：
- `useBaziPrompt.ts`
- `useZhouyiPrompt.ts`
- `useZwdsPrompt.ts`
- `useLiuYaoPrompt.ts`

每个 prompt 文件根据 `useI18n().locale.value` 返回对应语言的 system prompt。命理术语保持中文，解读要求用语切换。

### Phase 4: 路由与 SEO
1. 配置 i18n 路由策略（`prefix_except_default`，默认 zh-CN 无前缀）
2. 所有 `useSeoMeta` 调用改为 `useI18n` + 动态翻译
3. `<html lang>` 属性动态绑定

### Phase 5: zh-TW 生成
1. 用繁简转换从 zh-CN 自动生成 zh-TW 初稿
2. 人工校对两岸术语差异（网络/網路、软件/軟體等）

### 关键文件列表
- `nuxt.config.ts` — 模块注册
- `app/app.vue` — locale 动态绑定
- `app/components/AppNav.vue` — 添加语言切换
- `app/i18n/locales/*.json` — 翻译文件
- `app/i18n/i18n.config.ts` — i18n 配置
- 所有 pages/*.vue 和 components/*.vue — 替换硬编码文本
