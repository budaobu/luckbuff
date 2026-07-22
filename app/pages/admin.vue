<template>
  <div class="min-h-screen bg-[var(--surface-page,#0b0d12)] text-[var(--text-body,#c8cdd8)] px-4 py-8">
    <!-- ══════ 登录视图 ══════ -->
    <div v-if="view === 'login'" class="min-h-[80vh] flex items-center justify-center">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-white font-serif">命见 · 内容管理</h1>
          <p class="text-xs text-neutral-500 mt-2">保存后立即生效，无需部署</p>
        </div>
        <form class="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4" @submit.prevent="login">
          <div>
            <label class="block text-xs text-neutral-400 mb-1.5">用户名</label>
            <input
              v-model="loginForm.username"
              type="text"
              autocomplete="username"
              required
              class="w-full px-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-sm text-neutral-100 focus:border-amber-500/60 focus:outline-none transition-colors"
              placeholder="请输入用户名"
            >
          </div>
          <div>
            <label class="block text-xs text-neutral-400 mb-1.5">密码</label>
            <input
              v-model="loginForm.password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full px-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-sm text-neutral-100 focus:border-amber-500/60 focus:outline-none transition-colors"
              placeholder="请输入密码"
            >
          </div>
          <label class="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer select-none">
            <input v-model="loginForm.remember" type="checkbox" class="accent-amber-500 w-3.5 h-3.5">
            记住我（30 天内自动登录）
          </label>
          <p v-if="loginError" class="text-xs text-red-400">{{ loginError }}</p>
          <button
            type="submit"
            :disabled="loginPending"
            class="w-full py-2.5 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-black text-sm font-medium transition-colors disabled:opacity-50"
          >
            {{ loginPending ? '登录中…' : '登 录' }}
          </button>
        </form>
      </div>
    </div>

    <div v-else class="max-w-5xl mx-auto">
      <!-- 顶栏 -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-white font-serif">命见 · 内容管理</h1>
          <p class="text-xs text-neutral-500 mt-1">保存后立即生效，无需部署</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="view === 'editor'"
            class="text-sm px-4 py-2 rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-100 hover:border-neutral-400 hover:bg-neutral-700 transition-colors"
            @click="backToList"
          >
            ← 返回列表
          </button>
          <button
            v-else
            class="text-sm px-4 py-2 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-black font-medium transition-colors"
            @click="startNew"
          >
            ＋ 新建文章
          </button>
          <button
            class="text-sm px-3 py-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            title="退出登录"
            @click="logout"
          >
            退出
          </button>
        </div>
      </div>

      <p v-if="fatalError" class="rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-4 py-3 mb-4">
        {{ fatalError }}
      </p>

      <!-- ══════ 列表视图 ══════ -->
      <div v-if="view === 'list'">
        <div v-if="listPending" class="text-sm text-neutral-500 py-12 text-center">加载中…</div>
        <div v-else-if="!articles.length" class="text-center py-16 text-neutral-500">
          <p class="text-base mb-2">还没有文章</p>
          <p class="text-sm">点右上角「新建文章」开始写第一篇</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="a in articles"
            :key="a.slug"
            class="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 hover:border-neutral-600 transition-colors cursor-pointer"
            @click="startEdit(a.slug)"
          >
            <span
              class="shrink-0 text-[11px] px-2 py-0.5 rounded-full border"
              :class="a.draft
                ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'"
            >
              {{ a.draft ? '草稿' : '已发布' }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-neutral-100 truncate">{{ a.title }}</p>
              <p class="text-xs text-neutral-500 truncate mt-0.5">
                {{ a.slug }} · {{ categoryLabel(a.category) }} · {{ formatDate(a.publishedAt) }}
              </p>
            </div>
            <a
              v-if="!a.draft"
              :href="`/insights/${a.slug}`"
              target="_blank"
              class="shrink-0 text-xs text-neutral-400 hover:text-amber-400 transition-colors"
              @click.stop
            >查看页面 ↗</a>
          </div>
        </div>
      </div>

      <!-- ══════ 编辑视图 ══════ -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <!-- 左：正文编辑 -->
        <div class="space-y-4">
          <input
            v-model="form.title"
            type="text"
            placeholder="文章标题"
            class="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg px-4 py-3 text-lg font-medium text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/60"
          >

          <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
            <!-- 工具条 -->
            <div class="flex items-center gap-1 px-3 py-2 border-b border-neutral-800 flex-wrap">
              <button v-for="btn in toolbarButtons" :key="btn.label" type="button"
                class="text-xs px-2.5 py-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                :title="btn.hint"
                @click="insertSnippet(btn.before, btn.after)"
              >{{ btn.label }}</button>
              <span class="w-px h-4 bg-neutral-800 mx-1" />
              <button type="button"
                class="text-xs px-2.5 py-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                @click="imageInput?.click()"
              >插入图片</button>
              <input ref="imageInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" @change="onImagePicked">
              <label class="ml-auto flex items-center gap-1.5 text-xs text-neutral-500 select-none">
                <input v-model="showPreview" type="checkbox" class="accent-amber-500">
                预览
              </label>
            </div>
            <div class="grid" :class="showPreview ? 'grid-cols-2' : 'grid-cols-1'">
              <textarea
                ref="contentArea"
                v-model="form.content"
                placeholder="正文（支持 Markdown）……"
                class="w-full h-[560px] bg-transparent px-4 py-3 text-sm leading-relaxed text-neutral-200 placeholder-neutral-600 focus:outline-none resize-y font-mono"
              />
              <div
                v-if="showPreview"
                class="h-[560px] overflow-y-auto border-l border-neutral-800 px-4 py-3 text-sm leading-relaxed admin-preview"
                v-html="previewHtml"
              />
            </div>
          </div>
          <p v-if="uploading" class="text-xs text-amber-400">图片上传中…</p>
        </div>

        <!-- 右：设置 -->
        <div class="space-y-4">
          <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
            <h2 class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">发布设置</h2>

            <label class="block">
              <span class="text-xs text-neutral-500">链接标识（slug，发布后不可改）</span>
              <input
                v-model="form.slug"
                type="text"
                :disabled="!isNew"
                placeholder="例如 office-fengshui-caiwei"
                class="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-amber-500/60 disabled:opacity-50 font-mono"
              >
            </label>

            <label class="block">
              <span class="text-xs text-neutral-500">摘要（列表与分享时显示）</span>
              <textarea
                v-model="form.description"
                rows="3"
                class="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-amber-500/60 resize-none"
              />
            </label>

            <label class="block">
              <span class="text-xs text-neutral-500">分类</span>
              <select
                v-model="form.category"
                class="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-amber-500/60"
              >
                <option v-for="c in categories" :key="c" :value="c">{{ categoryLabel(c) }}</option>
              </select>
            </label>

            <label class="block">
              <span class="text-xs text-neutral-500">标签（逗号分隔）</span>
              <input
                v-model="tagsInput"
                type="text"
                placeholder="办公室风水, 财位"
                class="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-amber-500/60"
              >
            </label>

            <label class="block">
              <span class="text-xs text-neutral-500">发布日期</span>
              <input
                v-model="form.publishedAt"
                type="date"
                class="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-amber-500/60"
              >
            </label>

            <div class="grid grid-cols-2 gap-3">
              <label class="block">
                <span class="text-xs text-neutral-500">作者</span>
                <input
                  v-model="form.author"
                  type="text"
                  class="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-amber-500/60"
                >
              </label>
              <label class="block">
                <span class="text-xs text-neutral-500">阅读时长（分钟）</span>
                <input
                  v-model.number="form.readingTime"
                  type="number"
                  min="0"
                  class="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-amber-500/60"
                >
              </label>
            </div>
          </div>

          <!-- 操作 -->
          <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-2">
            <button
              class="w-full py-2.5 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-black text-sm font-semibold transition-colors disabled:opacity-50"
              :disabled="saving"
              @click="save(false)"
            >
              {{ saving ? '保存中…' : '发布上线' }}
            </button>
            <button
              class="w-full py-2.5 rounded-lg border border-neutral-600 bg-neutral-800 hover:border-neutral-400 hover:bg-neutral-700 text-sm text-neutral-100 transition-colors disabled:opacity-50"
              :disabled="saving"
              @click="save(true)"
            >
              存为草稿
            </button>
            <p v-if="saveMessage" class="text-xs text-center" :class="saveOk ? 'text-emerald-400' : 'text-red-400'">
              {{ saveMessage }}
            </p>
          </div>

          <!-- 历史版本 / 删除 -->
          <div v-if="!isNew" class="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
            <h2 class="text-xs font-semibold text-neutral-400 uppercase tracking-wider">历史版本</h2>
            <p v-if="!backups.length" class="text-xs text-neutral-600">暂无历史版本（每次保存/删除前自动备份）</p>
            <div v-for="b in backups" :key="b.file" class="flex items-center justify-between gap-2">
              <span class="text-xs text-neutral-500 font-mono truncate">{{ b.timestamp }}</span>
              <button
                class="shrink-0 text-xs text-amber-400 hover:text-amber-300"
                @click="restore(b.file)"
              >恢复此版本</button>
            </div>
            <div class="pt-2 border-t border-neutral-800">
              <button
                class="text-xs text-red-400/80 hover:text-red-300"
                @click="remove"
              >删除这篇文章（会先自动备份）</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'

definePageMeta({ layout: false, ssr: false })

useHead({
  title: '命见内容管理',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

interface AdminArticle {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  publishedAt: string
  updatedAt: string
  author: string
  readingTime: number
  draft: boolean
  relatedTools: string[]
  content?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  'metaphysics-basics': '命理入门',
  'deep-reading': '深度解读',
  'fengshui': '风水文化',
  'astrology': '星象占星',
  'culture': '术数文化',
}

const view = ref<'login' | 'list' | 'editor'>('login')
const articles = ref<AdminArticle[]>([])
const categories = ref<string[]>(Object.keys(CATEGORY_LABELS))
const listPending = ref(false)
const fatalError = ref('')

const isNew = ref(true)
const editingSlug = ref('')
const form = reactive({
  slug: '',
  title: '',
  description: '',
  category: 'metaphysics-basics',
  publishedAt: new Date().toISOString().slice(0, 10),
  author: '幽默隐士',
  readingTime: 5,
  content: '',
})
const tagsInput = ref('')
const showPreview = ref(false)
const saving = ref(false)
const uploading = ref(false)
const saveMessage = ref('')
const saveOk = ref(true)
const backups = ref<Array<{ file: string; timestamp: string }>>([])
const contentArea = ref<HTMLTextAreaElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)

const toolbarButtons = [
  { label: 'B 加粗', before: '**', after: '**', hint: '加粗选中文字' },
  { label: 'H2 标题', before: '\n## ', after: '\n', hint: '二级标题' },
  { label: '• 列表', before: '\n- ', after: '', hint: '无序列表项' },
  { label: '❝ 引用', before: '\n> ', after: '', hint: '引用块' },
  { label: '🔗 链接', before: '[', after: '](https://)', hint: '插入链接' },
  { label: '— 分隔线', before: '\n\n---\n\n', after: '', hint: '水平分隔线' },
]

function categoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] || cat
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('zh-CN')
}

