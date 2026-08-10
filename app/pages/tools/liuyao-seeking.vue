<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- ============ 阶段 1：表单 ============ -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Liu Yao Seeking</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('liuyaoSeeking.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('liuyaoSeeking.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('liuyaoDivination.disclaimer') }}
          </p>
        </div>

        <!-- 寻物表单 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 起课时间 -->
            <DivinationTimeCard
              ref="timeCardRef"
              :label="$t('liuyaoSeeking.form.castTime')"
              :hint="$t('liuyaoSeeking.form.castTimeHint')"
              required
            />

            <!-- 具体描述 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm text-[var(--text-muted)]">{{ $t('liuyaoSeeking.form.description') }}</label>
                <QuestionInspiration
                  :extra-categories="seekingExtraCategories"
                  @select="q => form.description = q"
                />
              </div>
              <UTextarea
                v-model="form.description"
                :placeholder="$t('liuyaoSeeking.form.descriptionPlaceholder')"
                class="w-full"
                :ui="inputUi"
                :rows="2"
              />
            </div>

            <!-- 最后见到时间 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('liuyaoSeeking.form.lastSeenTime') }}</label>
              <UInput
                v-model="form.lastSeenTime"
                :placeholder="$t('liuyaoSeeking.form.lastSeenTimePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 最后见到地点 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('liuyaoSeeking.form.lastSeenPlace') }}</label>
              <UInput
                v-model="form.lastSeenPlace"
                :placeholder="$t('liuyaoSeeking.form.lastSeenPlacePlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 失物描述 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('liuyaoSeeking.form.lostItemDesc') }}</label>
              <UInput
                v-model="form.lostItemDesc"
                :placeholder="$t('liuyaoSeeking.form.lostItemDescPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 与失物关系 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('liuyaoSeeking.form.relationship') }}</label>
              <UInput
                v-model="form.relationship"
                :placeholder="$t('liuyaoSeeking.form.relationshipPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
            </div>

            <!-- 摇卦工作台 -->
            <LiuyaoTossWorkbench
              ref="tossWorkbenchRef"
              @update="handleLineValuesUpdate"
            />

            <!-- 提交按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!canSubmit"
              class="shadow-lg shadow-[var(--accent-shadow)] hover:shadow-[var(--accent-shadow-hover)] transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-radar" class="w-5 h-5" />
              </template>
              {{ $t('liuyaoSeeking.form.submitBtn') }}
            </UButton>

            <p v-if="!canSubmit" class="text-center text-[10px] text-[var(--text-placeholder)] -mt-3">
              {{ submitHint }}
            </p>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoSeeking.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyaoSeeking.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoSeeking.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyaoSeeking.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoSeeking.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyaoSeeking.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoSeeking.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyaoSeeking.knowledgeCard4Desc') }}</p>
          </div>
        </div>

        <!-- 寻物指南 -->
        <div class="mt-10">
          <div class="flex items-center gap-2 mb-4">
            <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent)]" />
            <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoSeeking.tipsTitle') }}</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="(tip, idx) in tips"
              :key="idx"
              class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 transition-all hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)]/30"
            >
              <div class="flex items-start gap-3">
                <span class="text-xl leading-none select-none">{{ tip.icon }}</span>
                <div>
                  <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ tip.title }}</h4>
                  <p class="text-xs text-[var(--text-muted)] leading-relaxed">{{ tip.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：雷达探测动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="relative flex items-center justify-center" style="width: 260px; height: 260px;">
          <!-- 背景光晕 -->
          <div class="absolute rounded-full bg-[var(--accent-faint)]" style="width: 300px; height: 300px; filter: blur(24px);" />

          <!-- 最外层虚线环 -->
          <div class="absolute rounded-full border border-dashed border-[var(--accent-faint)] outer-dashed-ring" style="width: 260px; height: 260px;" />

          <!-- 外层实线环 -->
          <div class="absolute rounded-full border border-[var(--accent-faint)] outer-solid-ring" style="width: 240px; height: 240px;" />

          <!-- 雷达扫描扇形 -->
          <div class="absolute rounded-full overflow-hidden" style="width: 200px; height: 200px; border: 1px solid var(--accent-border);">
            <div class="radar-sweep" />
          </div>

          <!-- 内圈细环 -->
          <div class="absolute rounded-full border border-[var(--accent-faint)] inner-ring" style="width: 100px; height: 100px;" />

          <!-- 中心定位点 -->
          <div
            class="absolute rounded-full flex items-center justify-center center-pulse"
            style="width: 48px; height: 48px; border: 2px solid var(--accent-border); background: radial-gradient(circle at 35% 35%, rgba(201,162,39,0.25), rgba(139,92,246,0.1));"
          >
            <UIcon name="i-heroicons-radar" class="w-5 h-5 text-[var(--accent)]" />
          </div>

          <!-- 九宫方位标记 -->
          <div
            v-for="(dir, i) in directions"
            :key="dir"
            class="absolute text-[10px] text-[var(--accent-muted)] radar-dot"
            :style="{
              left: `calc(50% + ${Math.cos((i * 45 - 90) * Math.PI / 180) * 50}% - 8px)`,
              top: `calc(50% + ${Math.sin((i * 45 - 90) * Math.PI / 180) * 50}% - 6px)`,
            }"
          >
            {{ dir }}
          </div>
        </div>
        <p class="text-[var(--accent)] tracking-wider font-medium mt-5 text-sm">
          {{ $t('liuyaoSeeking.scanning') }}
        </p>
        <p class="text-xs text-[var(--text-faint)] mt-2">
          {{ $t('liuyaoSeeking.scanningSub') }}
        </p>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && result">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Seeking Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('liuyaoSeeking.resultTitle') }}
          </h1>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 隐藏截图目标：AI 解读完成后才挂载，保证分享图融合完整解读 -->
        <div v-if="!aiStreaming && aiContent" ref="posterRef" v-show="false" class="liuyao-seeking-share-target">
          <LiuyaoSeekingPoster
            :lost-item-name="form.lostItemDesc || form.description || $t('liuyaoSeeking.poster.itemFallback')"
            :lost-time="form.lastSeenTime"
            :last-seen-place="form.lastSeenPlace"
            :ben-gua="result.hexagram?.本卦 || ''"
            :bian-gua="result.hexagram?.变卦 || ''"
            :hu-gua="result.hexagram?.互卦 || ''"
            :shi-yao="result.hexagram?.世爻位"
            :ying-yao="result.hexagram?.应爻位"
            :ai-content="aiContent"
          />
        </div>

        <!-- 页内展示：纸刊寻物启事海报（AI 流式融入） -->
        <LiuyaoSeekingPoster
          :lost-item-name="form.lostItemDesc || form.description || $t('liuyaoSeeking.poster.itemFallback')"
          :lost-time="form.lastSeenTime"
          :last-seen-place="form.lastSeenPlace"
          :ben-gua="result.hexagram?.本卦 || ''"
          :bian-gua="result.hexagram?.变卦 || ''"
          :hu-gua="result.hexagram?.互卦 || ''"
          :shi-yao="result.hexagram?.世爻位"
          :ying-yao="result.hexagram?.应爻位"
          :ai-content="aiContent"
        />

        <!-- 卦师解读状态条（融入海报之下，非独立卡片） -->
        <div class="liuyao-seeking-ai-bar">
          <div v-if="aiStreaming" class="flex items-center justify-center gap-2 py-1">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
            </span>
            <span class="text-xs text-[var(--accent-muted)]">{{ $t('liuyaoSeeking.interpreting') }}</span>
          </div>
          <div v-else-if="aiError" class="flex items-center justify-center gap-2 py-1">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
            <p class="text-xs text-red-400">{{ aiError }}</p>
            <UButton color="warning" variant="soft" size="xs" class="group/btn shrink-0" @click="startAiStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
              </template>
              {{ $t('common.retry') }}
            </UButton>
          </div>
          <div v-else-if="aiContent" class="flex items-center justify-center gap-4 py-1">
            <p class="text-[11px] text-[var(--text-faint)]">{{ $t('liuyaoDivination.disclaimer') }}</p>
            <UButton color="warning" variant="soft" size="xs" class="group/btn shrink-0" @click="startAiStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5" />
              </template>
              {{ $t('liuyaoDivination.reinterpretBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 卦象与爻象明细（海报之下的排盘参考） -->
        <div class="mt-6">
          <!-- 卦象信息 -->
          <div v-if="result.hexagram" class="grid grid-cols-3 gap-3 mb-5">
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
              <p class="text-[10px] text-[var(--text-faint)] mb-1.5">{{ $t('liuyaoDivination.benGua') }}</p>
              <p class="text-lg font-bold text-[var(--text-primary)]">{{ result.hexagram.本卦 }}</p>
              <p class="text-[10px] text-[var(--accent-muted)] mt-1">{{ $t('liuyaoDivination.shiYing', { shi: result.hexagram.世爻位, ying: result.hexagram.应爻位 }) }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
              <p class="text-[10px] text-[var(--text-faint)] mb-1.5">{{ $t('liuyaoDivination.bianGua') }}</p>
              <p class="text-lg font-bold text-[var(--text-primary)]">{{ result.hexagram.变卦 }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
              <p class="text-[10px] text-[var(--text-faint)] mb-1.5">{{ $t('liuyaoDivination.huGua') }}</p>
              <p class="text-lg font-bold text-[var(--text-primary)]">{{ result.hexagram.互卦 }}</p>
            </div>
          </div>

          <!-- 爻象展示 -->
          <div v-if="result.lines_top_down" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3">{{ $t('liuyaoDivination.chartTitle') }}</h3>
            <div class="space-y-1.5">
              <div
                v-for="(line, index) in result.lines_top_down"
                :key="index"
                class="flex items-center gap-3 rounded-xl border px-3 py-2"
                :class="line.isMoving ? 'border-l-2 border-l-[#c9a227]/40 bg-[var(--surface-card)]' : 'border-[var(--border-light)] bg-[var(--surface-card)]'"
              >
                <span class="text-[10px] text-[var(--text-placeholder)] w-8 text-center">{{ line.label }}</span>
                <div class="flex-1 flex items-center justify-center">
                  <div class="flex items-center gap-1.5">
                    <LiuyaoCopperCoin
                      v-for="(coin, ci) in inferCoins(line.value)"
                      :key="ci"
                      :is-back="coin.isBack"
                      :size="30"
                    />
                    <span class="text-xs text-[var(--text-placeholder)] ml-1">={{ line.value }}</span>
                  </div>
                </div>
                <span class="text-sm font-bold w-8 text-center" :class="line.isMoving ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'">
                  {{ line.value }}
                </span>
                <span v-if="line.isMoving" class="text-[10px] text-[var(--accent-muted)]">
                  {{ line.value === 6 ? '○' : '●' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <AppShareButton
            tool="liuyao-seeking"
            :disabled="aiStreaming || !aiContent"
            :summary="shareSummary"
            :share-target="posterRef || undefined"
            :filename="`liuyao-seeking-${result.hexagram?.本卦 || 'gua'}-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('liuyaoDivination.restartBtn') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo(localePath('/seeking')) }"
          >
            <template #leading>
              <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4" />
            </template>
            {{ $t('liuyaoSeeking.backToSeeking') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- ============ 时空拦截弹窗 ============ -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showTimeGuard"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="dismissTimeGuard"
        >
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoDivination.timeGuardTitle') }}</h3>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-heroicons-x-mark"
                class="text-[var(--text-placeholder)] hover:text-[var(--text-muted)]"
                @click="dismissTimeGuard"
              />
            </div>
            <div class="p-5 space-y-4">
              <p class="text-sm text-[var(--text-muted)] leading-relaxed" v-html="unescapeHtml($t('liuyaoDivination.timeGuardDesc'))" />

              <div v-if="cityNotRecognized" class="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p class="text-xs text-red-400/90 leading-relaxed">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                  {{ cityNotRecognized }}
                </p>
              </div>

              <div class="space-y-3">
                <UButton
                  color="warning"
                  variant="soft"
                  block
                  :loading="geo.loading"
                  @click="requestGeoAndSubmit"
                >
                  <template #leading>
                    <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
                  </template>
                  {{ geo.loading ? $t('liuyaoDivination.gettingLocation') : $t('liuyaoDivination.getLocation') }}
                </UButton>

                <p v-if="geoError" class="text-xs text-[var(--text-faint)] -mt-1 text-center">
                  {{ $t('liuyaoDivination.locationUnavailable') }} ↓
                </p>

                <div class="flex items-center gap-2">
                  <div class="flex-1 h-px bg-[var(--surface-card-hover)]" />
                  <span class="text-[10px] text-[var(--text-placeholder)]">{{ $t('liuyaoDivination.or') }}</span>
                  <div class="flex-1 h-px bg-[var(--surface-card-hover)]" />
                </div>

                <div class="flex gap-2">
                  <UInput
                    ref="cityInputRef"
                    v-model="manualCity"
                    :placeholder="$t('liuyaoDivination.cityInputPlaceholder')"
                    class="flex-1"
                    @keyup.enter="submitWithCity"
                    :ui="{ base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
                  />
                  <UButton
                    color="warning"
                    variant="soft"
                    :disabled="!manualCity.trim()"
                    :loading="citySubmitting"
                    @click="submitWithCity"
                  >
                    {{ $t('liuyaoDivination.confirm') }}
                  </UButton>
                </div>
              </div>

              <p v-if="geo.error && !geoError" class="text-xs text-red-400/70">
                {{ geo.error }}
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { LineValue, LiuYaoResult } from '~/types/liuyao'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)

// ============================================================
// 状态
// ============================================================
const phase = ref<'form' | 'animating' | 'result'>('form')

const form = reactive({
  description: '',
  lastSeenTime: '',
  lastSeenPlace: '',
  lostItemDesc: '',
  relationship: '',
})

const lineValues = ref<LineValue[]>([])
const tossWorkbenchRef = ref()

const timeCardRef = ref<{ iso: Ref<string> } | null>(null)

const { location: geo, requestLocation, setCity } = useGeolocation()
const showTimeGuard = ref(false)
const manualCity = ref('')
const pendingSubmit = ref(false)
const cityNotRecognized = ref('')
const citySubmitting = ref(false)
const geoError = ref(false)
const cityInputRef = ref()

// 排盘结果
const result = ref<LiuYaoResult | null>(null)
const errorInfo = ref<{ code: string; message: string } | null>(null)

// 分享（隐藏海报截图目标）
const posterRef = ref<HTMLDivElement | null>(null)

// ============================================================
// 计算属性
// ============================================================
const canSubmit = computed(() => {
  return lineValues.value.length === 6
})

const submitHint = computed(() => {
  if (lineValues.value.length < 6) return t('liuyaoDivination.needMoreTosses', { n: 6 - lineValues.value.length })
  return ''
})

// ============================================================
// 子时边界检测
// ============================================================
function isZiHourBoundary(date: Date = new Date()): boolean {
  const h = date.getHours()
  const m = date.getMinutes()
  const totalMinutes = h * 60 + m
  return totalMinutes >= 1350 || totalMinutes <= 90
}

function hasLocation(): boolean {
  return !!(geo.longitude && geo.latitude) || !!geo.city
}

// ============================================================
// 事件处理
// ============================================================
function handleLineValuesUpdate(values: LineValue[]) {
  lineValues.value = values
}

async function handleSubmit() {
  if (!canSubmit.value) return

  if (isZiHourBoundary() && !hasLocation()) {
    showTimeGuard.value = true
    pendingSubmit.value = true
    return
  }

  await doPredict()
}

async function requestGeoAndSubmit() {
  geoError.value = false
  const ok = await requestLocation()
  if (ok && pendingSubmit.value) {
    showTimeGuard.value = false
    await doPredict()
  } else if (!ok) {
    geoError.value = true
    nextTick(() => {
      cityInputRef.value?.$el?.querySelector('input')?.focus()
    })
  }
}

async function submitWithCity() {
  if (!manualCity.value.trim()) return
  citySubmitting.value = true
  cityNotRecognized.value = ''

  setCity(manualCity.value.trim())

  showTimeGuard.value = false
  if (pendingSubmit.value) {
    await doPredict()
  }
  citySubmitting.value = false
}

function dismissTimeGuard() {
  showTimeGuard.value = false
  pendingSubmit.value = false
  cityNotRecognized.value = ''
}

async function doPredict() {
  phase.value = 'animating'
  errorInfo.value = null

  try {
    const payload = {
      line_values: lineValues.value,
      cast_datetime: (timeCardRef.value?.iso as any).value || new Date().toISOString(),
      location: geo.longitude ? {
        longitude: geo.longitude,
        latitude: geo.latitude,
        timezone: geo.timezone,
        city: geo.city,
      } : {
        city: geo.city || undefined,
        timezone: geo.timezone,
      },
      description: form.description.trim(),
      lastSeenTime: form.lastSeenTime.trim(),
      lastSeenPlace: form.lastSeenPlace.trim(),
      lostItemDesc: form.lostItemDesc.trim(),
      relationship: form.relationship.trim(),
    }

    const chartResult = await $fetch<LiuYaoResult>('/api/tools/liuyao-seeking/chart', {
      method: 'POST',
      body: payload,
    })

    result.value = chartResult

    if (chartResult.status === 'ok') {
      phase.value = 'result'
      setTimeout(() => startAiStream(), 300)
    } else if (chartResult.status === 'system_pause') {
      phase.value = 'form'
      if (chartResult.error_code === 'CITY_NOT_RECOGNIZED') {
        showTimeGuard.value = true
        cityNotRecognized.value = (chartResult as any).message || t('liuyaoDivination.cityNotRecognizedMsg')
        pendingSubmit.value = true
        toast.add({
          title: t('liuyaoDivination.cityNotRecognized'),
          description: (chartResult as any).message || t('liuyaoDivination.cityNotRecognizedDesc'),
          color: 'warning',
        })
      } else {
        showTimeGuard.value = true
        pendingSubmit.value = true
        toast.add({
          title: t('liuyaoDivination.timeGuardIntercept'),
          description: chartResult.error_code || t('liuyaoDivination.timeGuardInterceptDesc'),
          color: 'warning',
        })
      }
    } else if (chartResult.status === 'fatal_error') {
      phase.value = 'form'
      errorInfo.value = {
        code: chartResult.error_code || 'UNKNOWN',
        message: t('liuyaoDivination.physicalBlowoutMsg'),
      }
      toast.add({
        title: t('liuyaoDivination.chartFailMsg'),
        description: chartResult.error_code || t('liuyaoDivination.unknownErrorMsg'),
        color: 'error',
      })
    }
  } catch (err: any) {
    phase.value = 'form'
    errorInfo.value = {
      code: err.data?.error_code || 'NETWORK_ERROR',
      message: err.data?.message || err.message || t('liuyaoDivination.requestFailMsg'),
    }
    toast.add({
      title: t('liuyaoDivination.requestFailMsg'),
      description: errorInfo.value.message,
      color: 'error',
    })
  }
}

async function startAiStream() {
  if (!result.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/liuyao-seeking/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: result.value,
        seekingContext: result.value.seeking_context,
        locale: locale.value,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line || !line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue

        try {
          const data = JSON.parse(payload)
          if (data.type === 'text' && data.text) {
            if (!aiStarted.value) aiStarted.value = true
            aiContent.value += data.text
          } else if (data.type === 'error') {
            aiError.value = (data as any).message || t('liuyaoDivination.aiRequestFailed')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('liuyaoDivination.aiRequestFailed')
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  form.description = ''
  form.lastSeenTime = ''
  form.lastSeenPlace = ''
  form.lostItemDesc = ''
  form.relationship = ''
  lineValues.value = []
  result.value = null
  errorInfo.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  tossWorkbenchRef.value?.reset()
  pendingSubmit.value = false
  manualCity.value = ''
}

const shareSummary = computed(() => {
  const hex = result.value?.hexagram
  const hexSummary = hex
    ? hex.本卦 === hex.变卦
      ? hex.本卦
      : `${hex.本卦}变${hex.变卦}`
    : ''
  return `${t('liuyaoSeeking.sharePrefix')}${form.lostItemDesc ? '「' + form.lostItemDesc + '」' : ''}${hexSummary ? '，' + hexSummary : ''}`
})

function unescapeHtml(str: string): string {
  return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
}

// 根据爻值推断 3 枚铜钱正反面
function inferCoins(value: number): Array<{ isBack: boolean }> {
  switch (value) {
    case 6: return [{ isBack: false }, { isBack: false }, { isBack: false }]
    case 7: return [{ isBack: false }, { isBack: false }, { isBack: true }]
    case 8: return [{ isBack: false }, { isBack: true }, { isBack: true }]
    case 9: return [{ isBack: true }, { isBack: true }, { isBack: true }]
    default: return [{ isBack: false }, { isBack: false }, { isBack: false }]
  }
}

// ============================================================
// 提示与问题灵感
// ============================================================
const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']

const tips = computed(() => [
  { icon: '🧭', title: t('liuyaoSeeking.tips.direction.title'), content: t('liuyaoSeeking.tips.direction.content') },
  { icon: '🔍', title: t('liuyaoSeeking.tips.probability.title'), content: t('liuyaoSeeking.tips.probability.content') },
  { icon: '⏰', title: t('liuyaoSeeking.tips.timing.title'), content: t('liuyaoSeeking.tips.timing.content') },
  { icon: '📍', title: t('liuyaoSeeking.tips.location.title'), content: t('liuyaoSeeking.tips.location.content') },
])

const seekingExtraCategories = [
  {
    key: 'seeking',
    groups: [
      {
        key: 'seekingDirection',
        questions: ['seekingDirection1', 'seekingDirection2', 'seekingDirection3', 'seekingDirection4', 'seekingDirection5', 'seekingDirection6'],
      },
      {
        key: 'seekingProbability',
        questions: ['seekingProbability1', 'seekingProbability2', 'seekingProbability3', 'seekingProbability4', 'seekingProbability5', 'seekingProbability6'],
      },
    ],
  },
]

const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

// ============================================================
// SEO
// ============================================================
const pageDescription = computed(() => {
  if (phase.value === 'result' && result.value?.hexagram) {
    return t('liuyaoSeeking.shareText', {
      lostItem: form.lostItemDesc,
      benGua: result.value.hexagram.本卦,
      bianGua: result.value.hexagram.变卦,
    })
  }
  return t('seo.liuyaoSeekingDesc')
})

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.liuyaoSeekingTitle')} - ${siteName}`,
  description: pageDescription,
  keywords: t('seo.liuyaoSeekingKeywords'),
  ogTitle: () => `${t('seo.liuyaoSeekingOgTitle')} - ${siteName}`,
  ogDescription: pageDescription,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/liuyao-seeking',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.liuyaoSeekingTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/liuyao-seeking',
        description: pageDescription.value,
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('liuyaoSeeking.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/liuyao-seeking',
          description: t('liuyaoSeeking.subtitle'),
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'CNY',
          },
        },
      }),
    },
  ],
}))
</script>

<style scoped>
/* 隐藏截图目标：固定竖版海报宽度，html-to-image 按此出图（移动端竖版比例） */
.liuyao-seeking-share-target {
  width: 720px;
}
/* 卦师解读状态条：融入海报之下，与海报间距收窄 */
.liuyao-seeking-ai-bar {
  margin-top: 10px;
  padding: 0 4px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.outer-dashed-ring {
  animation: spin-dashed 24s linear infinite;
}
.outer-solid-ring {
  animation: spin-solid 16s linear infinite reverse;
}
.inner-ring {
  animation: spin-inner 20s linear infinite;
}
.center-pulse {
  animation: pulse-glow 2s ease-in-out infinite;
}
.radar-sweep {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50%;
  height: 50%;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(201, 162, 39, 0.15) 60deg, rgba(201, 162, 39, 0.35) 90deg, transparent 120deg);
  transform-origin: 0 0;
  animation: radar-sweep 2s linear infinite;
  border-radius: 0 100% 0 0;
}
.radar-dot {
  animation: radar-dot-pulse 2s ease-in-out infinite;
}
@keyframes spin-dashed {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes spin-solid {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes spin-inner {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(201, 162, 39, 0.2), 0 0 40px rgba(201, 162, 39, 0.05); }
  50% { box-shadow: 0 0 30px rgba(201, 162, 39, 0.35), 0 0 60px rgba(201, 162, 39, 0.1); }
}
@keyframes radar-sweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes radar-dot-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
</style>
