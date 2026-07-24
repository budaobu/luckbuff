# 命见栏目多语言文章 — admin 发布与管理方案（设计文档）

> 状态：待确认 → 确认后按本文档实施
> 前置结论（已与需求方对齐）：
> 1. 繁体中文：**发布时 OpenCC 落盘**（生成真实 `.zh-tw.md` 文件，可备份、可手动微调）
> 2. 英文版 SEO 字段（title/description/tags）：**AI 自动翻译**
> 3. admin 管理深度：**完整版**（每篇文章三语言状态 + 在线编辑英文版 + 手动重新生成）
> 4. 交付方式：先设计文档 → 确认后实现

---

## 0. 现状摘要（代码事实）

| 事实 | 位置 |
|---|---|
| 文章 = `content/insights/{slug}.md`，运行时 fs 直读，不走 @nuxt/content | `server/utils/insights.ts:4` |
| 语言后缀约定已存在：`{slug}.en.md` / `{slug}.zh-tw.md`，缺文件时回退简中 | `insights.ts:109-113, 153-166` |
| admin 是单文件 SPA（登录/列表/编辑三视图），cookie session 认证 | `app/pages/admin.vue`，`server/utils/insights-admin-auth.ts` |
| 保存只写简中 `{slug}.md`，写前自动备份到 `.backups/`，tmp+rename 原子替换 | `insights.ts:201-214` |
| 已有非流式 AI 调用 `callAIJson(system, user)`，gptniux/OpenAI 兼容，server-side only | `server/utils/ai/client.ts:7` |
| `opencc-js@^1.3.1` 已在 dependencies，现用于五格笔画（懒加载 `import('opencc-js')`） | `server/utils/wuge/strokes.ts:297-316` |
| 前台详情/列表 API 按 `?lang=` 选文件并回退简中，已有 30s CDN 缓存头 | `server/api/insights/[slug].get.ts`，`index.get.ts` |
| sitemap 运行时 source 已带 `_i18nTransform: true`，三语言 URL 自动产出 | `server/api/__sitemap__/insights-urls.ts` |
| 部署：`content/insights/` rsync **无 --delete**（线上为准），`.backups/` 排除 | `scripts/deploy.sh` |

**关键推论**：文件命名约定、前台回退读取、sitemap 三语言产出**都已就位**。本次迭代只补齐「生成」与「管理」两段，不动前台读取链路的主干。

---

## 1. 总体流程

```
编辑在 admin 写文章（只有简中一份）
        │
   点「发布上线」/「存为草稿」  ← 翻译触发只挂在这两个明确动作上
        │
        ├─ 1. 写简中 {slug}.md（现有逻辑不变，先备份再原子写）
        │
        ├─ 2. 同步：OpenCC 简→繁
        │      hash 比对（见 §3）→ 变了才重写 {slug}.zh-tw.md
        │      繁中若被 locked → 跳过生成，状态标「原文已更新」
        │
        └─ 3. 异步（fire-and-forget，不阻塞保存响应）：
               英文 hash 比对 → 变了且未 locked → 调 AI 翻译
               → 写 {slug}.en.md（含翻译后的 title/description/tags）
               翻译中状态落 .translations/{slug}.json，admin 轮询可见
```

- **草稿也走同一管线**（draft 标记同步进译文文件，前台 `article.draft` 过滤已有，不会泄露）。
- **删除文章**时三语言文件一并删除（各自先备份）。
- 英文 AI 翻译失败 → 状态标 `failed` + 错误信息，前台自动回退简中（现有逻辑），admin 列表显示失败可重试。**绝不阻塞简中保存**。

---

## 2. 文件与 frontmatter 契约

### 2.1 磁盘布局（不变的部分省略）

```
content/insights/
  {slug}.md            # 简中（源）
  {slug}.zh-tw.md      # 繁中（OpenCC 生成或人工修改）
  {slug}.en.md         # 英文（AI 生成或人工修改）
  .backups/            # 现有备份目录，三语言文件共用同一套备份逻辑
  .translations/       # 新增：翻译状态目录（部署时 rsync 排除，见 §8）
    {slug}.json
```