const previewHtml = computed(() => {
  if (!form.content) return '<p class="text-neutral-600">预览区域</p>'
  try {
    return marked.parse(form.content, { async: false }) as string
  } catch {
    return form.content
  }
})

async function adminFetch<T>(url: string, opts?: any): Promise<T> {
  return await $fetch<T>(url, opts)
}

// ── 登录 / 登出 ──
const loginForm = reactive({ username: '', password: '', remember: true })
const loginPending = ref(false)
const loginError = ref('')

async function login() {
  loginPending.value = true
  loginError.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { ...loginForm } })
    view.value = 'list'
    loginForm.password = ''
    await loadList()
  } catch (e: any) {
    loginError.value = e?.data?.statusMessage || '登录失败，请稍后再试'
  } finally {
    loginPending.value = false
  }
}

async function logout() {
  try { await $fetch('/api/admin/logout', { method: 'POST' }) } catch { /* cookie cleared regardless */ }
  view.value = 'login'
}

async function loadList() {
  listPending.value = true
  fatalError.value = ''
  try {
    const data = await adminFetch<{ total: number; categories: string[]; articles: AdminArticle[] }>('/api/admin/insights')
    articles.value = data.articles
    if (data.categories?.length) categories.value = [...data.categories]
  } catch (e: any) {
    if (e?.response?.status === 401) {
      view.value = 'login'
    } else if (e?.response?.status === 503) {
      fatalError.value = '服务器未配置管理密码（INSIGHTS_ADMIN_PASSWORD），请联系管理员。'
    } else {
      fatalError.value = `加载失败：${e?.data?.statusMessage || e?.message || e}`
    }
  } finally {
    listPending.value = false
  }
}

