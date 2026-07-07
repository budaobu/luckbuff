<template>
  <div class="space-y-5">
    <!-- 已选队伍确认 -->
    <div v-if="isComplete" class="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-faint)] p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-base">{{ getFlag(subject.home!.id) }}</span>
          <div>
            <p class="text-sm font-semibold text-[var(--text-primary)]">
              <span class="text-[10px] text-[var(--accent)] mr-1">{{ $t('tournamentPicker.homeTeam') }}</span>
              {{ getTeamName(subject.home!.id, subject.home!.name) }}
            </p>
            <p class="text-[10px] text-[var(--text-faint)]">{{ getGroupLabel(subject.home!.id) }}</p>
          </div>
        </div>
        <span class="text-xs text-[var(--text-placeholder)] font-medium">{{ $t('tournamentPicker.VS') }}</span>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-sm font-semibold text-[var(--text-primary)]">
              <span class="text-[10px] text-[var(--text-faint)] mr-1">{{ $t('tournamentPicker.awayTeam') }}</span>
              {{ getTeamName(subject.away!.id, subject.away!.name) }}
            </p>
            <p class="text-[10px] text-[var(--text-faint)]">{{ getGroupLabel(subject.away!.id) }}</p>
          </div>
          <span class="text-base">{{ getFlag(subject.away!.id) }}</span>
        </div>
      </div>
      <div class="flex justify-center mt-3">
        <button
          type="button"
          class="text-[10px] text-[var(--text-placeholder)] hover:text-red-400 transition-colors"
          @click="clearSelection"
        >
          {{ $t('tournamentPicker.reset') }}
        </button>
      </div>
    </div>

    <!-- 选择器 -->
    <template v-if="!isComplete">
      <div class="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
        <!-- 主队 -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('tournamentPicker.homeTeam') }}</label>
          <USelectMenu
            v-model="homeId"
            :items="homeItems"
            :placeholder="$t('tournamentPicker.selectHome')"
            class="w-full"
            :ui="selectMenuUi"
          />
        </div>

        <div class="pb-2 text-xs text-[var(--text-placeholder)] font-medium">VS</div>

        <!-- 客队 -->
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('tournamentPicker.awayTeam') }}</label>
          <USelectMenu
            v-model="awayId"
            :items="awayItems"
            :placeholder="$t('tournamentPicker.selectAway')"
            class="w-full"
            :ui="selectMenuUi"
          />
        </div>
      </div>

      <!-- 提示 -->
      <p class="text-[10px] text-[var(--text-placeholder)] text-center">
        {{ selectionHint }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { WorldCupTeam } from '~/types/liuyao'

const { t } = useI18n()

const props = defineProps<{
  groups: Record<string, WorldCupTeam[]>
  eliminated?: string[]
}>()

const emit = defineEmits<{
  update: [value: { home: WorldCupTeam | null; away: WorldCupTeam | null }]
}>()

// 构建带 group 信息的平铺队伍列表
interface TeamWithGroup extends WorldCupTeam {
  group: string
}

const allTeams = computed<TeamWithGroup[]>(() => {
  const teams: TeamWithGroup[] = []
  for (const [groupName, groupTeams] of Object.entries(props.groups)) {
    for (const team of groupTeams) {
      teams.push({ ...team, group: groupName })
    }
  }
  return teams
})

// 过滤掉已淘汰的队伍
const availableTeams = computed<TeamWithGroup[]>(() => {
  if (!props.eliminated?.length) return allTeams.value
  const eliminatedSet = new Set(props.eliminated)
  return allTeams.value.filter(t => !eliminatedSet.has(t.id))
})

// 国旗 emoji 映射
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

function getTeamName(id: string, fallbackName: string): string {
  const key = `teams.${id}`
  const translated = t(key)
  return translated === key ? fallbackName : translated
}

function getGroupLabel(id: string): string {
  const team = allTeams.value.find(t => t.id === id)
  if (!team) return ''
  const key = `groups.${team.group}`
  const translated = t(key)
  return translated === key ? team.group : translated
}

const homeId = ref<string | { value: string }>('')
const awayId = ref<string | { value: string }>('')

const subject = reactive<{ home: WorldCupTeam | null; away: WorldCupTeam | null }>({
  home: null,
  away: null,
})

const isComplete = computed(() => !!subject.home && !!subject.away)

// 从 USelectMenu v-model 中提取选中值（可能是 string 或 { label, value } 对象）
function extractId(val: unknown): string {
  if (typeof val === 'string') return val
  if (val && typeof val === 'object' && 'value' in val) return (val as { value: string }).value
  return ''
}

// 构建 USelectMenu 的分组 items
const homeItems = computed(() => {
  const excludeId = extractId(awayId.value)
  return buildGroupItems(availableTeams.value.filter(t => t.id !== excludeId))
})

const awayItems = computed(() => {
  const excludeId = extractId(homeId.value)
  return buildGroupItems(availableTeams.value.filter(t => t.id !== excludeId))
})

function buildGroupItems(teams: TeamWithGroup[]) {
  const groups: Record<string, TeamWithGroup[]> = {}
  for (const team of teams) {
    if (!groups[team.group]) groups[team.group] = []
    groups[team.group]!.push(team)
  }

  const result: any[] = []
  for (const groupName of Object.keys(groups).sort((a, b) => a.localeCompare(b, 'zh'))) {
    const groupTeams = groups[groupName]!
    const groupLabel = t(`groups.${groupName}`) === `groups.${groupName}` ? groupName : t(`groups.${groupName}`)
    result.push({ type: 'label', label: groupLabel })
    for (const team of groupTeams) {
      result.push({
        label: `${getFlag(team.id)} ${getTeamName(team.id, team.name)}`,
        value: team.id,
      })
    }
  }
  return [result]
}

function emitUpdate() {
  emit('update', { home: subject.home, away: subject.away })
}

function clearSelection() {
  homeId.value = ''
  awayId.value = ''
  subject.home = null
  subject.away = null
  emitUpdate()
}

watch(homeId, (val) => {
  const id = typeof val === 'string' ? val : val?.value
  const team = availableTeams.value.find(t => t.id === id)
  subject.home = team || null
  emitUpdate()
})

watch(awayId, (val) => {
  const id = typeof val === 'string' ? val : val?.value
  const team = availableTeams.value.find(t => t.id === id)
  subject.away = team || null
  emitUpdate()
})

const selectionHint = computed(() => {
  if (!subject.home && !subject.away) return t('tournamentPicker.selectHint.none')
  if (subject.home && !subject.away) return t('tournamentPicker.selectHint.homeOnly')
  if (!subject.home && subject.away) return t('tournamentPicker.selectHint.awayOnly')
  return t('tournamentPicker.selectHint.complete')
})

const selectMenuUi = {
  base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
  placeholder: 'text-[var(--text-placeholder)]',
  content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl',
  item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
  label: 'text-[var(--text-faint)] text-[10px] uppercase tracking-wider px-3 py-1',
  viewport: 'max-h-64 overflow-y-auto',
}
</script>
