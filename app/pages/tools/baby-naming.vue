<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[8%] left-[10%] w-[480px] h-[480px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[15%] right-[8%] w-[380px] h-[380px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-10">
      <!-- Section 标题 -->
      <div class="text-center mb-10">
        <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-3 block">Baby Naming</span>
        <h1 class="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
          {{ $t('babyNaming.title') }}
        </h1>
        <p class="text-sm text-[var(--text-faint)] mt-3 max-w-lg mx-auto">
          {{ $t('babyNaming.subtitle') }}
        </p>
        <div class="w-12 h-px bg-[var(--accent-border-hover)] mx-auto mt-5" />
      </div>

      <!-- 顶部 tab：起名 / 我的收藏 / 历史记录 -->
      <div class="flex justify-center gap-2 mb-8">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="px-4 py-2 rounded-full text-sm transition-all duration-200 border"
          :class="activeTab === tab.key
            ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
            : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
          @click="activeTab = tab.key"
        >
          {{ $t(tab.labelKey) }}
          <span v-if="tab.badge" class="ml-1 text-xs opacity-70">{{ tab.badge }}</span>
        </button>
      </div>

      <!-- ============ Tab: 起名工作台 ============ -->
      <div v-if="activeTab === 'naming'" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- 左：宝宝信息表单 -->
        <div class="lg:col-span-4">
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden sticky top-4">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="p-5 border-b border-[var(--border-subtle)]">
              <h2 class="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)]" />
                {{ $t('babyNaming.formTitle') }}
              </h2>
            </div>
            <div class="p-5 space-y-5">
              <!-- 姓氏 -->
              <div>
                <label class="block text-sm text-[var(--text-muted)] mb-2">
                  {{ $t('babyNaming.surnameLabel') }} <span class="text-[var(--accent)]">*</span>
                </label>
                <UInput v-model="form.surname" :placeholder="$t('babyNaming.surnamePlaceholder')" maxlength="2" :ui="inputUi" />
              </div>

              <!-- 性别倾向 -->
              <div>
                <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('babyNaming.genderLabel') }}</label>
                <div class="flex gap-2">
                  <button
                    v-for="g in genderOptions"
                    :key="g.value"
                    type="button"
                    class="flex-1 py-2 rounded-lg border text-sm transition-all duration-200"
                    :class="form.gender === g.value
                      ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                      : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                    @click="form.gender = g.value"
                  >
                    {{ $t(g.labelKey) }}
                  </button>
                </div>
              </div>

              <!-- 出生时间 -->
              <div>
                <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('babyNaming.birthLabel') }}</label>
                <div class="flex gap-2 mb-2">
                  <button
                    v-for="cal in calendarOptions"
                    :key="cal.value"
                    type="button"
                    class="px-3 py-1.5 rounded-lg border text-xs transition-all duration-200"
                    :class="form.calendar === cal.value
                      ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                      : 'border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                    @click="form.calendar = cal.value"
                  >
                    {{ $t(cal.labelKey) }}
                  </button>
                </div>
                <div v-if="form.calendar === 'solar'" class="flex gap-2">
                  <UPopover class="flex-1">
                    <UButton
                      color="neutral"
                      variant="outline"
                      class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                      :class="{ 'text-[var(--text-placeholder)]': !form.birthDate }"
                    >
                      <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                      {{ form.birthDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('babyNaming.birthDatePlaceholder') }}
                    </UButton>
                    <template #content>
                      <AppCalendar v-model="calendarDate" color="warning" class="p-2" />
                    </template>
                  </UPopover>
                  <USelect
                    v-model="form.birthHourDizhi"
                    :items="hourOptions"
                    :placeholder="$t('babyNaming.birthHourPlaceholder')"
                    color="warning"
                    class="w-32"
                    :ui="selectUi"
                  />
                </div>
                <div v-else class="space-y-2">
                  <div class="flex gap-2">
                    <USelect v-model="form.lunarYear" :items="lunarYearOptions" color="warning" class="flex-1" :ui="selectUi" />
                    <USelect v-model="form.lunarMonth" :items="lunarMonthOptions" color="warning" class="flex-1" :ui="selectUi" />
                    <USelect v-model="form.lunarDay" :items="lunarDayOptions" color="warning" class="flex-1" :ui="selectUi" />
                  </div>
                  <div class="flex items-center justify-between gap-2">
                    <label class="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <input v-model="form.lunarLeap" type="checkbox" class="accent-[var(--accent)]" />
                      {{ $t('babyNaming.leapMonth') }}
                    </label>
                    <USelect
                      v-model="form.birthHourDizhi"
                      :items="hourOptions"
                      :placeholder="$t('babyNaming.birthHourPlaceholder')"
                      color="warning"
                      class="w-32"
                      :ui="selectUi"
                    />
                  </div>
                </div>
                <p v-if="lunarPreview" class="text-[11px] text-[var(--text-faint)] mt-1.5">{{ lunarPreview }}</p>
                <p v-if="birthError" class="text-[11px] text-red-400 mt-1.5">{{ birthError }}</p>
              </div>

              <!-- 出生地（可选，仅记录） -->
              <div>
                <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('babyNaming.regionLabel') }}</label>
                <div class="flex gap-2">
                  <UInput v-model="form.province" :placeholder="$t('babyNaming.provincePlaceholder')" class="flex-1" :ui="inputUi" />
                  <UInput v-model="form.city" :placeholder="$t('babyNaming.cityPlaceholder')" class="flex-1" :ui="inputUi" />
                </div>
                <p class="text-[11px] text-[var(--text-faint)] mt-1.5">{{ $t('babyNaming.regionHint') }}</p>
              </div>

              <!-- 名字字数 -->
              <div>
                <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('babyNaming.nameLengthLabel') }}</label>
                <div class="flex gap-2">
                  <button
                    v-for="len in [1, 2]"
                    :key="len"
                    type="button"
                    class="flex-1 py-2 rounded-lg border text-sm transition-all duration-200"
                    :class="form.nameLength === len
                      ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                      : 'border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                    @click="form.nameLength = len"
                  >
                    {{ $t(len === 1 ? 'babyNaming.singleName' : 'babyNaming.doubleName') }}
                  </button>
                </div>
              </div>

              <!-- 辈分字 -->
              <div>
                <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('babyNaming.generationLabel') }}</label>
                <UInput v-model="form.generationChar" :placeholder="$t('babyNaming.generationPlaceholder')" maxlength="1" :ui="inputUi" />
              </div>

              <!-- 喜欢的字 / 避讳的字 -->
              <div>
                <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('babyNaming.likedLabel') }}</label>
                <UInput v-model="form.likedCharsInput" :placeholder="$t('babyNaming.likedPlaceholder')" :ui="inputUi" />
                <p class="text-[11px] text-[var(--text-faint)] mt-1.5">{{ $t('babyNaming.charsHint') }}</p>
              </div>
              <div>
                <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('babyNaming.avoidedLabel') }}</label>
                <UInput v-model="form.avoidedCharsInput" :placeholder="$t('babyNaming.avoidedPlaceholder')" :ui="inputUi" />
              </div>

              <!-- 风格偏好 -->
              <div>
                <label class="block text-sm text-[var(--text-muted)] mb-3">{{ $t('babyNaming.styleLabel') }}</label>
                <div v-for="s in styleSliders" :key="s.key" class="mb-2.5">
                  <div class="flex justify-between text-[11px] text-[var(--text-faint)] mb-1">
                    <span>{{ $t(s.labelKey) }}</span>
                    <span>{{ styleLevelText(form.styles[s.key]) }}</span>
                  </div>
                  <input
                    v-model.number="form.styles[s.key]"
                    type="range"
                    min="0"
                    max="100"
                    step="25"
                    class="w-full accent-[var(--accent)]"
                  />
                </div>
              </div>

              <!-- 更多筛选 -->
              <div class="pt-3 border-t border-[var(--border-subtle)]">
                <label class="block text-sm text-[var(--text-muted)] mb-2">{{ $t('babyNaming.filterLabel') }}</label>
                <div class="space-y-2">
                  <label v-for="f in filterOptions" :key="f.key" class="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <input v-model="form.filters[f.key]" type="checkbox" class="accent-[var(--accent)]" />
                    {{ $t(f.labelKey) }}
                  </label>
                </div>
              </div>

              <!-- 生成按钮 -->
              <UButton
                block
                color="warning"
                size="lg"
                :loading="generating"
                :disabled="!canGenerate"
                @click="generate"
              >
                {{ $t('babyNaming.generateBtn') }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- 中：名字列表 -->
        <div class="lg:col-span-5">
          <div v-if="!result" class="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)]/50 p-10 text-center">
            <UIcon name="i-heroicons-pencil-square" class="w-10 h-10 text-[var(--text-faint)] mx-auto mb-3" />
            <p class="text-sm text-[var(--text-muted)]">{{ $t('babyNaming.emptyListTitle') }}</p>
            <p class="text-xs text-[var(--text-faint)] mt-1">{{ $t('babyNaming.emptyListDesc') }}</p>
          </div>

          <template v-else>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-[var(--text-primary)]">
                {{ $t('babyNaming.listTitle', { count: result.names.length }) }}
              </h2>
              <div class="flex items-center gap-2">
                <select v-model="sortBy" class="text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-input)] text-[var(--text-muted)] px-2 py-1.5">
                  <option value="score">{{ $t('babyNaming.sortScore') }}</option>
                  <option value="bazi">{{ $t('babyNaming.sortBazi') }}</option>
                  <option value="phonetics">{{ $t('babyNaming.sortPhonetics') }}</option>
                </select>
                <UButton size="xs" variant="soft" color="warning" :disabled="generating" @click="generate">
                  {{ $t('babyNaming.regenerateBtn') }}
                </UButton>
              </div>
            </div>

            <!-- 五行喜用提示条 -->
            <div class="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)]/50 px-4 py-3 mb-4 text-xs text-[var(--text-muted)]">
              <span class="text-[var(--accent)] font-medium">{{ $t('babyNaming.xiyongLabel') }}：</span>
              {{ result.chart.xiyong }} ·
              <span class="text-[var(--accent)] font-medium">{{ $t('babyNaming.jishenLabel') }}：</span>
              {{ result.chart.jishen }}
            </div>

            <div class="space-y-3">
              <div
                v-for="name in sortedNames"
                :key="name.fullName"
                class="group rounded-2xl border bg-[var(--surface-card)] p-4 cursor-pointer transition-all duration-300"
                :class="selectedName?.fullName === name.fullName
                  ? 'border-[var(--accent-border-hover)] ring-1 ring-[var(--accent-border)]'
                  : 'border-[var(--border-subtle)] hover:border-[var(--accent-border-hover)] hover:-translate-y-0.5'"
                @click="selectName(name)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      class="w-6 h-6 rounded border flex items-center justify-center transition-colors"
                      :class="compareList.includes(name.fullName)
                        ? 'border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent)]'
                        : 'border-[var(--border-light)] text-transparent hover:border-[var(--border-medium)]'"
                      :title="$t('babyNaming.compareAdd')"
                      @click.stop="toggleCompare(name.fullName)"
                    >
                      <UIcon name="i-heroicons-check" class="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <span class="text-xl font-serif font-bold text-[var(--text-primary)]">{{ name.fullName }}</span>
                      <span class="text-[11px] text-[var(--text-faint)] ml-2">{{ name.pinyin }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="text-right">
                      <div class="text-lg font-bold text-[var(--accent)]">{{ name.score }}</div>
                      <div class="text-[10px] text-[var(--text-faint)]">{{ name.scoreGrade }}</div>
                    </div>
                    <button
                      type="button"
                      class="transition-colors"
                      :class="store.isFavorite(name.fullName) ? 'text-[var(--accent)]' : 'text-[var(--text-faint)] hover:text-[var(--accent)]'"
                      :title="$t('babyNaming.favoriteToggle')"
                      @click.stop="toggleFavorite(name)"
                    >
                      <UIcon :name="store.isFavorite(name.fullName) ? 'i-heroicons-star-solid' : 'i-heroicons-star'" class="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div class="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span
                    v-for="b in name.wuxingBoost"
                    :key="b.element"
                    class="text-[10px] px-2 py-0.5 rounded-full border"
                    :class="b.matched
                      ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]'
                      : 'border-[var(--border-subtle)] text-[var(--text-faint)]'"
                  >
                    {{ $t('babyNaming.boost') }}{{ b.element }}{{ b.matched ? ' ✓' : '' }}
                  </span>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full border"
                    :class="riskClass(name.homophoneRisk)"
                  >
                    {{ $t('babyNaming.riskPrefix') }}{{ name.homophoneRisk }}
                  </span>
                </div>
                <p class="text-xs text-[var(--text-muted)] mt-2 leading-relaxed line-clamp-2">{{ name.meaningSummary }}</p>
              </div>
            </div>
          </template>
        </div>

        <!-- 右：解析面板 -->
        <div class="lg:col-span-3">
          <div v-if="!selectedName" class="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)]/50 p-8 text-center">
            <UIcon name="i-heroicons-document-magnifying-glass" class="w-9 h-9 text-[var(--text-faint)] mx-auto mb-3" />
            <p class="text-xs text-[var(--text-muted)]">{{ $t('babyNaming.emptyPanelTitle') }}</p>
          </div>

          <div v-else class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] overflow-hidden sticky top-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="p-5 border-b border-[var(--border-subtle)]">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-[11px] text-[var(--text-faint)]">{{ $t('babyNaming.panelTitle') }}</p>
                  <div class="flex items-baseline gap-2 mt-0.5">
                    <span class="text-2xl font-serif font-bold text-[var(--text-primary)]">{{ selectedName.fullName }}</span>
                    <span class="text-lg font-bold text-[var(--accent)]">{{ selectedName.score }}{{ $t('babyNaming.scoreUnit') }}</span>
                  </div>
                </div>
                <button
                  type="button"
                  class="transition-colors"
                  :class="store.isFavorite(selectedName.fullName) ? 'text-[var(--accent)]' : 'text-[var(--text-faint)] hover:text-[var(--accent)]'"
                  @click="toggleFavorite(selectedName)"
                >
                  <UIcon :name="store.isFavorite(selectedName.fullName) ? 'i-heroicons-star-solid' : 'i-heroicons-star'" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- 解析 tab -->
            <div class="flex gap-1 px-4 pt-3 overflow-x-auto">
              <button
                v-for="tab in panelTabs"
                :key="tab.key"
                type="button"
                class="px-2.5 py-1.5 rounded-lg text-[11px] whitespace-nowrap transition-colors"
                :class="panelTab === tab.key
                  ? 'bg-[var(--accent-bg)] text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'"
                @click="panelTab = tab.key"
              >
                {{ $t(tab.labelKey) }}
              </button>
            </div>

            <div class="p-4 text-xs text-[var(--text-muted)] space-y-4">
              <!-- 八字五行 -->
              <template v-if="panelTab === 'bazi'">
                <div>
                  <p class="text-[11px] text-[var(--text-faint)] mb-1.5">{{ $t('babyNaming.wuxingDist') }}（{{ $t('babyNaming.xiyongShort') }}：{{ result?.chart.xiyong }}）</p>
                  <div class="flex items-end gap-2 h-16">
                    <div v-for="(v, k) in result?.chart.wuxingScore" :key="k" class="flex-1 flex flex-col items-center gap-1">
                      <div class="w-full rounded-t" :style="{ height: Math.max(8, v) + 'px', background: wuxingColor(k as string) }" />
                      <span class="text-[10px]">{{ k }}</span>
                      <span class="text-[9px] text-[var(--text-faint)]">{{ v }}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p class="text-[11px] text-[var(--text-faint)] mb-1.5">{{ $t('babyNaming.pillarsTitle') }}</p>
                  <div class="grid grid-cols-4 gap-2 text-center">
                    <div v-for="(p, key) in result?.chart.pillars" :key="key" class="rounded-lg border border-[var(--border-subtle)] py-2">
                      <p class="text-[10px] text-[var(--text-faint)]">{{ pillarLabel(key as string) }}</p>
                      <p class="font-serif text-sm text-[var(--text-primary)] mt-0.5">{{ p ?? '—' }}</p>
                    </div>
                  </div>
                </div>
                <p class="leading-relaxed">{{ result?.chart.baziBrief }}</p>
              </template>

              <!-- 音律 -->
              <template v-else-if="panelTab === 'phonetics'">
                <p class="font-serif text-sm text-[var(--text-primary)]">{{ selectedName.pinyin }}</p>
                <ul class="space-y-1.5">
                  <li v-for="(note, i) in selectedName.phoneticNotes" :key="i" class="flex gap-1.5">
                    <span class="text-[var(--accent)]">·</span>{{ note }}
                  </li>
                </ul>
              </template>

              <!-- 字形 -->
              <template v-else-if="panelTab === 'structure'">
                <div class="space-y-2">
                  <div v-for="c in selectedName.chars" :key="c.char" class="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] p-2.5">
                    <span class="text-lg font-serif text-[var(--text-primary)] w-6 text-center">{{ c.char }}</span>
                    <div class="text-[11px]">
                      <p>{{ c.structure }} · {{ c.simplifiedStrokes }}{{ $t('babyNaming.strokesUnit') }}（{{ $t('babyNaming.tradPrefix') }}{{ c.traditionalStrokes }}）</p>
                    </div>
                  </div>
                </div>
                <ul class="space-y-1.5">
                  <li v-for="(note, i) in selectedName.structureNotes" :key="i" class="flex gap-1.5">
                    <span class="text-[var(--accent)]">·</span>{{ note }}
                  </li>
                </ul>
              </template>

              <!-- 寓意 -->
              <template v-else-if="panelTab === 'meaning'">
                <div v-for="c in selectedName.chars" :key="c.char" class="rounded-lg border border-[var(--border-subtle)] p-3">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-serif text-base text-[var(--text-primary)]">{{ c.char }}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">{{ c.wuxing }}</span>
                  </div>
                  <p class="leading-relaxed">{{ c.meaning }}</p>
                  <p class="text-[10px] text-[var(--text-faint)] mt-1">{{ c.source }}</p>
                </div>
              </template>

              <!-- 出处 -->
              <template v-else-if="panelTab === 'source'">
                <p class="leading-relaxed">{{ selectedName.sourceSummary }}</p>
                <p class="text-[11px] text-[var(--text-faint)]">{{ $t('babyNaming.sourceNote') }}</p>
              </template>

              <!-- 避讳 -->
              <template v-else-if="panelTab === 'taboo'">
                <span class="inline-block text-[10px] px-2 py-0.5 rounded-full border" :class="riskClass(selectedName.homophoneRisk)">
                  {{ $t('babyNaming.riskPrefix') }}{{ selectedName.homophoneRisk }}
                </span>
                <ul class="space-y-1.5 mt-2">
                  <li v-for="(note, i) in selectedName.homophoneNotes" :key="i" class="flex gap-1.5">
                    <span class="text-[var(--accent)]">·</span>{{ note }}
                  </li>
                </ul>
                <div class="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                  <p class="text-[11px] text-[var(--text-faint)] mb-1.5">{{ $t('babyNaming.wugeTitle') }}</p>
                  <div class="grid grid-cols-5 gap-1 text-center">
                    <div v-for="g in wugeRows" :key="g.label" class="rounded border border-[var(--border-subtle)] py-1.5">
                      <p class="text-[9px] text-[var(--text-faint)]">{{ g.label }}</p>
                      <p class="text-sm font-semibold text-[var(--text-primary)]">{{ g.value }}</p>
                      <p class="text-[9px]" :class="g.fortune.includes('吉') ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]'">{{ g.fortune }}</p>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- 综合评价 -->
            <div class="p-4 border-t border-[var(--border-subtle)]">
              <p class="text-[11px] text-[var(--text-faint)] mb-2">{{ $t('babyNaming.breakdownTitle') }}</p>
              <div v-for="row in selectedName.comparisonRows" :key="row.label" class="flex items-center gap-2 mb-1.5">
                <span class="text-[10px] text-[var(--text-muted)] w-14 shrink-0">{{ row.label }}</span>
                <div class="flex-1 h-1.5 rounded-full bg-[var(--surface-input)] overflow-hidden">
                  <div class="h-full rounded-full bg-[var(--accent)] transition-all" :style="{ width: (row.score / row.max * 100) + '%' }" />
                </div>
                <span class="text-[10px] text-[var(--text-faint)] w-9 text-right">{{ row.score }}/{{ row.max }}</span>
              </div>
            </div>

            <!-- AI 隐士解读 -->
            <div class="p-4 border-t border-[var(--border-subtle)]">
              <div class="flex items-center justify-between mb-2">
                <p class="text-[11px] text-[var(--text-faint)]">{{ $t('babyNaming.aiTitle') }}</p>
                <UButton size="xs" variant="soft" color="warning" :loading="aiStreaming" @click="startAiReading">
                  {{ aiContent ? $t('babyNaming.aiRetry') : $t('babyNaming.aiStart') }}
                </UButton>
              </div>
              <div v-if="aiError" class="text-[11px] text-red-400">{{ aiError }}</div>
              <div v-else-if="aiContent" class="prose prose-xs max-w-none text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">{{ aiContent }}<span v-if="aiStreaming" class="animate-pulse">▍</span></div>
              <p v-else class="text-[11px] text-[var(--text-faint)]">{{ $t('babyNaming.aiHint') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ Tab: 对比 ============ -->
      <div v-else-if="activeTab === 'compare'">
        <div v-if="compareNames.length === 0" class="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)]/50 p-10 text-center">
          <p class="text-sm text-[var(--text-muted)]">{{ $t('babyNaming.compareEmpty') }}</p>
        </div>
        <div v-else>
          <div class="flex justify-end mb-4">
            <UButton size="xs" variant="ghost" color="warning" @click="clearCompare()">{{ $t('babyNaming.compareClear') }}</UButton>
          </div>
          <div class="grid gap-4" :class="compareNames.length === 3 ? 'grid-cols-1 md:grid-cols-3' : compareNames.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto'">
            <div v-for="name in compareNames" :key="name.fullName" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 relative">
              <button type="button" class="absolute top-3 right-3 text-[var(--text-faint)] hover:text-[var(--text-primary)]" @click="removeCompare(name.fullName)">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
              <div class="text-center mb-4">
                <p class="text-2xl font-serif font-bold text-[var(--text-primary)]">{{ name.fullName }}</p>
                <p class="text-[11px] text-[var(--text-faint)]">{{ name.pinyin }}</p>
                <p class="text-xl font-bold text-[var(--accent)] mt-1">{{ name.score }}{{ $t('babyNaming.scoreUnit') }}</p>
                <div class="flex justify-center gap-1 mt-1">
                  <span v-for="b in name.wuxingBoost" :key="b.element" class="text-[9px] px-1.5 py-0.5 rounded-full border border-[var(--accent-border)] text-[var(--accent)]">{{ b.element }}</span>
                </div>
              </div>
              <div v-for="row in name.comparisonRows" :key="row.label" class="flex items-center gap-2 mb-1.5">
                <span class="text-[10px] text-[var(--text-muted)] w-14 shrink-0">{{ row.label }}</span>
                <div class="flex-1 h-1.5 rounded-full bg-[var(--surface-input)] overflow-hidden">
                  <div class="h-full rounded-full bg-[var(--accent)]" :style="{ width: (row.score / row.max * 100) + '%' }" />
                </div>
                <span class="text-[10px] text-[var(--text-faint)] w-9 text-right">{{ row.score }}/{{ row.max }}</span>
              </div>
              <p class="text-xs text-[var(--text-muted)] mt-3 leading-relaxed">{{ name.meaningSummary }}</p>
              <UButton size="xs" variant="soft" color="warning" block class="mt-3" :disabled="store.isFavorite(name.fullName)" @click="toggleFavorite(name)">
                {{ store.isFavorite(name.fullName) ? $t('babyNaming.favorited') : $t('babyNaming.favoriteAdd') }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ Tab: 收藏 ============ -->
      <div v-else-if="activeTab === 'favorites'">
        <div v-if="store.favorites.length === 0" class="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)]/50 p-10 text-center">
          <UIcon name="i-heroicons-star" class="w-10 h-10 text-[var(--text-faint)] mx-auto mb-3" />
          <p class="text-sm text-[var(--text-muted)]">{{ $t('babyNaming.favoritesEmpty') }}</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="fav in store.favorites" :key="fav.id" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-2xl font-serif font-bold text-[var(--text-primary)]">{{ fav.fullName }}</p>
                <p class="text-[11px] text-[var(--text-faint)]">{{ fav.pinyin }}</p>
              </div>
              <button type="button" class="text-[var(--text-faint)] hover:text-red-400 transition-colors" @click="store.removeFavorite(fav.fullName)">
                <UIcon name="i-heroicons-trash" class="w-4 h-4" />
              </button>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-lg font-bold text-[var(--accent)]">{{ fav.score }}{{ $t('babyNaming.scoreUnit') }}</span>
              <span class="text-[10px] text-[var(--text-faint)]">{{ fav.scoreGrade }}</span>
            </div>
            <p class="text-[11px] text-[var(--text-muted)] mt-2">
              {{ fav.birthDate }}{{ fav.birthHour !== null ? ' ' + String(fav.birthHour).padStart(2, '0') + ':00' : '' }} ·
              {{ fav.chartSnapshot.pillars.year }} {{ fav.chartSnapshot.pillars.month }} {{ fav.chartSnapshot.pillars.day }}
            </p>
            <p class="text-[10px] text-[var(--text-faint)] mt-1">{{ $t('babyNaming.savedAt') }} {{ formatTime(fav.savedAt) }}</p>
          </div>
        </div>
      </div>

      <!-- ============ Tab: 历史 ============ -->
      <div v-else-if="activeTab === 'history'">
        <div v-if="store.history.length === 0" class="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-card)]/50 p-10 text-center">
          <UIcon name="i-heroicons-clock" class="w-10 h-10 text-[var(--text-faint)] mx-auto mb-3" />
          <p class="text-sm text-[var(--text-muted)]">{{ $t('babyNaming.historyEmpty') }}</p>
        </div>
        <div v-else>
          <div class="flex justify-end mb-4">
            <UButton size="xs" variant="ghost" color="warning" @click="store.clearHistory()">{{ $t('babyNaming.historyClear') }}</UButton>
          </div>
          <div class="space-y-2">
            <div v-for="h in store.history" :key="h.id" class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 flex items-center justify-between">
              <div class="text-xs text-[var(--text-muted)]">
                <span class="font-medium text-[var(--text-primary)]">{{ h.surname }}</span>
                <span class="mx-2 text-[var(--text-faint)]">·</span>
                {{ h.birthDate }}{{ h.birthHour !== null ? ' ' + String(h.birthHour).padStart(2, '0') + ':00' : '' }}
                <span class="mx-2 text-[var(--text-faint)]">·</span>
                {{ $t(h.nameLength === 1 ? 'babyNaming.singleName' : 'babyNaming.doubleName') }}
              </div>
              <div class="text-right text-xs">
                <template v-if="h.topName">
                  <span class="font-serif font-semibold text-[var(--text-primary)]">{{ h.topName }}</span>
                  <span class="text-[var(--accent)] ml-2">{{ h.topScore }}{{ $t('babyNaming.scoreUnit') }}</span>
                </template>
                <span v-else class="text-[var(--text-faint)]">{{ $t('babyNaming.historyNoResult') }}</span>
                <p class="text-[10px] text-[var(--text-faint)]">{{ formatTime(h.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toGregorian, toLunar, formatLunar } from 'lunar'
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { SHICHEN_OPTIONS, type DiZhi } from '~/types/user'

const { t, locale } = useI18n()
const store = useBabyNamingStore()

// ---------- 类型 ----------
type Gender = 'male' | 'female' | 'neutral'
type StyleKey = 'classical' | 'warm' | 'grand' | 'poetic' | 'modern' | 'natural'
type FilterKey = 'avoidRare' | 'avoidPolyphone' | 'avoidBadHomophone' | 'limitStrokes'

interface NameCandidate {
  fullName: string
  givenName: string
  chars: { char: string; pinyin: string; wuxing: string; meaning: string; source: string; structure: string; simplifiedStrokes: number; traditionalStrokes: number }[]
  pinyin: string
  score: number
  scoreGrade: string
  wuxingBoost: { element: string; matched: boolean }[]
  meaningSummary: string
  sourceSummary: string
  homophoneRisk: '低' | '极低' | '中' | '高'
  homophoneNotes: string[]
  phoneticNotes: string[]
  structureNotes: string[]
  wuge: {
    tiange: number; renge: number; dige: number; waige: number; zongge: number
    tiangeFortune: string; rengeFortune: string; digeFortune: string; waigeFortune: string; zonggeFortune: string
    overallLuck: string
  }
  breakdown: Record<string, { score: number; max: number; label: string }>
  comparisonRows: { label: string; value: string; score: number; max: number }[]
}

interface NamingResult {
  chart: {
    pillars: { year: string; month: string; day: string; hour: string | null }
    riZhu: string
    riZhuStrength: string
    wuxingScore: Record<string, number>
    xiyong: string
    jishen: string
    geju: string
    baziBrief: string
  }
  xiyongElements: string[]
  jishenElements: string[]
  totalCandidates: number
  names: NameCandidate[]
  topName: NameCandidate | null
}

// ---------- 表单 ----------
const form = reactive({
  surname: '',
  gender: 'neutral' as Gender,
  calendar: 'solar' as 'solar' | 'lunar',
  birthDate: '',
  birthHourDizhi: undefined as DiZhi | undefined,
  lunarYear: 2024,
  lunarMonth: 4,
  lunarDay: 13,
  lunarLeap: false,
  province: '',
  city: '',
  nameLength: 2 as 1 | 2,
  generationChar: '',
  likedCharsInput: '',
  avoidedCharsInput: '',
  styles: { classical: 50, warm: 50, grand: 50, poetic: 50, modern: 50, natural: 50 } as Record<StyleKey, number>,
  filters: { avoidRare: true, avoidPolyphone: true, avoidBadHomophone: true, limitStrokes: false } as Record<FilterKey, boolean>,
})

const genderOptions = [
  { value: 'male', labelKey: 'babyNaming.genderMale' },
  { value: 'female', labelKey: 'babyNaming.genderFemale' },
  { value: 'neutral', labelKey: 'babyNaming.genderNeutral' },
] as const

const calendarOptions = [
  { value: 'solar', labelKey: 'babyNaming.calendarSolar' },
  { value: 'lunar', labelKey: 'babyNaming.calendarLunar' },
] as const

const styleSliders = [
  { key: 'classical', labelKey: 'babyNaming.styleClassical' },
  { key: 'warm', labelKey: 'babyNaming.styleWarm' },
  { key: 'grand', labelKey: 'babyNaming.styleGrand' },
  { key: 'poetic', labelKey: 'babyNaming.stylePoetic' },
  { key: 'modern', labelKey: 'babyNaming.styleModern' },
  { key: 'natural', labelKey: 'babyNaming.styleNatural' },
] as const

const filterOptions = [
  { key: 'avoidRare', labelKey: 'babyNaming.filterAvoidRare' },
  { key: 'avoidPolyphone', labelKey: 'babyNaming.filterAvoidPolyphone' },
  { key: 'avoidBadHomophone', labelKey: 'babyNaming.filterAvoidBadHomophone' },
  { key: 'limitStrokes', labelKey: 'babyNaming.filterLimitStrokes' },
] as const

const inputUi = {
  base: 'bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)]',
}

const selectUi = {
  base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
  placeholder: 'text-[var(--text-placeholder)]',
  content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl max-h-[240px]',
  item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
}

// ---------- 日期选择（复用 AppCalendar + 时辰下拉） ----------
const tz = getLocalTimeZone()
const df = new DateFormatter('zh-CN', { dateStyle: 'long' })
const calendarDate = ref<CalendarDate | undefined>(undefined)

watch(calendarDate, (val) => {
  form.birthDate = val
    ? `${val.year}-${String(val.month).padStart(2, '0')}-${String(val.day).padStart(2, '0')}`
    : ''
})

// 时辰地支 → 该时辰中间小时（与 useBaziCalc 一致）
const SHICHEN_MID_HOUR: Record<string, number> = {
  子: 0, 丑: 2, 寅: 4, 卯: 6, 辰: 8, 巳: 10,
  午: 12, 未: 14, 申: 16, 酉: 18, 戌: 20, 亥: 22,
}

const hourOptions = SHICHEN_OPTIONS.map(s => ({
  label: `${s.label}（${s.range}）`,
  value: s.dizhi,
}))

const lunarYearOptions = computed(() => {
  const now = new Date().getFullYear()
  return Array.from({ length: 61 }, (_, i) => {
    const y = now - 30 + i
    return { label: `${y}`, value: y }
  })
})
const lunarMonthOptions = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({ label: t(`common.month${i + 1}`), value: i + 1 })),
)
const lunarDayOptions = computed(() =>
  Array.from({ length: 30 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 })),
)

const tabs = computed(() => [
  { key: 'naming', labelKey: 'babyNaming.tabNaming', badge: '' },
  { key: 'compare', labelKey: 'babyNaming.tabCompare', badge: compareList.value.length > 0 ? String(compareList.value.length) : '' },
  { key: 'favorites', labelKey: 'babyNaming.tabFavorites', badge: store.favorites.length > 0 ? String(store.favorites.length) : '' },
  { key: 'history', labelKey: 'babyNaming.tabHistory', badge: store.history.length > 0 ? String(store.history.length) : '' },
] as const)

// ---------- 日期换算 ----------
const birthError = ref('')

const resolvedBirth = computed<{ year: number; month: number; day: number; hour: number | null } | null>(() => {
  birthError.value = ''
  if (form.calendar === 'solar') {
    if (!form.birthDate) return null
    const [y, m, d] = form.birthDate.split('-').map(Number) as [number, number, number]
    if (!y || !m || !d) return null
    const hour = form.birthHourDizhi ? (SHICHEN_MID_HOUR[form.birthHourDizhi] ?? null) : null
    return { year: y, month: m, day: d, hour }
  }
  // 农历 → 公历
  try {
    const y = Number(form.lunarYear)
    const m = Number(form.lunarMonth)
    const d = Number(form.lunarDay)
    if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 30) {
      birthError.value = t('babyNaming.birthInvalid')
      return null
    }
    const result = toGregorian({ year: y, month: m, day: d, isLeapMonth: form.lunarLeap })
    const date = result.date ?? result
    const gYear = date.getFullYear()
    const gMonth = date.getMonth() + 1
    const gDay = date.getDate()
    const hour = form.birthHourDizhi ? (SHICHEN_MID_HOUR[form.birthHourDizhi] ?? null) : null
    return { year: gYear, month: gMonth, day: gDay, hour }
  } catch {
    birthError.value = t('babyNaming.birthInvalid')
    return null
  }
})

const lunarPreview = computed(() => {
  const b = resolvedBirth.value
  if (!b) return ''
  try {
    if (form.calendar === 'solar') {
      const { lunar } = toLunar({ year: b.year, month: b.month, day: b.day })
      return formatLunar(lunar)
    }
    return `${t('babyNaming.solarPrefix')}${b.year}-${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`
  } catch {
    return ''
  }
})

// ---------- 生成 ----------
const generating = ref(false)
const result = ref<NamingResult | null>(null)
const selectedName = ref<NameCandidate | null>(null)
const sortBy = ref<'score' | 'bazi' | 'phonetics'>('score')

const canGenerate = computed(() => form.surname.trim().length > 0 && resolvedBirth.value !== null && !birthError.value)

const sortedNames = computed(() => {
  if (!result.value) return []
  const names = [...result.value.names]
  if (sortBy.value === 'bazi') {
    names.sort((a, b) => b.breakdown.baziWuxing!.score - a.breakdown.baziWuxing!.score)
  } else if (sortBy.value === 'phonetics') {
    names.sort((a, b) => b.breakdown.phonetics!.score - a.breakdown.phonetics!.score)
  } else {
    names.sort((a, b) => b.score - a.score)
  }
  return names
})

function parseCharsInput(input: string): string[] {
  return [...new Set(input.replace(/[,，、\s]/g, '').split('').filter(c => /[一-龥]/.test(c)))]
}

async function generate() {
  if (!canGenerate.value || !resolvedBirth.value) return
  generating.value = true
  try {
    const b = resolvedBirth.value
    const res = await $fetch<NamingResult>('/api/tools/baby-naming/calc', {
      method: 'POST',
      body: {
        surname: form.surname.trim(),
        gender: form.gender,
        birthYear: b.year,
        birthMonth: b.month,
        birthDay: b.day,
        birthHour: b.hour,
        nameLength: form.nameLength,
        generationChar: form.generationChar.trim() || undefined,
        likedChars: parseCharsInput(form.likedCharsInput),
        avoidedChars: parseCharsInput(form.avoidedCharsInput),
        stylePreference: form.styles,
        filters: form.filters,
        locale: locale.value,
      },
    })
    result.value = res
    selectedName.value = res.topName ?? res.names[0] ?? null
    resetAi()

    // 写历史记录
    store.addHistory({
      surname: form.surname.trim(),
      gender: form.gender,
      birthDate: `${b.year}-${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`,
      birthHour: b.hour,
      nameLength: form.nameLength,
      topName: res.topName?.fullName ?? null,
      topScore: res.topName?.score ?? null,
    })
  } catch (e: any) {
    birthError.value = e?.data?.statusMessage || e?.message || t('babyNaming.generateError')
  } finally {
    generating.value = false
  }
}

function selectName(name: NameCandidate) {
  selectedName.value = name
  resetAi()
}

// ---------- 解析面板 ----------
const panelTab = ref<'bazi' | 'phonetics' | 'structure' | 'meaning' | 'source' | 'taboo'>('bazi')
const panelTabs = [
  { key: 'bazi', labelKey: 'babyNaming.panelBazi' },
  { key: 'phonetics', labelKey: 'babyNaming.panelPhonetics' },
  { key: 'structure', labelKey: 'babyNaming.panelStructure' },
  { key: 'meaning', labelKey: 'babyNaming.panelMeaning' },
  { key: 'source', labelKey: 'babyNaming.panelSource' },
  { key: 'taboo', labelKey: 'babyNaming.panelTaboo' },
] as const

const wugeRows = computed(() => {
  if (!selectedName.value) return []
  const w = selectedName.value.wuge
  return [
    { label: t('babyNaming.wugeTiange'), value: w.tiange, fortune: w.tiangeFortune },
    { label: t('babyNaming.wugeRenge'), value: w.renge, fortune: w.rengeFortune },
    { label: t('babyNaming.wugeDige'), value: w.dige, fortune: w.digeFortune },
    { label: t('babyNaming.wugeWaige'), value: w.waige, fortune: w.waigeFortune },
    { label: t('babyNaming.wugeZongge'), value: w.zongge, fortune: w.zonggeFortune },
  ]
})

function wuxingColor(el: string): string {
  return ({ 木: '#4ade80', 火: '#f87171', 土: '#fbbf24', 金: '#e5e7eb', 水: '#60a5fa' } as Record<string, string>)[el] ?? '#9ca3af'
}

function pillarLabel(key: string): string {
  return ({ year: t('babyNaming.pillarYear'), month: t('babyNaming.pillarMonth'), day: t('babyNaming.pillarDay'), hour: t('babyNaming.pillarHour') } as Record<string, string>)[key] ?? key
}

function riskClass(risk: string): string {
  if (risk === '高') return 'border-red-400/40 text-red-400'
  if (risk === '中') return 'border-amber-400/40 text-amber-400'
  return 'border-[var(--accent-border)] text-[var(--accent)]'
}

function styleLevelText(v: number): string {
  if (v >= 75) return t('babyNaming.levelStrong')
  if (v >= 50) return t('babyNaming.levelMedium')
  if (v >= 25) return t('babyNaming.levelWeak')
  return t('babyNaming.levelNone')
}

// ---------- 收藏/对比 ----------
function toggleFavorite(name: NameCandidate) {
  const b = resolvedBirth.value
  store.toggleFavorite({
    fullName: name.fullName,
    givenName: name.givenName,
    pinyin: name.pinyin,
    score: name.score,
    scoreGrade: name.scoreGrade,
    surname: form.surname.trim() || name.fullName.slice(0, name.fullName.length - name.givenName.length),
    gender: form.gender,
    birthDate: b ? `${b.year}-${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')}` : '',
    birthHour: b?.hour ?? null,
    chartSnapshot: {
      pillars: result.value?.chart.pillars ?? { year: '', month: '', day: '', hour: null },
      riZhu: result.value?.chart.riZhu ?? '',
      riZhuStrength: result.value?.chart.riZhuStrength ?? '',
      xiyong: result.value?.chart.xiyong ?? '',
      jishen: result.value?.chart.jishen ?? '',
    },
  })
}

// ---------- Tabs ----------
const activeTab = ref<'naming' | 'compare' | 'favorites' | 'history'>('naming')

// 对比列表为会话级状态（不持久化）
const compareList = ref<string[]>([])

function toggleCompare(fullName: string) {
  const idx = compareList.value.indexOf(fullName)
  if (idx >= 0) {
    compareList.value.splice(idx, 1)
  } else if (compareList.value.length < 3) {
    compareList.value.push(fullName)
  }
}

function removeCompare(fullName: string) {
  compareList.value = compareList.value.filter(n => n !== fullName)
}

function clearCompare() {
  compareList.value = []
}

const compareNames = computed(() =>
  compareList.value
    .map(fn => result.value?.names.find(n => n.fullName === fn))
    .filter((n): n is NameCandidate => Boolean(n)),
)

// ---------- AI 流式解读 ----------
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref('')

function resetAi() {
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = ''
}

async function startAiReading() {
  if (!selectedName.value || !result.value || aiStreaming.value) return
  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = ''
  try {
    const response = await fetch('/api/tools/baby-naming/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surname: form.surname.trim() || selectedName.value.fullName.slice(0, 1),
        gender: form.gender,
        chart: result.value.chart,
        name: selectedName.value,
        locale: locale.value,
      }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
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
            aiStarted.value = true
            aiContent.value += data.text
          } else if (data.type === 'error') {
            aiError.value = data.message || t('babyNaming.aiUnavailable')
          }
        } catch { /* ignore */ }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('babyNaming.aiUnavailable')
  } finally {
    aiStreaming.value = false
  }
}

// ---------- 工具 ----------
function formatTime(ts: number): string {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// ---------- SEO ----------
const config = useRuntimeConfig()
const siteName = config.public.siteName || 'ososn'
const siteUrl = useRequestURL().origin
const pagePath = '/tools/baby-naming'

useSeoMeta({
  title: () => `${t('babyNaming.seoTitle')} - ${siteName}`,
  description: () => t('babyNaming.seoDesc'),
  ogTitle: () => `${t('babyNaming.seoTitle')} - ${siteName}`,
  ogDescription: () => t('babyNaming.seoDesc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: `${siteUrl}${pagePath}`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: `${t('babyNaming.seoTitle')} - ${siteName}`,
        url: `${siteUrl}${pagePath}`,
        applicationCategory: 'LifestyleApplication',
        description: t('babyNaming.seoDesc'),
      }),
    },
  ],
}))
</script>