function resetForm() {
  isNew.value = true
  editingSlug.value = ''
  form.slug = ''
  form.title = ''
  form.description = ''
  form.category = 'metaphysics-basics'
  form.publishedAt = new Date().toISOString().slice(0, 10)
  form.author = '幽默隐士'
  form.readingTime = 5
  form.content = ''
  tagsInput.value = ''
  backups.value = []
  saveMessage.value = ''
}

function startNew() {
  resetForm()
  view.value = 'editor'
}

async function startEdit(slug: string) {
  fatalError.value = ''
  try {
    const a = await adminFetch<AdminArticle>(`/api/admin/insights/${slug}`)
    isNew.value = false
    editingSlug.value = slug
    form.slug = a.slug
    form.title = a.title
    form.description = a.description
    form.category = a.category || 'metaphysics-basics'
    form.publishedAt = (a.publishedAt || '').slice(0, 10) || new Date().toISOString().slice(0, 10)
    form.author = a.author || '幽默隐士'
    form.readingTime = a.readingTime || 0
    form.content = a.content || ''
    tagsInput.value = (a.tags || []).join(', ')
    saveMessage.value = ''
    view.value = 'editor'
    loadBackups()
  } catch (e: any) {
    fatalError.value = `打开失败：${e?.data?.statusMessage || e?.message || e}`
  }
}