### 2.2 译文文件 frontmatter（新增 4 个键，其余字段照常）

```yaml
---
title: "...(该语言的标题)"
description: "..."
category: "fengshui"          # 分类 slug 三语言一致，不翻译
tags: [...]                   # 该语言的关键词
publishedAt: "..."            # 与源文一致
updatedAt: "..."
author: "幽默隐士"             # 繁中由 OpenCC 转；英文由 AI 译（术语表固定 Hermit Humor）
readingTime: 5                # 与源文一致
draft: false                  # 与源文一致
relatedTools: [office-fengshui]
translated_from: "sha1:9f3c2ab1…"   # 生成时源内容的指纹（§3）
translated_at: "2026-07-24T02:30:00.000Z"
locked: false                 # 人工在线编辑后由系统自动置 true
generator: "opencc"           # 或 "ai:gptniux/claude-opus-4-6"；人工编辑后追加 "+manual"
---
```

**对现有代码的影响**：`parseFrontmatter` 是逐行 `key: value` 解析，新增键天然兼容；`toInsight()` 目前会**丢弃**未知键 —— 需要扩展 `InsightFrontmatter` 接口携带这 4 个可选键，否则 admin 读不到状态。`serializeFrontmatter` 目前是固定字段列表，需要改为「固定字段 + 透传扩展键」，避免人工编辑译文时丢掉 `translated_from`。

### 2.3 状态文件 `.translations/{slug}.json`

这是**运行时状态**，不进 git、不部署（§8），丢了可随时重建（重建规则：文件存在 + `translated_from` 在 → 视为 `done`）。

```json
{
  "zh-TW": { "status": "done",      "hash": "sha1:…", "updatedAt": "…" },
  "en":    { "status": "translating", "hash": "sha1:…", "updatedAt": "…",
             "error": null }
}
```

`status` 枚举：`translating | done | stale | locked-stale | failed`

- `stale`：源 hash ≠ 译文 `translated_from`，且未锁定（下次发布会自动重翻；也允许手动点「重新生成」）
- `locked-stale`：源已更新但译文被人工锁定，**不再自动覆盖**，只提示
- `failed`：上次 AI 调用失败，带 `error` 摘要，可手动重试

**为什么 hash 同时存两处**：frontmatter 里的 `translated_from` 是真相之源（随文件走、可被人工核对）；状态文件只是加速列表页展示的缓存 + 记录 `translating/failed` 这类瞬时状态。两者冲突时以 frontmatter 为准重建状态。

---

## 3. 指纹（hash）规则

```
sourceHash = sha1( title + "\n" + description + "\n" + tags.join(",")
                 + "\n" + content + "\n" + category )
```

- **纳入**：title / description / tags / content / category —— 任何一项变化都会导致译文内容过期。
- **不纳入**：publishedAt、updatedAt、author、readingTime、relatedTools、draft —— 这些是元数据，变化时直接把新值**拷进**译文文件 frontmatter（不重翻正文），draft 还要同步进去保证前台过滤一致。
- 算法用 Node 内置 `crypto.createHash('sha1')`，无新依赖。

### 保存时的判定矩阵（对 zh-TW / en 各执行一次）

| 条件 | 动作 |
|---|---|
| 译文文件不存在 | 生成（zh-TW 同步 OpenCC；en 入异步队列） |
| `locked: true` 且 hash 变了 | 不碰正文，状态置 `locked-stale`；仅同步元数据字段 |
| `locked: true` 且 hash 没变 | 仅同步元数据 |
| 未锁定且 hash 变了 | 重新生成 |
| 未锁定且 hash 没变 | 仅同步元数据（省一次 AI 调用） |

---

## 4. 英文翻译流水线

### 4.1 调用方式

复用 `callAIJson`（`server/utils/ai/client.ts`），但有两个现状差距要补：

1. **超时**：现 15s，翻一篇 2000 字文章不够 → 给 `callAIJson` 加可选 `opts.timeoutMs`（默认保持 15s 不动现有调用方），翻译传 120s。
2. **max_tokens**：`aiMaxTokens` 默认 8192 够大多数文章；翻译时按源文长度 `max(4096, ceil(源文字符数 × 1.2))` 估算传入，同样需要 `opts` 透传。这两个改动是向后兼容的签名扩展。

