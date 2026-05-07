# luckbuff 开发计划

> 由 PRD 拆解而来，按实现顺序排列，共 13 个阶段。每阶段标注关键文件、依赖与验收要点。

---

## 阶段 1：项目初始化

**目标**：搭好 Nuxt 4 骨架，装完依赖，跑通首页 Hello World。

| 任务 | 说明 | 关键文件 |
|------|------|----------|
| 1.1 初始化 Nuxt | `npx nuxi@latest init .` 或手动配 package.json | `package.json` |
| 1.2 安装依赖 | 按 PRD 执行 `pnpm add` 命令 | — |
| 1.3 配 nuxt.config.ts | compatibilityVersion 4、modules、runtimeConfig、security | `nuxt.config.ts` |
| 1.4 配环境变量 | 开发 .env + .env.example | `.env`, `.env.example` |
| 1.5 全局 CSS | `app/assets/css/main.css`：@import @nuxt/ui、配色变量、GlowCard 动画 | `app/assets/css/main.css` |
| 1.6 跑通首页 | `app/pages/index.vue` 放个 Hello World，验证热更新 | `app/pages/index.vue` |
| 1.7 SEO 基础 | 全局 useSeoMeta + favicon | `public/favicon.ico` |

**依赖**：无
**验收**：`pnpm dev` 能跑，首页能打开，GlowCard 扫边动画在 dev tools 可见。

---

## 阶段 2：常量表与排盘计算逻辑（核心）

**目标**：八字排盘的所有纯计算逻辑必须正确，这是整栋楼的地基。

| 任务 | 说明 | 关键文件 |
|------|------|----------|
| 2.1 天干地支常量 | 天干、地支、五行、阴阳、藏干、十神规则 | `app/utils/bazi/constants.ts` |
| 2.2 万年历/节气 | 公历转干支、节气判断、日柱归属 | `app/utils/bazi/calendar.ts` |
| 2.3 四柱排盘 | 年柱、月柱、日柱、时柱（含早晚子时） | `app/utils/bazi/pillars.ts` |
| 2.4 大运计算 | 顺逆排规则、起运年龄、步运年龄范围 | `app/utils/bazi/dayun.ts` |
| 2.5 十神计算 | 藏干十神、各柱十神标注 | `app/utils/bazi/shishen.ts` |
| 2.6 useBaziCalc | 组合以上工具，暴露 `calc()` 和 `dateToGanZhi()` | `app/composables/useBaziCalc.ts` |
| 2.7 边界自测 | 节气交界、夜子时、时辰未知、立春前后 | — |

**依赖**：阶段 1
**验收**：用多个已知命盘（如 1990-05-20 午时男命）手算对比，四柱+大运完全匹配。所有边界情况有正确提示。

---

## 阶段 3：通用组件（UI 骨架）

**目标**：把整站都会用到的组件一次性做对，后续页面直接拼。

| 任务 | 说明 | 关键文件 |
|------|------|----------|
| 3.1 GlowCard | conic-gradient + @property 扫边，无第三方依赖 | `app/components/common/GlowCard.vue` |
| 3.2 AppNav | Logo + 导航链接 + 移动端汉堡 | `app/components/common/AppNav.vue` |
| 3.3 AppFooter | 简洁页脚 | `app/components/common/AppFooter.vue` |
| 3.4 AiStreamCard | marked 渲染 + 光标闪烁 | `app/components/common/AiStreamCard.vue` |
| 3.5 TianganDizhi | 同心圆旋转动画，size=full/compact | `app/components/animations/TianganDizhi.vue` |
| 3.6 HexagramSpin | 八卦符号旋转盘 | `app/components/animations/HexagramSpin.vue` |
| 3.7 default layout | 包裹 Nav + Footer + `<slot />` | `app/layouts/default.vue` |

**依赖**：阶段 1
**验收**：每个组件在 Storybook 式独立页面可预览（临时写个 test.vue 也行），动画流畅无卡顿。

---

## 阶段 4：用户档案系统

**目标**：多档案增删改查 + localStorage 持久化。

| 任务 | 说明 | 关键文件 |
|------|------|----------|
| 4.1 类型定义 | UserProfile、TianGan、DiZhi、SHICHEN_OPTIONS | `app/types/user.ts` |
| 4.2 Pinia Store | profiles 列表、defaultProfile、增删改查 + 标签唯一校验 | `app/stores/profiles.ts` |
| 4.3 useProfiles | 封装 store 读取 | `app/composables/useProfiles.ts` |
| 4.4 ProfileCard | 展示档案信息 + 编辑/删除/设默认 | `app/components/settings/ProfileCard.vue` |
| 4.5 ProfileForm | Dialog 内表单，新建/编辑复用，实时干支提示 | `app/components/settings/ProfileForm.vue` |
| 4.6 档案管理页 | 网格列表 + 新建按钮 | `app/pages/settings.vue` |

**依赖**：阶段 1、3
**验收**：刷新页面档案不丢；标签重复时内联报错；删除默认档案后自动指认下一个；生日选择后实时显示干支。