function backToList() {
  view.value = 'list'
  loadList()
}

function parseTags(): string[] {
  return tagsInput.value.split(/[,，]/).map(t => t.trim()).filter(Boolean)
}

async function save(asDraft: boolean) {
  saveMessage.value = ''
  const payload = {
    slug: form.slug.trim().toLowerCase(),
    title: form.title,
    description: form.description,
    category: form.category,
    tags: parseTags(),
    publishedAt: form.publishedAt,
    author: form.author,
    readingTime: Number(form.readingTime) || 0,
    draft: asDraft,
    relatedTools: [] as string[],
    content: form.content,
  }
  saving.value = true
  try {
    if (isNew.value) {
      await adminFetch('/api/admin/insights', { method: 'POST', body: payload })
      isNew.value = false
      editingSlug.value = payload.slug
    } else {
      await adminFetch(`/api/admin/insights/${editingSlug.value}`, { method: 'PUT', body: payload })
    }
    saveOk.value = true
    saveMessage.value = asDraft ? '已保存为草稿（前台不可见）' : '已发布，前台立即生效'
    loadBackups()
  } catch (e: any) {
    saveOk.value = false
    saveMessage.value = e?.data?.statusMessage || e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm(`确定删除「${form.title}」吗？删除前会自动备份，可以从服务器恢复。`)) return
  try {
    await adminFetch(`/api/admin/insights/${editingSlug.value}`, { method: 'DELETE' })
    backToList()
  } catch (e: any) {
    saveOk.value = false
    saveMessage.value = e?.data?.statusMessage || '删除失败'
  }
}

