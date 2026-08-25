<template>
  <div class="min-h-screen bg-[var(--surface-page,#0b0d12)] text-[var(--text-body,#c8cdd8)] px-4 py-8">
    <!-- 未登录 -->
    <div v-if="unauthorized" class="min-h-[80vh] flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-white font-serif mb-2">命见 · 写作队列</h1>
        <p class="text-sm text-neutral-500 mb-6">需要管理员登录</p>
        <a
          href="/admin"
          class="inline-block px-5 py-2.5 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-black text-sm font-medium transition-colors"
        >前往 /admin 登录</a>
      </div>
    </div>

    <div v-else class="max-w-5xl mx-auto">
      <!-- 顶栏 -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-white font-serif">命见 · 写作队列</h1>
          <p class="text-xs text-neutral-500 mt-1">AI 按队列自动写作，每轮间隔 41~107 分钟随机</p>
        </div>
        <div class="flex items-center gap-2">
          <a
            href="/admin"
            class="text-sm px-4 py-2 rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-100 hover:border-neutral-400 hover:bg-neutral-700 transition-colors"
          >← 文章列表</a>
          <button
            class="text-sm px-4 py-2 rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-100 hover:border-neutral-400 hover:bg-neutral-700 transition-colors disabled:opacity-50"
            :disabled="running"
            @click="runOnce"
          >{{ running ? '写作中…' : '立即执行一次' }}</button>
        </div>
      </div>

      <p v-if="fatalError" class="rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-4 py-3 mb-4">
        {{ fatalError }}
      </p>

      <!-- 全局开关 -->
      <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 mb-4 flex items-center justify-between gap-4">
        <div class="min-w-0">
          <p class="text-sm text-neutral-200">
            当前模式：<span :class="settings.autoPublish ? 'text-emerald-400' : 'text-yellow-400'" class="font-medium">{{ settings.autoPublish ? '自动发布' : '需审核' }}</span>
          </p>
          <p class="text-xs text-neutral-500 mt-0.5">
            {{ settings.autoPublish
              ? '写完后直接发布上线，并触发繁体/英文自动翻译'
              : '写完后存为草稿，不触发自动翻译，需在文章列表人工发布' }}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="settings.autoPublish"
          class="shrink-0 relative w-11 h-6 rounded-full transition-colors disabled:opacity-50"
          :class="settings.autoPublish ? 'bg-emerald-500/80' : 'bg-neutral-700'"
          :disabled="toggling"
          @click="toggleMode"
        >
          <span
            class="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
            :class="settings.autoPublish ? 'left-[1.375rem]' : 'left-0.5'"
          />
        </button>
      </div>

      <!-- 新增标题 -->
      <form class="flex gap-2 mb-5" @submit.prevent="addTitle">
        <input
          v-model="newTitle"
          type="text"
          required
          maxlength="200"
          placeholder="输入文章标题，回车加入队列…"
          class="flex-1 min-w-0 bg-neutral-900/60 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500/60"
        >
        <button
          type="submit"
          :disabled="adding || !newTitle.trim()"
          class="shrink-0 px-4 py-2.5 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-black text-sm font-medium transition-colors disabled:opacity-50"
        >{{ adding ? '加入中…' : '加入队列' }}</button>
      </form>

      <!-- 队列列表 -->
      <div v-if="pending" class="text-sm text-neutral-500 py-12 text-center">加载中…</div>
      <div v-else-if="!items.length" class="text-center py-16 text-neutral-500">
        <p class="text-base mb-2">队列是空的</p>
        <p class="text-sm">在上方输入标题加入队列</p>
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 hover:border-neutral-600 transition-colors"
        >
          <span
            class="shrink-0 text-[11px] px-2 py-0.5 rounded-full border"
            :class="statusClass(item.status)"
          >{{ statusLabel(item.status) }}</span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-neutral-100 truncate">{{ item.title }}</p>
            <p class="text-xs text-neutral-500 truncate mt-0.5">
              {{ formatDate(item.createdAt) }} 加入
              <template v-if="item.slug"> · {{ item.slug }}</template>
              <template v-if="item.model"> · {{ item.model }}</template>
            </p>
            <p v-if="item.error" class="text-xs text-red-400/90 mt-1 break-all">{{ item.error }}</p>
          </div>
          <div class="shrink-0 flex items-center gap-3">
            <a
              v-if="item.status === 'published' && item.slug"
              :href="`/insights/${item.slug}`"
              target="_blank"
              class="text-xs text-neutral-400 hover:text-amber-400 transition-colors"
            >查看页面 ↗</a>
            <button
              v-if="item.status === 'failed'"
              type="button"
              class="text-xs text-red-400 hover:text-red-300 transition-colors"
              @click="retry(item)"
            >重试</button>
            <button
              v-if="item.status === 'pending' || item.status === 'failed'"
              type="button"
              class="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              @click="removeItem(item)"
            >移除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ path: '/admin/writelist', layout: false, ssr: false })