---

## 阶段 5：AI 服务端代理

**目标**：所有 AI 请求走 server 代理，支持 ollama/openai 双格式零代码切换。

| 任务 | 说明 | 关键文件 |
|------|------|----------|
| 5.1 stream.post.ts | 根据 AI_PROVIDER 构造不同请求体，SSE 转发 | `app/server/api/ai/stream.post.ts` |
| 5.2 useAiStream | 前端 SSE 消费，兼容 Ollama / OpenAI 两种流格式 | `app/composables/useAiStream.ts` |
| 5.3 联调测试 | 本地 Ollama 跑通一次完整流式输出 | — |

**依赖**：阶段 1
**验收**：切换 .env 中 AI_PROVIDER 值，不改动代码，流式输出都能正常到达前端。

---

## 阶段 6：四柱八字详情页 — 阶段 1 & 2（表单 + 动画）

**目标**：用户能输入/选择档案，点击推演后进入动画。

| 任务 | 说明 | 关键文件 |
|------|------|----------|
| 6.1 BaziForm | 性别/生日/时辰/姓名/曾用名/地点，档案 Badge 预填 | `app/components/bazi/BaziForm.vue` |
| 6.2 表单状态 | lastFormValues 快照、保存到档案按钮逻辑 | `app/pages/tools/bazi.vue` |
| 6.3 推演动画 | TianganDizhi full，最少 1.5s，后台 calc 并行 | `app/pages/tools/bazi.vue` |
| 6.4 页面状态机 | phase: 'form' \| 'animating' \| 'result' | `app/pages/tools/bazi.vue` |

**依赖**：阶段 2、3、4、5
**验收**：选档案自动填表；手动改表不自动写回档案；点击推演必播 1.5s 动画；动画期间排盘已算完。

---

## 阶段 7：四柱八字详情页 — 阶段 3（三 Tab 结果）

**目标**：AI 解读（默认）+ 排盘计算 + 综合分析。

| 任务 | 说明 | 关键文件 |
|------|------|----------|
| 7.1 BaziPan | 四柱表 + 十神 + 藏干 + 时柱未知警告 | `app/components/bazi/BaziPan.vue` |
| 7.2 BaziDayunTable | 大运表格，当前高亮 | `app/components/bazi/BaziDayunTable.vue` |
| 7.3 BaziPanPreview | 仅四柱 + 当前大运，AI 等待期展示 | `app/components/bazi/BaziPanPreview.vue` |
| 7.4 BaziAnalysis | 六大维度 GlowCard，纯前端文本模板 | `app/components/bazi/BaziAnalysis.vue` |
| 7.5 analysisText.ts | 固定文本模板库，内嵌典籍引用 | `app/utils/bazi/analysisText.ts` |
| 7.6 BaziPrompt.ts | systemPrompt + userPrompt 构建 | `app/components/bazi/BaziPrompt.ts` |
| 7.7 BaziAiInterpret | AI Tab：等待期 preview → streaming → 图表 | `app/components/bazi/BaziAiInterpret.vue` |
| 7.8 三 Tab 整合 | UTabs 切换，AI 只请求一次，切回不重复 | `app/pages/tools/bazi.vue` |

**依赖**：阶段 2、3、5、6
**验收**：排盘数据与手算一致；AI 解读进入 result 立即触发；等待期有 preview 可看；JSON 解析失败时不崩，只展示文本；Tab 自由切换不卡。

> ⚠ **质量关卡**：阶段 7.5 `analysisText.ts` 完成后，必须手动验证文本质量。若质量不达标，改由 AI 生成，analysisText 降级为 prompt 素材。

---

## 阶段 8：可视化图表

**目标**：三个 Chart.js 图表组件可用。

| 任务 | 说明 | 关键文件 |
|------|------|----------|
| 8.1 WuxingRadar | 五行力量雷达图 | `app/components/charts/WuxingRadar.vue` |
| 8.2 FortuneRadar | 运势五维雷达图 | `app/components/charts/FortuneRadar.vue` |
| 8.3 DayunCandle | 大运评分蜡烛图 | `app/components/charts/DayunCandle.vue` |

**依赖**：阶段 1
**验收**：每个图表在 demo 数据下渲染正确，配色符合 PRD 规范，无报错。

---

## 阶段 9：分享功能

**目标**：一键分享 = 文案复制 + 截图下载 + Toast。

| 任务 | 说明 | 关键文件 |
|------|------|----------|
| 9.1 useShare | html2canvas 截图 + 水印 + 剪贴板 + 降级 Dialog | `app/composables/useShare.ts` |
| 9.2 data-share-target | 在 BaziPan 容器加属性 | `app/components/bazi/BaziPan.vue` |
| 9.3 底部操作区 | 重新推演 / 一键分享 / 回到首页 | `app/pages/tools/bazi.vue` |

**依赖**：阶段 3、7
**验收**：点击分享后剪贴板有文案、图片有水印并自动下载；html2canvas 失败时 Toast 提示不崩溃。

