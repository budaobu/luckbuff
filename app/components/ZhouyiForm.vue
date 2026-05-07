<template>
  <div class="space-y-5">
    <!-- 起卦方式选择 -->
    <div class="space-y-1.5">
      <label class="flex items-center gap-1 text-xs font-medium text-[#e8e0d0]/60">
        起卦方式
        <span class="text-[#c9a227]">*</span>
      </label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="m in methods"
          :key="m.key"
          type="button"
          class="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200"
          :class="method === m.key
            ? 'border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227]'
            : 'border-white/8 bg-white/[0.02] text-[#e8e0d0]/50 hover:border-white/15 hover:text-[#e8e0d0]/70'"
          @click="method = m.key"
        >
          <UIcon :name="m.icon" class="w-3.5 h-3.5" />
          {{ m.label }}
        </button>
      </div>
    </div>

    <!-- ========== 时间起卦 ========== -->
    <template v-if="method === 'time'">
      <!-- 起卦日期 -->
      <div class="space-y-1.5">
        <label class="flex items-center gap-1 text-xs font-medium text-[#e8e0d0]/60">
          起卦日期
          <span class="text-[#c9a227]">*</span>
        </label>
        <UPopover>
          <UButton
            color="neutral"
            variant="outline"
            class="w-full justify-start bg-white/[0.03] border-white/8 text-[#f5e6c0] hover:bg-white/[0.05] hover:border-white/15"
            :class="{ 'text-[#e8e0d0]/25': !timeForm.date }"
          >
            <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[#e8e0d0]/40" />
            {{ timeForm.date && calendarDate ? df.format(calendarDate.toDate(tz)) : '选择日期' }}
          </UButton>
          <template #content>
            <UCalendar
              v-model="calendarDate"
              color="warning"
              class="p-2"
              :ui="{
                root: 'bg-[#0f0c09] border border-white/8 rounded-xl shadow-2xl',
                header: 'bg-[#0f0c09]',
                body: 'bg-[#0f0c09]',
                grid: 'bg-[#0f0c09]',
                heading: 'text-[#f5e6c0] font-medium',
                headCell: 'text-[#e8e0d0]/40',
                cellTrigger: 'text-[#f5e6c0] hover:bg-white/[0.04] data-[selected]:bg-[#c9a227] data-[selected]:text-[#1a1612]',
              }"
            />
          </template>
        </UPopover>
        <p class="text-[10px] text-[#e8e0d0]/30">梅花易数使用农历计算，后台自动转换</p>
      </div>

      <!-- 起卦时辰 -->
      <div class="space-y-1.5">
        <label class="text-xs font-medium text-[#e8e0d0]/60">起卦时辰（可选，默认当前）</label>
        <USelect
          v-model="timeForm.hour"
          :items="hourOptions"
          placeholder="选择时辰"
          color="warning"
          class="w-full"
          :ui="{
            base: 'w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-[#c9a227]/50 text-[#f5e6c0]',
            placeholder: 'text-[#e8e0d0]/25',
            content: 'bg-[#1a1612] border border-white/8 rounded-xl shadow-2xl',
            item: 'text-[#f5e6c0] hover:bg-white/[0.04] data-[state=checked]:bg-[#c9a227]/10 data-[state=checked]:text-[#c9a227]',
          }"
        />
      </div>
    </template>

    <!-- ========== 数字起卦 ========== -->
    <template v-if="method === 'numbers'">
      <div class="space-y-1.5">
        <label class="flex items-center gap-1 text-xs font-medium text-[#e8e0d0]/60">
          第一个数字
          <span class="text-[#c9a227]">*</span>
        </label>
        <UInput
          v-model.number="numbersForm.num1"
          type="number"
          placeholder="如：6"
          color="warning"
          class="w-full"
          :ui="{ base: 'w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25' }"
        />
        <p class="text-[10px] text-[#e8e0d0]/30">÷8 余数 = 上卦</p>
      </div>

      <div class="space-y-1.5">
        <label class="flex items-center gap-1 text-xs font-medium text-[#e8e0d0]/60">
          第二个数字
          <span class="text-[#c9a227]">*</span>
        </label>
        <UInput
          v-model.number="numbersForm.num2"
          type="number"
          placeholder="如：8"
          color="warning"
          class="w-full"
          :ui="{ base: 'w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25' }"
        />
        <p class="text-[10px] text-[#e8e0d0]/30">÷8 余数 = 下卦</p>
      </div>

      <div class="space-y-1.5">
        <label class="text-xs font-medium text-[#e8e0d0]/60">第三个数字（动爻，可选）</label>
        <UInput
          v-model.number="numbersForm.num3"
          type="number"
          placeholder="不填则自动计算"
          color="warning"
          class="w-full"
          :ui="{ base: 'w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25' }"
        />
        <p class="text-[10px] text-[#e8e0d0]/30">÷6 余数 = 动爻。不填则用 (第一数+第二数)÷6</p>
      </div>
    </template>

    <!-- ========== 测字起卦 ========== -->
    <template v-if="method === 'character'">
      <div class="space-y-1.5">
        <label class="flex items-center gap-1 text-xs font-medium text-[#e8e0d0]/60">
          汉字
          <span class="text-[#c9a227]">*</span>
        </label>
        <UInput
          v-model="charForm.char"
          placeholder="输入一个或两个汉字"
          color="warning"
          class="w-full"
          maxlength="2"
          :ui="{ base: 'w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25' }"
        />
        <p class="text-[10px] text-[#e8e0d0]/30">
          单字：笔画数÷8=卦象，÷6=动爻
          双字：第一字÷8=上卦，第二字÷8=下卦，笔画和÷6=动爻
        </p>
      </div>
    </template>

    <!-- 具体问题 -->
    <div class="space-y-1.5">
      <label class="flex items-center gap-1 text-xs font-medium text-[#e8e0d0]/60">
        具体问题
        <span class="text-[#c9a227]">*</span>
      </label>
      <UTextarea
        v-model="query"
        placeholder="如：我最近工作不顺，想问问事业方向..."
        color="warning"
        :rows="3"
        class="w-full"
        :ui="{
          base: 'w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-[#c9a227]/50 text-[#f5e6c0] placeholder:text-[#e8e0d0]/25',
        }"
      />
      <p class="text-[10px] text-[#e8e0d0]/30">无疑不卜 — 问题越具体，断卦越准确</p>
    </div>

    <UButton
      color="warning"
      size="lg"
      block
      :disabled="!isValid"
      class="mt-2 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
      @click="handleSubmit"
    >
      <template #leading>
        <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
      </template>
      立即起卦
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { QiguaInput } from '~/types/zhouyi'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate, now } from '@internationalized/date'

