import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { callAIJson } from '~~/server/utils/ai/client'
import {
  writeInsight,
  readInsightRaw,
  isValidSlug,
  validateInsightInput,
  INSIGHT_CATEGORIES,
  type InsightWriteInput,
} from '~~/server/utils/insights'
import { runTranslationPipeline } from '~~/server/utils/insights/translate'
import { inferRelatedTools } from '~~/server/utils/insights/related-tools'

// AI 写作队列：主题进、文章出。持久化在 content/insights/.writelist-queue.json
// （deploy.sh 对 content/insights 无 --delete 同步，且已 exclude 该文件，
// 线上队列不会被本地上传覆盖，重启后从文件恢复，不丢不重）。

export type WritelistStatus = 'pending' | 'writing' | 'draft' | 'published' | 'failed'

export interface WritelistItem {
  id: string
  title: string
  status: WritelistStatus
  createdAt: string
  updatedAt: string
  slug?: string
  model?: string
  error?: string
}

export interface WritelistSettings {
  // false = 需审核（写为草稿，不触发翻译）；true = 自动发布（复用发布逻辑，触发翻译）
  autoPublish: boolean
}

interface WritelistData {
  settings: WritelistSettings
  items: WritelistItem[]
}

const QUEUE_PATH = resolve(process.cwd(), 'content', 'insights', '.writelist-queue.json')

const VALID_STATUSES: WritelistStatus[] = ['pending', 'writing', 'draft', 'published', 'failed']

export function readWritelist(): WritelistData {
  if (!existsSync(QUEUE_PATH)) return { settings: { autoPublish: false }, items: [] }
  try {
    const parsed = JSON.parse(readFileSync(QUEUE_PATH, 'utf-8'))
    const items = Array.isArray(parsed?.items) ? parsed.items : []
    return {
      settings: { autoPublish: parsed?.settings?.autoPublish === true },
      items: items
        .filter((i: any) => i && typeof i.id === 'string' && typeof i.title === 'string')
        .map((i: any) => ({
          id: i.id,
          title: i.title,
          status: VALID_STATUSES.includes(i.status) ? i.status : 'pending',
          createdAt: typeof i.createdAt === 'string' ? i.createdAt : new Date().toISOString(),
          updatedAt: typeof i.updatedAt === 'string' ? i.updatedAt : new Date().toISOString(),
          ...(typeof i.slug === 'string' ? { slug: i.slug } : {}),
          ...(typeof i.model === 'string' ? { model: i.model } : {}),
          ...(typeof i.error === 'string' ? { error: i.error } : {}),
        })),
    }
  } catch {
    return { settings: { autoPublish: false }, items: [] }
  }
}

function writeWritelist(data: WritelistData): void {
  mkdirSync(dirname(QUEUE_PATH), { recursive: true })
  const tmpPath = `${QUEUE_PATH}.tmp-${process.pid}`
  writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  renameSync(tmpPath, QUEUE_PATH)
}

