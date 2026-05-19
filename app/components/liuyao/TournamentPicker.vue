<template>
  <div class="space-y-5">
    <!-- 当前赛事阶段提示 -->
    <div class="flex items-center justify-between">
      <p class="text-xs text-[#e8e0d0]/40">
        {{ currentPhaseLabel }}
      </p>
      <button
        v-if="subject.home || subject.away"
        type="button"
        class="text-[10px] text-[#e8e0d0]/30 hover:text-red-400 transition-colors"
        @click="clearSelection"
      >
        {{ $t('tournamentPicker.reset') }}
      </button>
    </div>

    <!-- 已选队伍确认（取代世/应绑定状态） -->
    <div v-if="isComplete" class="rounded-xl border border-[#c9a227]/20 bg-[#c9a227]/[0.03] p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-base">{{ getFlag(subject.home!.id) }}</span>
          <div>
            <p class="text-sm font-semibold text-[#f5e6c0]">
              <span class="text-[10px] text-[#c9a227] mr-1">{{ $t('tournamentPicker.homeTeam') }}</span>
              {{ getTeamName(subject.home!.id, subject.home!.name) }}
            </p>
          </div>
        </div>
        <span class="text-xs text-[#e8e0d0]/30 font-medium">{{ $t('tournamentPicker.VS') }}</span>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-sm font-semibold text-[#f5e6c0]">
              <span class="text-[10px] text-[#e8e0d0]/40 mr-1">{{ $t('tournamentPicker.awayTeam') }}</span>
              {{ getTeamName(subject.away!.id, subject.away!.name) }}
            </p>
          </div>
          <span class="text-base">{{ getFlag(subject.away!.id) }}</span>
        </div>
      </div>
    </div>

    <!-- 未选或未选完时显示选择器 -->
    <template v-if="!isComplete">
      <!-- ========== 小组赛选择器 ========== -->
      <template v-if="activeTab === 'group'">
        <div class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[#e8e0d0]/60">
            {{ $t('tournamentPicker.selectGroup') }}
          </label>
          <div class="grid grid-cols-6 gap-1.5">
            <button
              v-for="groupName in groupNames"
              :key="groupName"
              type="button"
              class="py-2 rounded-lg text-xs font-medium transition-all duration-200"
              :class="selectedGroup === groupName
                ? 'bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227]'
                : 'bg-white/[0.02] border border-white/5 text-[#e8e0d0]/50 hover:text-[#e8e0d0]/70'"
              @click="selectedGroup = groupName"
            >
              {{ getGroupName(groupName, groupName) }}
            </button>
          </div>
        </div>

        <div v-if="selectedGroup" class="space-y-1.5">
          <label class="flex items-center gap-1 text-xs font-medium text-[#e8e0d0]/60">
            {{ $t('tournamentPicker.selectTeam', { group: getGroupName(selectedGroup, selectedGroup) }) }}
            <span class="text-[#e8e0d0]/30 font-normal">
              ({{ selectionHint }})
            </span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="team in currentGroupTeams"
              :key="team.id"
              type="button"
              class="flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm transition-all duration-200"
              :class="teamButtonClass(team)"
              @click="selectTeam(team)"
            >
              <span class="text-base">{{ getFlag(team.id) }}</span>
              <span class="truncate">{{ getTeamName(team.id, team.name) }}</span>
              <span v-if="isTeamSelected(team)" class="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
                :class="subject.home?.id === team.id
                  ? 'bg-[#c9a227]/20 text-[#c9a227]'
                  : 'bg-white/10 text-[#e8e0d0]/50'"
              >
                {{ subject.home?.id === team.id ? $t('tournamentPicker.homeTeam').charAt(0) : $t('tournamentPicker.awayTeam').charAt(0) }}
              </span>
            </button>
          </div>
        </div>
      </template>

      <!-- ========== 淘汰赛选择器 ========== -->
      <template v-if="activeTab === 'knockout'">
        <div v-if="bracketMatches.length === 0" class="text-center py-8">
          <UIcon name="i-heroicons-calendar" class="w-8 h-8 text-[#e8e0d0]/15 mx-auto mb-2" />
          <p class="text-xs text-[#e8e0d0]/30">{{ $t('tournamentPicker.noKnockoutData') }}</p>
          <p class="text-[10px] text-[#e8e0d0]/20 mt-1">{{ $t('tournamentPicker.knockoutNote') }}</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="match in availableKnockoutMatches"
            :key="match.id"
            class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-200 cursor-pointer hover:border-[#c9a227]/20"
            :class="{ 'opacity-40 pointer-events-none': match.finished }"
            @click="selectKnockoutMatch(match)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-base">{{ getFlag(match.home.id) }}</span>
                <span class="text-sm text-[#f5e6c0]">{{ getTeamName(match.home.id, match.home.name) }}</span>
              </div>
              <span class="text-xs text-[#e8e0d0]/30">{{ $t('tournamentPicker.VS') }}</span>
              <div class="flex items-center gap-2">
                <span class="text-sm text-[#f5e6c0]">{{ getTeamName(match.away.id, match.away.name) }}</span>
                <span class="text-base">{{ getFlag(match.away.id) }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between mt-2">
              <span class="text-[10px] text-[#e8e0d0]/25">{{ match.stage }}</span>
              <span v-if="match.finished && match.winner" class="text-[10px] text-emerald-400/60">
                {{ $t('tournamentPicker.advancement') }}: {{ match.winner === match.home.id ? match.home.name : match.away.name }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { WorldCupTeam, KnockoutMatch } from '~/types/liuyao'

const { t } = useI18n()

// 翻译队伍名称
function getTeamName(id: string, fallbackName: string): string {
  const key = `teams.${id}`
  const translated = t(key)
  return translated === key ? fallbackName : translated
}

// 翻译组别名称
function getGroupName(groupKey: string, fallbackName: string): string {
  const key = `groups.${groupKey}`
  const translated = t(key)
  return translated === key ? fallbackName : translated
}

const props = defineProps<{
  groups: Record<string, WorldCupTeam[]>
  bracket?: { matches: KnockoutMatch[] }
}>()

const emit = defineEmits<{
  update: [value: { home: WorldCupTeam | null; away: WorldCupTeam | null }]
}>()

const activeTab = ref<'group' | 'knockout'>('group')
const selectedGroup = ref<string>('')
const subject = reactive<{ home: WorldCupTeam | null; away: WorldCupTeam | null }>({
  home: null,
  away: null,
})

const groupNames = computed(() => Object.keys(props.groups))

const currentPhaseLabel = computed(() => {
  if (activeTab.value === 'group') return t('liuyaoPage.phaseGroup')
  return t('liuyaoPage.phaseKnockout')
})

const currentGroupTeams = computed(() => {
  if (!selectedGroup.value) return []
  return props.groups[selectedGroup.value] || []
})

const bracketMatches = computed(() => props.bracket?.matches || [])

const availableKnockoutMatches = computed(() => {
  return bracketMatches.value.filter(m => !m.finished)
})

const selectionHint = computed(() => {
  if (!subject.home && !subject.away) return t('tournamentPicker.selectHint.none')
  if (subject.home && !subject.away) return t('tournamentPicker.selectHint.homeOnly')
  if (!subject.home && subject.away) return t('tournamentPicker.selectHint.awayOnly')
  return t('tournamentPicker.selectHint.complete')
})

const isComplete = computed(() => !!subject.home && !!subject.away)

// 国旗 emoji 映射（简化版，覆盖 48 队）
const FLAG_MAP: Record<string, string> = {
  MEX: '🇲🇽', RSA: '🇿🇦', KOR: '🇰🇷', CZE: '🇨🇿',
  CAN: '🇨🇦', BIH: '🇧🇦', QAT: '🇶🇦', SUI: '🇨🇭',
  BRA: '🇧🇷', MAR: '🇲🇦', HAI: '🇭🇹', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  USA: '🇺🇸', PAR: '🇵🇾', AUS: '🇦🇺', TUR: '🇹🇷',
  GER: '🇩🇪', CUW: '🇨🇼', CIV: '🇨🇮', ECU: '🇪🇨',
  NED: '🇳🇱', JPN: '🇯🇵', SWE: '🇸🇪', TUN: '🇹🇳',
  BEL: '🇧🇪', EGY: '🇪🇬', IRN: '🇮🇷', NZL: '🇳🇿',
  ESP: '🇪🇸', CPV: '🇨🇻', KSA: '🇸🇦', URU: '🇺🇾',
  FRA: '🇫🇷', SEN: '🇸🇳', NOR: '🇳🇴', IRQ: '🇮🇶',
  ARG: '🇦🇷', ALG: '🇩🇿', AUT: '🇦🇹', JOR: '🇯🇴',
  POR: '🇵🇹', COD: '🇨🇩', UZB: '🇺🇿', COL: '🇨🇴',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', CRO: '🇭🇷', GHA: '🇬🇭', PAN: '🇵🇦',
}

function getFlag(id: string): string {
  return FLAG_MAP[id] || '🏳️'
}

function isTeamSelected(team: WorldCupTeam): boolean {
  return subject.home?.id === team.id || subject.away?.id === team.id
}

function teamButtonClass(team: WorldCupTeam): string {
  if (subject.home?.id === team.id) {
    return 'bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227]'
  }
  if (subject.away?.id === team.id) {
    return 'bg-white/[0.04] border border-white/10 text-[#e8e0d0]/70'
  }
  return 'bg-white/[0.02] border border-white/5 text-[#e8e0d0]/50 hover:bg-white/[0.04] hover:text-[#e8e0d0]/70'
}

function selectTeam(team: WorldCupTeam) {
  if (subject.home?.id === team.id) {
    subject.home = null
  } else if (subject.away?.id === team.id) {
    subject.away = null
  } else if (!subject.home) {
    subject.home = team
  } else if (!subject.away && subject.home.id !== team.id) {
    subject.away = team
  }
  emit('update', { home: subject.home, away: subject.away })
}

function selectKnockoutMatch(match: KnockoutMatch) {
  if (match.finished) return
  subject.home = match.home
  subject.away = match.away
  emit('update', { home: subject.home, away: subject.away })
}

function clearSelection() {
  subject.home = null
  subject.away = null
  selectedGroup.value = ''
  emit('update', { home: null, away: null })
}

watch(activeTab, () => {
  clearSelection()
})
</script>