useHead({
  title: '写作队列 · 命见内容管理',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

type WritelistStatus = 'pending' | 'writing' | 'draft' | 'published' | 'failed'

interface WritelistItem {
  id: string
  title: string
  status: WritelistStatus
  createdAt: string
  updatedAt: string
  slug?: string
  model?: string
  error?: string
}

interface WritelistResponse {
  settings: { autoPublish: boolean }
  running: boolean
  items: WritelistItem[]
}

const unauthorized = ref(false)
const pending = ref(true)
const fatalError = ref('')
const items = ref<WritelistItem[]>([])
const settings = reactive({ autoPublish: false })
const running = ref(false)
const adding = ref(false)
const toggling = ref(false)
const newTitle = ref('')

const STATUS_LABELS: Record<WritelistStatus, string> = {
  pending: '待写',
  writing: '写作中',
  draft: '草稿',
  published: '已发布',
  failed: '失败',
}

function statusLabel(s: WritelistStatus): string {
  return STATUS_LABELS[s] || s
}

function statusClass(s: WritelistStatus): string {
  switch (s) {
    case 'pending': return 'border-neutral-600 bg-neutral-800 text-neutral-400'
    case 'writing': return 'border-sky-500/40 bg-sky-500/10 text-sky-400'
    case 'draft': return 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
    case 'published': return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
    case 'failed': return 'border-red-500/40 bg-red-500/10 text-red-400'
    default: return 'border-neutral-700 bg-neutral-800 text-neutral-500'
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('zh-CN', { hour12: false })
}

async function load() {
  try {
    const data = await $fetch<WritelistResponse>('/api/admin/writelist')
    items.value = data.items
    settings.autoPublish = data.settings.autoPublish
    running.value = data.running
    unauthorized.value = false
  } catch (e: any) {
    if (e?.response?.status === 401) {
      unauthorized.value = true
    } else if (e?.response?.status === 503) {
      fatalError.value = '服务器未配置管理密码（INSIGHTS_ADMIN_PASSWORD），请联系管理员。'
    } else {
      fatalError.value = `加载失败：${e?.data?.statusMessage || e?.message || e}`
    }
  } finally {
    pending.value = false
  }
}

let pollTimer: ReturnType<typeof setTimeout> | null = null

function schedulePoll() {
  if (pollTimer) return
  pollTimer = setTimeout(async () => {
    pollTimer = null
    await load()
    if (running.value || items.value.some(i => i.status === 'pending' || i.status === 'writing')) {
      schedulePoll()
    }
  }, 5000)
}

onBeforeUnmount(() => {
  if (pollTimer) clearTimeout(pollTimer)
})

async function addTitle() {
  const title = newTitle.value.trim()
  if (!title) return
  adding.value = true
  fatalError.value = ''
  try {
    await $fetch('/api/admin/writelist', { method: 'POST', body: { title } })
    newTitle.value = ''
    await load()
    schedulePoll()
  } catch (e: any) {
    fatalError.value = e?.data?.statusMessage || '加入队列失败'
  } finally {
    adding.value = false
  }
}

async function toggleMode() {
  toggling.value = true
  fatalError.value = ''
  const next = !settings.autoPublish
  try {
    const res = await $fetch<{ settings: { autoPublish: boolean } }>('/api/admin/writelist/settings', {
      method: 'PUT',
      body: { autoPublish: next },
    })
    settings.autoPublish = res.settings.autoPublish
  } catch (e: any) {
    fatalError.value = e?.data?.statusMessage || '切换失败'
  } finally {
    toggling.value = false
  }
}

async function runOnce() {
  running.value = true
  fatalError.value = ''
  try {
    const res = await $fetch<{ result: { processed: boolean; status?: string; error?: string } }>('/api/admin/writelist/run', { method: 'POST' })
    if (res.result.status === 'failed') {
      fatalError.value = `本轮写作失败：${res.result.error || '未知错误'}`
    }
    await load()
  } catch (e: any) {
    fatalError.value = e?.data?.statusMessage || '执行失败'
    await load()
  } finally {
    running.value = false
    schedulePoll()
  }
}

async function retry(item: WritelistItem) {
  try {
    await $fetch(`/api/admin/writelist/${item.id}`, { method: 'POST', body: { action: 'retry' } })
    await load()
    schedulePoll()
  } catch (e: any) {
    fatalError.value = e?.data?.statusMessage || '重试失败'
  }
}

async function removeItem(item: WritelistItem) {
  if (!confirm(`确定把「${item.title}」移出队列吗？`)) return
  try {
    await $fetch(`/api/admin/writelist/${item.id}`, { method: 'DELETE' })
    await load()
  } catch (e: any) {
    fatalError.value = e?.data?.statusMessage || '移除失败'
  }
}

onMounted(load)
</script>