### 4.2 Prompt 设计（system + user 两段）

**system**（稳定部分，利于 prompt 缓存）：

```
你是「命见」栏目的专职译者，把简体中文命理/风水/术数类文章翻译成英文。
要求：
1. 输出且仅输出一个 JSON 对象：{"title": "...", "description": "...", "tags": [...], "content": "..."}
2. content 完整保留原文的 Markdown 结构（标题层级、列表、引用、分隔线、图片语法、链接 URL 一律不动），只翻译文字。
3. description 是 SEO 摘要，≤160 字符，自然流畅，不逐字直译。
4. tags 翻译成英文关键词，数量与原文一致。
5. 专有名词严格使用下表译法，不得自创：
   —— 术语表（见 §4.3）——
6. 语体：专业但可读，面向对中华命理感兴趣的英语读者；首次出现的术语用「拼音 (English gloss)」形式，如 BaZi (Four Pillars of Destiny)。
7. 文中中文标点全部转为英文标点；人名、地名用拼音。
```

**user**（每篇不同）：

```
title: ...
description: ...
tags: [...]
content:
<正文 markdown>
```

**可靠性措施**：
- `callAIJson` 已剥 ```json 围栏；再补一层：解析失败时做一次「截取首尾花括号」重试，仍失败则整次标记 `failed`（不自动重试第二次，避免成本失控；admin 可手动重试）。
- **结构校验**：翻译结果的 content 与源文做粗校验 —— Markdown 图片语法数量、链接 URL 集合必须一致（防止 AI 漏图/改链接）；不一致标记 `failed` 并保留错误说明。
- 成功写入后 `translated_from = 当前 sourceHash`，`generator = "ai:<provider>/<model>"`。

### 4.3 术语表

新建 `server/utils/insights/glossary.ts`，导出一个 `Array<[中文, 英文]>`，翻译时拼进 system prompt。初始内容从 `i18n/en.json` 已有命名空间提取（八字 BaZi、紫微斗数 Zi Wei Dou Shu、六爻 Liu Yao、奇门遁甲 Qi Men Dun Jia、风水 Feng Shui、财位 Wealth Position、幽默隐士 Hermit Humor、命见 MingJian Insights 等，实施时以 en.json 实际用词为准）。**只增不改**，与 i18n 铁律同原则。

### 4.4 异步执行

Nitro 里直接 `event.waitUntil(translateEn(slug))`（Cloudflare 语义）在 Node preset 下不可靠；Node 环境的惯用做法是**不带 await 的 Promise + catch**（进程内 fire-and-forget）。可接受的理由：

- 部署目标是 PM2 长驻 Node 进程，保存响应返回后进程不会退出，Promise 会跑完。
- PM2 reload 恰好打断在途翻译 → 状态停在 `translating`，admin 状态页提供「重置为可重试」按钮（或列表页检测 translating 超过 10 分钟自动视为 failed）。
- 同一 slug 的翻译用进程内 `Map<slug, Promise>` 做互斥，防止编辑连点两次发布触发并发翻译写竞态。

---

## 5. 繁中流水线（OpenCC）

- 复用 `opencc-js` 懒加载模式：`OpenCC.Converter({ from: 'cn', to: 'tw' })`。
  - **用 `tw` 不用 `twp`**：现有五格笔画用 `twp` 是因为笔画计算需要台湾字形；文章面向读者阅读，`tw` 只做字形转换、不做词汇转换（「软件→軟體」这类港台用词漂移对大陆背景作者的命理文章反而是错的）。这是和现有用法有意的差异，注释里写明原因。
- 同步执行（单篇文章毫秒级），无需异步。
- frontmatter 处理：title/description/tags/author 逐字段过转换器；category/publishedAt/relatedTools 原样拷贝；`translated_from` / `translated_at` / `generator: "opencc"` 写入。
- 繁中同样参与 §3 的锁定与 hash 判定（人工改过繁中用词 → 在线编辑保存时自动 `locked: true`）。

---

## 6. Server API 改动清单

### 6.1 新增/修改的公共 utils

| 文件 | 改动 |
|---|---|
| `server/utils/insights.ts` | `InsightFrontmatter` 增加 4 个可选翻译键；`serializeFrontmatter` 支持透传扩展键；新增 `readInsightRaw(slug, lang)`（保留完整 meta）、`writeInsightTranslation(slug, lang, data)`（复用备份+原子写）；`deleteInsight` 级联删三语言文件；`listInsightBackups` 支持按语言列备份 |
| `server/utils/insights/hash.ts`（新） | `computeSourceHash(input)` |
| `server/utils/insights/translation-state.ts`（新） | 状态文件读写、从 frontmatter 重建状态、`getTranslationOverview(slug)` 返回 `{ 'zh-TW': {...}, en: {...} }` |
| `server/utils/insights/translate.ts`（新） | OpenCC 繁中生成 + AI 英文翻译（prompt、结构校验、异步入口、互斥 Map） |
| `server/utils/insights/glossary.ts`（新） | 术语表 |
| `server/utils/ai/client.ts` | `callAIJson` 增加可选 `opts: { timeoutMs?, maxTokens? }`，默认行为不变 |

### 6.2 admin API（全部保持 cookie session 认证前置）

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/admin/insights` | POST（改） | 保存简中后走 §3 判定矩阵：繁中同步生成、英文 fire-and-forget。响应增加 `translations` 概览，前端立刻能显示「英文翻译中」 |
| `/api/admin/insights/[slug]` | PUT（改） | 同上 |
| `/api/admin/insights/[slug]` | DELETE（改） | 级联删除三语言文件 + 状态文件 |
| `/api/admin/insights` | GET（改） | 列表项增加 `translations: { 'zh-TW': {status}, en: {status} }` |
| `/api/admin/insights/[slug]` | GET（改） | 响应增加 `translations` 概览（含 hash、updatedAt、error） |
| `/api/admin/insights/[slug]/translations/[lang]` | GET（新） | 读某语言版本完整内容（含锁定标记），lang ∈ `en` / `zh-tw` |
| 同上 | PUT（新） | 保存人工编辑的译文。校验后写盘，**自动置 `locked: true`**，`generator` 追加 `+manual`；返回更新后状态 |
| 同上 | POST（新，`action: regenerate`） | 手动重新生成：清除 locked，按当前源 hash 走一遍生成（en 异步、zh-tw 同步）。也用于 failed 重试、locked-stale 解锁覆盖 |