async function loadBackups() {
  if (isNew.value || !editingSlug.value) return
  try {
    const data = await adminFetch<{ backups: Array<{ file: string; timestamp: string }> }>(`/api/admin/insights/${editingSlug.value}/backups`)
    backups.value = data.backups
  } catch {
    backups.value = []
  }
}

async function restore(file: string) {
  if (!confirm('恢复后当前内容会被覆盖（当前内容也会先自动备份）。继续？')) return
  try {
    await adminFetch(`/api/admin/insights/${editingSlug.value}/restore`, { method: 'POST', body: { file } })
    await startEdit(editingSlug.value)
    saveOk.value = true
    saveMessage.value = '已恢复历史版本'
  } catch (e: any) {
    saveOk.value = false
    saveMessage.value = e?.data?.statusMessage || '恢复失败'
  }
}

function insertSnippet(before: string, after: string) {
  const el = contentArea.value
  if (!el) {
    form.content += before + after
    return
  }
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = form.content.slice(start, end)
  form.content = form.content.slice(0, start) + before + selected + after + form.content.slice(end)
  nextTick(() => {
    el.focus()
    el.selectionStart = start + before.length
    el.selectionEnd = start + before.length + selected.length
  })
}

async function onImagePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const fd = new FormData()
  fd.append('file', file)
  uploading.value = true
  try {
    const res = await adminFetch<{ ok: boolean; path: string }>('/api/admin/insights/upload', { method: 'POST', body: fd })
    insertSnippet(`\n![${file.name.replace(/\.[^.]+$/, '')}](${res.path})\n`, '')
  } catch (err: any) {
    saveOk.value = false
    saveMessage.value = err?.data?.statusMessage || '图片上传失败'
  } finally {
    uploading.value = false
    input.value = ''
  }
}

onMounted(async () => {
  // Existing session cookie → straight to the list; otherwise show the login form
  try {
    await $fetch('/api/admin/session')
    view.value = 'list'
    await loadList()
  } catch {
    view.value = 'login'
  }
})
</script>

<style>
.admin-preview h1, .admin-preview h2, .admin-preview h3 {
  font-size: 1.05rem;
  font-weight: 600;
  color: #f4f4f5;
  margin: 1rem 0 0.4rem;
}
.admin-preview h1:first-child, .admin-preview h2:first-child, .admin-preview h3:first-child { margin-top: 0; }
.admin-preview p { margin-bottom: 0.7em; line-height: 1.8; color: #d4d4d8; }
.admin-preview strong { color: #fff; }
.admin-preview a { color: #fbbf24; text-decoration: underline; }
.admin-preview ul { list-style: disc; padding-left: 1.2rem; margin-bottom: 0.6rem; color: #d4d4d8; }
.admin-preview ol { list-style: decimal; padding-left: 1.2rem; margin-bottom: 0.6rem; color: #d4d4d8; }
.admin-preview blockquote { border-left: 2px solid #78716c; padding-left: 0.75rem; margin: 0.5rem 0; color: #a8a29e; }
.admin-preview img { max-width: 100%; border-radius: 0.5rem; }
.admin-preview code { font-size: 0.85em; padding: 0.1em 0.35em; border-radius: 0.25rem; background: #27272a; }
.admin-preview hr { border: none; border-top: 1px solid #3f3f46; margin: 1rem 0; }
</style>