const emit = defineEmits<{
  submit: [values: QiguaInput]
}>()

const methods = [
  { key: 'time' as const, label: '时间起卦', icon: 'i-heroicons-clock' },
  { key: 'numbers' as const, label: '数字起卦', icon: 'i-heroicons-numbered-list' },
  { key: 'character' as const, label: '测字起卦', icon: 'i-heroicons-pencil' },
]

const method = ref<'time' | 'numbers' | 'character'>('time')

// 时间起卦表单
const timeForm = reactive({
  date: '',
  hour: undefined as number | undefined,
})

// 数字起卦表单
const numbersForm = reactive({
  num1: undefined as number | undefined,
  num2: undefined as number | undefined,
  num3: undefined as number | undefined,
})

// 测字起卦表单
const charForm = reactive({
  char: '',
})

const query = ref('')

// 日历相关
const tz = getLocalTimeZone()
const df = new DateFormatter('zh-CN', { dateStyle: 'long' })
const calendarDate = ref<CalendarDate | undefined>(undefined)

// 默认选中今天
onMounted(() => {
  const today = now(tz)
  calendarDate.value = new CalendarDate(today.year, today.month, today.day)
})

watch(calendarDate, () => {
  if (calendarDate.value) {
    timeForm.date = `${calendarDate.value.year}-${String(calendarDate.value.month).padStart(2, '0')}-${String(calendarDate.value.day).padStart(2, '0')}`
  } else {
    timeForm.date = ''
  }
})

// 时辰选项
const hourOptions = [
  { label: '子时（23:00-00:59）', value: 0 },
  { label: '丑时（01:00-02:59）', value: 2 },
  { label: '寅时（03:00-04:59）', value: 4 },
  { label: '卯时（05:00-06:59）', value: 6 },
  { label: '辰时（07:00-08:59）', value: 8 },
  { label: '巳时（09:00-10:59）', value: 10 },
  { label: '午时（11:00-12:59）', value: 12 },
  { label: '未时（13:00-14:59）', value: 14 },
  { label: '申时（15:00-16:59）', value: 16 },
  { label: '酉时（17:00-18:59）', value: 18 },
  { label: '戌时（19:00-20:59）', value: 20 },
  { label: '亥时（21:00-22:59）', value: 22 },
]

// 验证
const isValid = computed(() => {
  if (!query.value.trim()) return false

  switch (method.value) {
    case 'time':
      return !!timeForm.date
    case 'numbers':
      return numbersForm.num1 !== undefined && numbersForm.num2 !== undefined
    case 'character':
      return charForm.char.trim().length > 0
    default:
      return false
  }
})

function handleSubmit() {
  let input: QiguaInput

  switch (method.value) {
    case 'time': {
      const [y, m, d] = timeForm.date.split('-').map(Number)
      input = {
        method: 'time',
        year: y,
        month: m,
        day: d,
        hour: timeForm.hour ?? new Date().getHours(),
        query: query.value,
      }
      break
    }
    case 'numbers': {
      input = {
        method: 'numbers',
        num1: numbersForm.num1!,
        num2: numbersForm.num2!,
        num3: numbersForm.num3,
        query: query.value,
      }
      break
    }
    case 'character': {
      input = {
        method: 'character',
        char: charForm.char.trim(),
        query: query.value,
      }
      break
    }
  }

  emit('submit', input)
}
</script>