### 6.3 前台 API（基本不动）

- `[slug].get.ts` / `index.get.ts`：读取与回退逻辑已有，零改动。
- 唯一要小改的：译文 frontmatter 里的 `draft` 现在有了真实值，前台过滤 `article.draft` 继续有效（现状是读不到 draft 字段时 `toInsight` 默认 false，译文文件此前不存在所以无影响）。
- **缓存注意**：`[slug].get.ts` 有 `max-age=30, stale-while-revalidate=300`。英文异步翻译落盘最晚几十秒，用户首次访问英文页最多看到 5 分钟内的简中回退 —— 可接受，无需改缓存头；翻译完成不回源 purge（无 CDN API 依赖）。

---

## 7. admin UI 改动（`app/pages/admin.vue`，单文件内扩展）

admin 是全中文硬编码 UI（不走 i18n），本次保持一致，文案直接写中文。

### 7.1 列表视图

每行文章在现有「草稿/已发布」徽章旁加三语言状态徽章组：

```
[已发布] 办公室财位放什么最好…
         简中 ✓   繁中 ✓ 已同步   英文 ●翻译中 / ✓已同步 / ⚠已过期 / 🔒已锁定(已过期) / ✗失败(重试)
```

- 徽章数据来自列表接口新增的 `translations` 字段。
- 英文 `translating` 时前端对该行做 5s 轮询（仅当列表中存在 translating 项才启动），翻完自动变 ✓。
- `failed` 徽章可点击 → 直接触发 regenerate。

### 7.2 编辑视图

编辑器主体仍是**简中源文**，布局不变。右侧设置栏下方新增「多语言版本」卡片：