---

## 阶段 10：首页

**目标**：新用户第一眼看到的页面，要有留存钩子。

| 任务 | 说明 | 关键文件 |
|------|------|----------|
| 10.1 Hero | 全屏深色背景 + 主副标题 + CTA | `app/pages/index.vue` |
| 10.2 新用户 Banner | localStorage 无档案时显示，可关闭 | `app/pages/index.vue` |
| 10.3 Why Us | 4 个 GlowCard 特性介绍 | `app/pages/index.vue` |
| 10.4 工具预览 | 2 个工具卡片 + 预留位 | `app/pages/index.vue` |
| 10.5 FAQ | Accordion 5~8 条 | `app/pages/index.vue` |
| 10.6 流年速览 | 有默认档案时展示当年干支概览 | `app/pages/index.vue` |

**依赖**：阶段 3、4
**验收**：首次访问显示 Banner；有默认档案时底部流年区块正确显示；无档案时隐藏。

---

## 阶段 11：工具列表页

**目标**：简单网格，2 工具 + 预留位。

| 任务 | 说明 | 关键文件 |
|------|------|----------|
| 11.1 工具列表 | 3 列网格，GlowCard，角标"即将上线" | `app/pages/tools/index.vue` |

**依赖**：阶段 3
**验收**：点击卡片跳转到对应工具页。

---

## 阶段 12：周易八卦详情页

**目标**：起卦 → 动画 → 四张结果卡片 + AI 断语。

| 任务 | 说明 | 关键文件 |
|------|------|----------|
| 12.1 周易常量 | 64 卦全部硬编码（不可留占位） | `app/utils/zhouyi/constants.ts` |
| 12.2 策略接口 | GuaStrategy + GuaInput + GuaResult | `app/utils/zhouyi/strategies/index.ts` |
| 12.3 梅花易数 | 生辰起卦变体，注明非传统时间起卦 | `app/utils/zhouyi/strategies/meihuaMethod.ts` |
| 12.4 useZhouyiCalc | 封装起卦逻辑 | `app/composables/useZhouyiCalc.ts` |
| 12.5 ZhouyiForm | 输入表单 + 诉求文本域 | `app/components/zhouyi/ZhouyiForm.vue` |
| 12.6 ZhouyiResult | 起卦/排爻/断卦/AI 断语 四卡片 | `app/components/zhouyi/ZhouyiResult.vue` |
| 12.7 ZhouyiPrompt.ts | AI 断语 prompt 构建 | `app/components/zhouyi/ZhouyiPrompt.ts` |
| 12.8 页面整合 | 状态机 + 动画 + 分享 | `app/pages/tools/zhouyi.vue` |

**依赖**：阶段 3、4、5
**验收**：64 卦常量无缺漏；梅花易数计算过程可展示；AI 断语等待期有 HexagramSpin 动画。

---

## 阶段 13：静态页与收尾

**目标**：法律免责 + 最终检查 + 部署准备。

| 任务 | 说明 | 关键文件 |
|------|------|----------|
| 13.1 使用条款 | /terms，标准免责声明 | `app/pages/terms.vue` |
| 13.2 隐私说明 | /privacy，标准隐私文本 | `app/pages/privacy.vue` |
| 13.3 全局路由检查 | 所有页面链接可点、404 页面友好 | — |
| 13.4 生产环境验证 | nuxt-security CSP、runtimeConfig 读取正确 | — |
| 13.5 构建测试 | `pnpm build` 通过，无类型错误 | — |

**依赖**：全部前置阶段
**验收**：`pnpm build` 成功；生产环境变量注入后 AI 代理正常。

---

## 快速参考：依赖图

```
阶段 1（初始化）
  ├─→ 阶段 2（排盘算法） ──→ 阶段 6/7（八字页）
  ├─→ 阶段 3（通用组件） ──→ 阶段 4（档案） ──→ 阶段 6/7/10
  ├─→ 阶段 5（AI 代理） ──→ 阶段 7（AI Tab）/ 阶段 12
  ├─→ 阶段 8（图表） ──→ 阶段 7
  ├─→ 阶段 9（分享） ──→ 阶段 7
  ├─→ 阶段 10（首页）
  ├─→ 阶段 11（工具列表）
  ├─→ 阶段 12（周易页）
  └─→ 阶段 13（收尾）
```

---

## 推荐开发节奏

| 周期 | 阶段 | 产出物 |
|------|------|--------|
| Day 1 | 1 + 2 | 项目跑通 + 排盘算法正确 |
| Day 2 | 3 + 4 | 所有通用组件 + 档案系统可用 |
| Day 3 | 5 + 6 | AI 代理联调 + 八字表单/动画完成 |
| Day 4 | 7 + 8 | 三 Tab 结果 + 图表渲染 |
| Day 5 | 9 + 10 + 11 | 分享 + 首页 + 工具列表 |
| Day 6 | 12 | 周易完整页面 |
| Day 7 | 13 | 静态页 + 构建 + 部署 |

---

*计划生成时间：2026-04-24*
