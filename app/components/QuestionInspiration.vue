<template>
  <div>
    <!-- 触发按钮 -->
    <button
      type="button"
      class="inline-flex items-center gap-1 text-xs text-[var(--accent-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
      @click="open = true"
    >
      <UIcon name="i-heroicons-light-bulb" class="w-3.5 h-3.5" />
      {{ $t('questionInspiration.button') }}
    </button>

    <!-- 弹窗遮罩 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="open"
          class="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-8 px-4 bg-black/40 backdrop-blur-sm overflow-hidden"
          @click.self="open = false"
        >
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-2"
          >
            <div
              v-if="open"
              class="w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] shadow-2xl overflow-hidden"
            >
              <!-- 头部 -->
              <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 text-[var(--accent)]" />
                  <h3 class="text-base font-semibold text-[var(--text-primary)]">
                    {{ $t('questionInspiration.title') }}
                  </h3>
                </div>
                <button
                  type="button"
                  class="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                  @click="open = false"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                </button>
              </div>

              <!-- Tab 栏 -->
              <div class="flex border-b border-[var(--border-light)]">
                <button
                  v-for="cat in effectiveCategories"
                  :key="cat.key"
                  type="button"
                  class="flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap"
                  :class="activeTab === cat.key
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'"
                  @click="activeTab = cat.key"
                >
                  {{ $t(`questionInspiration.categories.${cat.key}`) }}
                </button>
              </div>

              <!-- 内容区 -->
              <div class="flex-1 overflow-y-auto p-5 space-y-5">
                <div
                  v-for="group in activeGroups"
                  :key="group.key"
                >
                  <h4 class="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
                    {{ $t(`questionInspiration.groups.${group.key}`) }}
                  </h4>
                  <div class="space-y-1.5">
                    <button
                      v-for="(q, idx) in group.questions"
                      :key="idx"
                      type="button"
                      class="w-full text-left px-3.5 py-2.5 rounded-lg text-sm text-[var(--text-body)] bg-[var(--surface-card)] border border-[var(--border-light)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] hover:border-[var(--accent-border-hover)] transition-colors cursor-pointer leading-relaxed"
                      @click="selectQuestion(q)"
                    >
                      {{ $t(`questionInspiration.questions.${q}`) }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  (e: 'select', question: string): void
}>()

const { t } = useI18n()

interface QuestionGroup {
  key: string
  questions: string[]
}

export interface InspirationCategory {
  key: string
  groups: QuestionGroup[]
}

const props = defineProps<{
  categories?: InspirationCategory[]
  extraCategories?: InspirationCategory[]
}>()

const defaultCategories: InspirationCategory[] = [
  {
    key: 'love',
    groups: [
      { key: 'loveDevelopment', questions: ['loveDev1', 'loveDev2', 'loveDev3', 'loveDev4', 'loveDev5', 'loveDev6'] },
      { key: 'loveMarriage', questions: ['loveMar1', 'loveMar2', 'loveMar3', 'loveMar4', 'loveMar5', 'loveMar6'] },
      { key: 'loveProblem', questions: ['loveProb1', 'loveProb2', 'loveProb3', 'loveProb4', 'loveProb5', 'loveProb6'] },
    ],
  },
  {
    key: 'career',
    groups: [
      { key: 'careerDevelopment', questions: ['careerDev1', 'careerDev2', 'careerDev3', 'careerDev4', 'careerDev5', 'careerDev6'] },
      { key: 'careerOpportunity', questions: ['careerOpp1', 'careerOpp2', 'careerOpp3', 'careerOpp4', 'careerOpp5', 'careerOpp6'] },
      { key: 'careerStartup', questions: ['careerStart1', 'careerStart2', 'careerStart3', 'careerStart4', 'careerStart5', 'careerStart6'] },
    ],
  },
  {
    key: 'wealth',
    groups: [
      { key: 'wealthTrend', questions: ['wealthTrend1', 'wealthTrend2', 'wealthTrend3', 'wealthTrend4', 'wealthTrend5', 'wealthTrend6'] },
      { key: 'wealthInvest', questions: ['wealthInv1', 'wealthInv2', 'wealthInv3', 'wealthInv4', 'wealthInv5', 'wealthInv6'] },
      { key: 'wealthStatus', questions: ['wealthStat1', 'wealthStat2', 'wealthStat3', 'wealthStat4', 'wealthStat5', 'wealthStat6'] },
    ],
  },
  {
    key: 'social',
    groups: [
      { key: 'socialPattern', questions: ['socPat1', 'socPat2', 'socPat3', 'socPat4', 'socPat5', 'socPat6'] },
      { key: 'socialNoble', questions: ['socNob1', 'socNob2', 'socNob3', 'socNob4', 'socNob5', 'socNob6'] },
      { key: 'socialFamily', questions: ['socFam1', 'socFam2', 'socFam3', 'socFam4', 'socFam5', 'socFam6'] },
    ],
  },
  {
    key: 'growth',
    groups: [
      { key: 'growthStudy', questions: ['growStudy1', 'growStudy2', 'growStudy3', 'growStudy4', 'growStudy5', 'growStudy6'] },
      { key: 'growthPersonal', questions: ['growPers1', 'growPers2', 'growPers3', 'growPers4', 'growPers5', 'growPers6'] },
      { key: 'growthLife', questions: ['growLife1', 'growLife2', 'growLife3', 'growLife4', 'growLife5', 'growLife6'] },
    ],
  },
]

const effectiveCategories = computed(() => {
  if (props.categories) return props.categories
  if (props.extraCategories?.length) return [...props.extraCategories, ...defaultCategories]
  return defaultCategories
})

const activeTab = ref('')

watch(effectiveCategories, (cats) => {
  if (cats.length > 0 && !cats.find(c => c.key === activeTab.value)) {
    activeTab.value = cats[0]!.key
  }
}, { immediate: true })

const activeGroups = computed(() => {
  const cat = effectiveCategories.value.find(c => c.key === activeTab.value)
  return cat?.groups ?? []
})

function selectQuestion(key: string) {
  emit('select', t(`questionInspiration.questions.${key}`))
  open.value = false
}
</script>