export function addWritelistTitle(title: string): WritelistItem {
  const trimmed = title.trim()
  if (!trimmed) throw new Error('主题不能为空')
  if (trimmed.length > 200) throw new Error('主题不能超过 200 字')
  const data = readWritelist()
  const dupe = data.items.find(i => i.title === trimmed && (i.status === 'pending' || i.status === 'writing'))
  if (dupe) throw new Error('该主题已在队列中')
  const item: WritelistItem = {
    id: `${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`,
    title: trimmed,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  data.items.push(item)
  writeWritelist(data)
  return item
}

export interface AddTitlesResult {
  added: WritelistItem[]
  errors: { title: string; error: string }[]
}

// 批量入队：每行一个主题，空行跳过，单条失败（重复/超长）不影响其余
export function addWritelistTitles(raw: string): AddTitlesResult {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  if (!lines.length) throw new Error('主题不能为空')
  const added: WritelistItem[] = []
  const errors: { title: string; error: string }[] = []
  for (const line of lines) {
    try {
      added.push(addWritelistTitle(line))
    } catch (e) {
      errors.push({ title: line, error: e instanceof Error ? e.message : String(e) })
    }
  }
  return { added, errors }
}

export function setWritelistAutoPublish(autoPublish: boolean): WritelistSettings {  const data = readWritelist()
  data.settings.autoPublish = autoPublish === true
  writeWritelist(data)
  return data.settings
}

export function removeWritelistItem(id: string): boolean {
  const data = readWritelist()
  const idx = data.items.findIndex(i => i.id === id)
  if (idx === -1) return false
  if (data.items[idx]!.status === 'writing') throw new Error('写作中的主题不能删除')
  data.items.splice(idx, 1)
  writeWritelist(data)
  return true
}

export function retryWritelistItem(id: string): WritelistItem {
  const data = readWritelist()
  const item = data.items.find(i => i.id === id)
  if (!item) throw new Error('主题不存在')
  if (item.status !== 'failed') throw new Error('只有失败的主题才能重试')
  item.status = 'pending'
  item.error = undefined
  item.updatedAt = new Date().toISOString()
  writeWritelist(data)
  return item
}

// 进程重启时把中断的 writing 重置回 pending（writeInsight 与队列落盘都是同步操作，
// 中断窗口只有几毫秒；回到 pending 由下一轮重新消费，不会丢主题）
export function resetStuckWritingItems(): number {
  const data = readWritelist()
  let n = 0
  for (const item of data.items) {
    if (item.status === 'writing') {
      item.status = 'pending'
      item.updatedAt = new Date().toISOString()
      n++
    }
  }
  if (n) writeWritelist(data)
  return n
}

// ── AI 写作 ──

const WRITE_SYSTEM = `你是「命见」网站 insights 栏目的专职作者，在命理、风水、术数这行泡了很多年。你写作时像一个真懂行的人在跟读者聊天：有自己的判断，敢说哪里存疑，不端架子，不凑字数。

根据用户给定的文章标题，写出一篇完整的简体中文文章，输出且仅输出一个 JSON 对象：

{"slug": "...", "title": "...", "description": "...", "category": "...", "tags": ["..."], "content": "..."}

字段要求：
1. slug：URL 标识，小写英文字母/数字/连字符，3-6 个英文单词概括主题（如 office-fengshui-caiwei），不要拼音、不要中文。
2. title：原样使用用户提供的文章标题，不要自拟、不要改写、不要加副标题。
3. description：SEO 摘要，80-150 个汉字，说清文章实际讲了什么，不堆砌关键词。
4. category：必须是以下之一：metaphysics-basics（命理入门）/ deep-reading（深度解读）/ fengshui（风水文化）/ astrology（星象占星）/ culture（术数文化）。
5. tags：3-6 个中文 SEO 关键词。
6. content：Markdown 正文，1500-2500 字，含 2-4 个二级标题（## 开头），按需使用列表；面向对中华命理文化感兴趣的普通读者。

正文写法（这部分决定文章质量，逐条遵守）：
7. 开头第一段直接进入具体的事情：一个常见做法、一个具体场景、一个很多人会问的疑问。禁止"在快节奏的现代生活中""随着人们对传统文化越来越重视""今天小编就带大家"这类开场，也不要预告全文结构。
8. 每个新段落必须带来新信息：一个说法的来路、一个具体做法、一个常见误区、一个你的判断。同一个意思换种说法重讲一遍，不算新段落。
9. 多写具体的东西：方位怎么找、步骤怎么做、民间一般怎么处理、什么情况下不适用。少写空洞的抽象概括和正确的废话。
10. 句子长短错落，段落不必等长，允许一两句的短段。通篇句式整齐、每段差不多长，是最重的忌讳。
11. 可以下判断、表态度，也可以明说"这个说法存疑""我个人不建议这么做"，依据就写在判断旁边。不要两边和稀泥。
12. 禁止翻案腔：不用"不是……而是……""你以为……其实……""看似……实则……""说到底"这类先立靶子再推翻的句式，判断直接从正面给。
13. 禁止三项以上的同构排比，禁止"首先、其次、再次、最后"的八股结构，禁止给每段结尾都补一句小结。
14. 结尾写到事情讲完就停。不升华、不号召行动、不写"希望本文对你有所帮助"，不在末段重新摘要全文。
15. 内容边界：陈述传统文化观点即可，不做绝对化断言，不给医疗/法律/投资建议；引用典籍只限于真实存在且你确信的篇章，拿不准就用"传统上认为""民间有种说法"转述，不编造书名页码、名人名言和统计数据；不使用图片语法，不插入外部链接。
16. 只输出 JSON 对象本身，不要用 markdown 代码围栏包裹，不要输出任何其他文字。`

// 按正文实际篇幅估算阅读时长：剥离 Markdown 语法后，中文（含标点）按 350 字/分钟、
// 英文数字按 180 词/分钟计，避免所有文章都落在同一个整数上
function estimateReadingTime(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[*_~`|]/g, '')
  const cjkCount = (text.match(/[一-鿿㐀-䶿豈-﫿　-〿＀-￯]/g) || []).length
  const wordCount = (text.match(/[A-Za-z0-9]+/g) || []).length
  return Math.max(1, Math.round(cjkCount / 350 + wordCount / 180))
}

interface GeneratedArticle {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  content: string
}

function parseGeneratedArticle(raw: unknown): GeneratedArticle {
  if (!raw || typeof raw !== 'object') throw new Error('AI 返回不是对象')
  const obj = raw as Record<string, unknown>
  const article: GeneratedArticle = {
    slug: String(obj.slug ?? '').trim().toLowerCase(),
    title: String(obj.title ?? '').trim(),
    description: String(obj.description ?? '').trim(),
    category: String(obj.category ?? '').trim(),
    tags: Array.isArray(obj.tags) ? obj.tags.map(t => String(t).trim()).filter(Boolean) : [],
    content: String(obj.content ?? '').trim(),
  }
  if (!isValidSlug(article.slug)) throw new Error(`AI 返回的 slug 非法：${article.slug || '(空)'}`)
  if (!article.title) throw new Error('AI 返回的 title 为空')
  if (!article.description) throw new Error('AI 返回的 description 为空')
  if (!(INSIGHT_CATEGORIES as readonly string[]).includes(article.category)) {
    throw new Error(`AI 返回的 category 非法：${article.category || '(空)'}`)
  }
  if (!article.tags.length) throw new Error('AI 返回的 tags 为空')
  if (article.content.length < 800) throw new Error(`AI 返回的正文过短（${article.content.length} 字符），不按完整文章处理`)
  return article
}

function uniqueSlug(base: string, items: WritelistItem[]): string {
  const taken = new Set(items.map(i => i.slug).filter(Boolean))
  for (let n = 0; n < 20; n++) {
    const candidate = n === 0 ? base : `${base}-${n + 1}`
    if (!taken.has(candidate) && !readInsightRaw(candidate, 'zh-CN')) return candidate
  }
  throw new Error(`slug 冲突无法自动解决：${base}`)
}

export interface ProcessResult {
  processed: boolean
  reason?: string
  id?: string
  status?: WritelistStatus
  slug?: string
  model?: string
  error?: string
}

let running = false

export function isWritelistRunning(): boolean {
  return running
}

async function generateAndStore(queueTitle: string, autoPublish: boolean, items: WritelistItem[]): Promise<{ slug: string; model: string }> {
  // 模型必须来自环境变量 NUXT_AI_MODEL：runtimeConfig.aiModel 带硬编码默认值，
  // 无法区分"未配置"，这里直接读 env，未配置即明确报错，不回落其他模型。
  const model = (process.env.NUXT_AI_MODEL || '').trim()
  if (!model) {
    throw new Error('环境变量 NUXT_AI_MODEL 未配置，写作任务中止（不会静默回落到其他模型）')
  }
  console.log(`[writelist] generating "${queueTitle}" model=${model} (NUXT_AI_MODEL) autoPublish=${autoPublish}`)

  const raw = await callAIJson(WRITE_SYSTEM, `用户提供的文章标题：${queueTitle}`, {
    model,
    timeoutMs: 300_000,
    maxTokens: 32768,
  })
  const article = parseGeneratedArticle(raw)
  article.title = queueTitle
  const slug = uniqueSlug(article.slug, items)
  const now = new Date().toISOString()
  const input: InsightWriteInput = {
    slug,
    title: article.title,
    description: article.description,
    category: article.category,
    tags: article.tags,
    publishedAt: now.slice(0, 10),
    updatedAt: now,
    author: '幽默隐士',
    readingTime: estimateReadingTime(article.content),
    draft: !autoPublish,
    relatedTools: inferRelatedTools({
      title: article.title,
      tags: article.tags,
      content: article.content,
    }),
    content: article.content,
  }
  const invalid = validateInsightInput(input, true)
  if (invalid) throw new Error(`生成内容未通过文章校验：${invalid}`)

  writeInsight(input, { isNew: true })

  if (autoPublish) {
    // 发布路径：复用现有发布逻辑，触发自动翻译（zh-TW 同步 + en 异步 AI）
    runTranslationPipeline(input)
    console.log(`[writelist] ${slug} published, translation pipeline triggered`)
  } else {
    console.log(`[writelist] ${slug} saved as draft, translation NOT triggered (review mode)`)
  }
  return { slug, model }
}

// 每次取「待写」中创建时间最旧的一条处理；单条失败只标记失败，不阻塞后续。
export async function processNextWritelistItem(): Promise<ProcessResult> {
  if (running) return { processed: false, reason: 'busy' }
  const data = readWritelist()
  const item = data.items
    .filter(i => i.status === 'pending')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0]
  if (!item) return { processed: false, reason: 'empty' }

  running = true
  const id = item.id
  try {
    item.status = 'writing'
    item.error = undefined
    item.updatedAt = new Date().toISOString()
    writeWritelist(data)

    // 开关在写入前这一刻读取：切换只影响之后处理的主题，历史结果不回溯
    const { autoPublish } = readWritelist().settings
    const { slug, model } = await generateAndStore(item.title, autoPublish, data.items)

    const fresh = readWritelist()
    const done = fresh.items.find(i => i.id === id)
    if (done) {
      done.status = autoPublish ? 'published' : 'draft'
      done.slug = slug
      done.model = model
      done.updatedAt = new Date().toISOString()
      writeWritelist(fresh)
    }
    return { processed: true, id, status: autoPublish ? 'published' : 'draft', slug, model }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[writelist] item ${id} ("${item.title}") failed: ${message}`)
    const fresh = readWritelist()
    const failed = fresh.items.find(i => i.id === id)
    if (failed) {
      failed.status = 'failed'
      failed.error = message
      failed.updatedAt = new Date().toISOString()
      writeWritelist(fresh)
    }
    return { processed: true, id, status: 'failed', error: message }
  } finally {
    running = false
  }
}