```
┌ 多语言版本 ────────────────────┐
│ 繁體中文   ✓ 已同步  [查看/编辑] │
│ English   ⚠ 已过期   [查看/编辑] │
│           [重新生成]            │
│ （锁定图标说明：手动编辑过的版本   │
│  不会随源文自动更新）            │
└────────────────────────────────┘
```

- 「查看/编辑」→ 弹层（或切换到译文子视图）展示该语言的 title/description/tags/content 表单，底部「保存此语言版本」。保存 → PUT translations/[lang]，成功后状态变 🔒。
- 「重新生成」→ POST regenerate（带 confirm：锁定版本会提示「你用人工修改覆盖了自动翻译，重新生成将丢弃人工修改」）。
- 英文 `translating` 时按钮禁用并显示「翻译中…」。

### 7.3 交互边界

- 「存为草稿」同样触发翻译管线（译文带 draft:true，前台不可见）。这点与最初设想的"只有发布才触发"不同，原因是本项目草稿就是 `draft:true` 的保存，没有独立草稿存储 —— 但 hash 判定保证**内容没变就不会重翻**，编辑频繁保存草稿不会烧 AI 额度，原顾虑已被 §3 覆盖。
- 恢复历史版本（backups restore）后：源 hash 变化 → 下次保存时按判定矩阵自动处理译文。restore 本身不触发翻译（它只是文件拷贝）。

---

## 8. 部署与运维

1. **deploy.sh**：`content/insights/` 的 rsync 增加 `--exclude '.translations/'`（状态文件是运行时产物，和 `.backups/` 一样不该被本机覆盖线上）。文章 md 本身维持现有「无 --delete、线上为准」策略 —— 翻译文件随 admin 保存在线上生成，自然被同一策略覆盖。
2. **.gitignore**：加 `content/insights/.translations/`。`.backups/` 现状未忽略，维持不动（不顺手改）。
3. **无新付费 API**：翻译走现有 gptniux 通道（`NUXT_AI_API_KEY`），与全局约定一致。
4. **无新 npm 依赖**：opencc-js、crypto、marked 全是现成的。
5. **存量文章**：`office-fengshui-caiwei-best.md` 目前无译文。功能上线后在 admin 列表点「重新生成」即可补齐，不做迁移脚本。

---

## 9. 实施顺序（确认后按此执行）

1. `client.ts` 加 opts → `hash.ts` / `glossary.ts` / `translation-state.ts`
2. `insights.ts` 扩展（frontmatter 透传、译文读写、级联删除）
3. `translate.ts`（OpenCC + AI 两条管线 + 互斥）
4. admin API 改造（POST/PUT 挂管线、DELETE 级联、GET 带状态、translations 三个新端点）
5. admin.vue（列表徽章 + 轮询、编辑器多语言卡片 + 译文编辑弹层）
6. deploy.sh 排除 `.translations/`，.gitignore 补条目
7. 验证：
   - `pnpm build` 通过
   - 本地起 dev，admin 登录 → 发文 → 断言三个文件落盘、frontmatter 正确、英文翻译 JSON 结构校验生效
   - 改简中一个字 → 保存 → hash 变化 → 繁中重转、英文重翻；改 publishedAt → 只同步元数据不重翻
   - 手动编辑英文 → locked → 再改简中 → 英文不被覆盖、状态 locked-stale
   - 前台 `/insights/{slug}`、`/zh-TW/insights/{slug}`、`/en/insights/{slug}` 三语言各 200 且内容正确
   - i18n 完整性：本次**不改任何 locale 文件**（admin 文案硬编码中文），无需 flatten 校验，但需确认无意外触碰 `i18n/*.json`

---

## 10. 明确不做的（防范围蔓延）

- 不做英文上线前人工校对流程（只对 failed 做提示，不强制审核）
- 不做翻译的 SSE 流式进度（一篇文章几十秒，轮询状态足够）
- 不做繁中运行时现转的缓存层（已选落盘方案）
- 不动前台详情页的渲染、SEO、JSON-LD 逻辑
- 不引入数据库（文件系统方案与现有架构一致）
- 不修改任何已有 locale key
