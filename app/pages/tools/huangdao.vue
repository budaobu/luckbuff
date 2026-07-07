<template>
  <div class="relative overflow-hidden">
    <!-- 氛围背景光晕 -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 阶段 1：表单 -->
      <div v-if="phase === 'form'">
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Auspicious Day</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('huangdao.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('huangdao.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-6">
            <!-- 档案选择 -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('huangdao.selectProfile') }}</label>
              <div v-if="store.list.length > 0" class="flex flex-wrap gap-2">
                <button
                  v-for="profile in store.list"
                  :key="profile.id"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
                  :class="selectedProfileId === profile.id
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="selectProfile(profile)"
                >
                  <UIcon name="i-heroicons-user" class="w-3 h-3" />
                  {{ profile.label }}
                  <span v-if="profile.isDefault" class="text-[10px]">★</span>
                </button>
              </div>
              <div v-else class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3">
                <p class="text-sm text-[var(--text-faint)]">
                  {{ $t('baziForm.noProfiles') }}<NuxtLink :to="localePath('/settings')" class="text-[var(--accent)] hover:underline">{{ $t('baziForm.goSettings') }}</NuxtLink>{{ $t('baziForm.createSuffix') }}
                </p>
              </div>
            </div>

            <!-- 姓名 -->
            <div class="space-y-1.5">
              <label class="text-xs text-[var(--text-muted)]">{{ $t('profileForm.name') }}</label>
              <UInput
                v-model="manualForm.name"
                :placeholder="$t('profileForm.namePlaceholder')"
                color="warning"
                :ui="{ base: 'w-full bg-[var(--surface-input)] border-[var(--border-light)] focus:border-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
              />
            </div>

            <!-- 性别 -->
            <div class="space-y-1.5">
              <label class="text-xs text-[var(--text-muted)]">{{ $t('profileForm.gender') }}</label>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="manualForm.gender === 'male'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="manualForm.gender = 'male'"
                >
                  <UIcon name="i-heroicons-user" class="w-4 h-4" />
                  {{ $t('common.male') }}
                </button>
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="manualForm.gender === 'female'
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-muted)]'"
                  @click="manualForm.gender = 'female'"
                >
                  <UIcon name="i-heroicons-user" class="w-4 h-4" />
                  {{ $t('common.female') }}
                </button>
              </div>
            </div>

            <!-- 出生日期 -->
            <div class="space-y-1.5">
              <label class="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                {{ $t('profileForm.birthDate') }}
                <span class="text-[var(--accent)]">*</span>
              </label>
              <UPopover>
                <UButton
                  color="neutral"
                  variant="outline"
                  class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                  :class="{ 'text-[var(--text-placeholder)]': !manualForm.birthDate }"
                >
                  <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                  {{ manualForm.birthDate && calendarDate ? df.format(calendarDate.toDate(tz)) : $t('profileForm.birthDatePlaceholder') }}
                </UButton>
                <template #content>
                  <AppCalendar v-model="calendarDate" color="warning" class="p-2" />
                </template>
              </UPopover>
            </div>

            <!-- 出生时辰 -->
            <div class="space-y-1.5">
              <label class="text-xs text-[var(--text-muted)]">{{ $t('profileForm.birthHour') }}</label>
              <div class="relative">
                <select
                  v-model="manualForm.birthHour"
                  class="w-full appearance-none px-3 py-2.5 pr-9 rounded-lg bg-[var(--surface-input)] border border-[var(--border-light)] text-[var(--text-primary)] text-sm focus:border-[var(--accent-border-hover)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-border-hover)] cursor-pointer"
                >
                  <option value="">{{ $t('profileForm.birthHourPlaceholder') }}</option>
                  <option v-for="opt in hourOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
                <UIcon name="i-heroicons-chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)] pointer-events-none" />
              </div>
            </div>

            <!-- 择日事项 -->
            <div class="space-y-2">
              <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('huangdao.matter') }}</label>
              <UTextarea
                v-model="formValues.matter"
                :placeholder="$t('huangdao.matterPlaceholder')"
                color="warning"
                :rows="3"
                class="w-full"
                :ui="{ base: 'w-full bg-[var(--surface-input)] border-[var(--border-light)] focus:border-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
              />
              <!-- 快捷按键 -->
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="btn in quickButtons"
                  :key="btn.key"
                  type="button"
                  class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
                  :class="formValues.matter === btn.label
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-body)]'"
                  @click="formValues.matter = btn.label"
                >
                  {{ btn.label }}
                </button>
              </div>
            </div>

            <!-- 日期范围 -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('huangdao.startDate') }}</label>
                <UPopover>
                  <UButton
                    color="neutral"
                    variant="outline"
                    class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)]"
                    :class="{ 'text-[var(--text-placeholder)]': !formValues.startDate }"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                    {{ formValues.startDate && startCalendarDate ? df.format(startCalendarDate.toDate(tz)) : $t('huangdao.startDatePlaceholder') }}
                  </UButton>
                  <template #content>
                    <AppCalendar v-model="startCalendarDate" color="warning" class="p-2" />
                  </template>
                </UPopover>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('huangdao.endDate') }}</label>
                <UPopover>
                  <UButton
                    color="neutral"
                    variant="outline"
                    class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)]"
                    :class="{ 'text-[var(--text-placeholder)]': !formValues.endDate }"
                  >
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                    {{ formValues.endDate && endCalendarDate ? df.format(endCalendarDate.toDate(tz)) : $t('huangdao.endDatePlaceholder') }}
                  </UButton>
                  <template #content>
                    <AppCalendar v-model="endCalendarDate" color="warning" class="p-2" />
                  </template>
                </UPopover>
              </div>
            </div>

            <!-- 提交按钮 -->
            <UButton
              color="warning"
              size="lg"
              class="w-full justify-center font-medium"
              :loading="submitting"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ $t('huangdao.submit') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('huangdao.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('huangdao.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('huangdao.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('huangdao.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('huangdao.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('huangdao.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('huangdao.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('huangdao.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- 阶段 2：加载 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="relative">
          <div class="w-20 h-20 rounded-full border-2 border-[var(--accent-border)] border-t-[var(--accent)] animate-spin" />
          <div class="absolute inset-0 flex items-center justify-center">
            <UIcon name="i-heroicons-sun" class="w-8 h-8 text-[var(--accent)]" />
          </div>
        </div>
        <p class="mt-6 text-sm text-[var(--text-faint)]">{{ $t('huangdao.calculating') }}</p>
      </div>

      <!-- 阶段 3：结果 -->
      <div v-if="phase === 'result' && days.length > 0">
        <!-- 隐藏截图目标：3:4 海报 -->
        <div ref="shareTargetRef" v-show="false" class="p-6">
          <div class="w-[360px] aspect-[3/4] rounded-2xl border-2 border-[var(--accent-border)] bg-[var(--surface-card)] overflow-hidden flex flex-col">
            <!-- 海报头部：传统黄历风格 -->
            <div class="relative bg-[var(--accent)] px-5 py-4 text-center overflow-hidden flex-shrink-0">
              <div class="absolute inset-0 opacity-10">
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-white" />
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white" />
              </div>
              <div class="relative z-10">
                <UIcon name="i-heroicons-sun" class="w-6 h-6 text-white mx-auto mb-1" />
                <h2 class="text-xl font-bold text-white font-serif tracking-wider">{{ $t('huangdao.posterTitle') }}</h2>
                <p class="text-[11px] text-white/80 mt-0.5">{{ formValues.name || $t('common.unknown') }} · {{ formValues.matter || $t('huangdao.generalMatter') }}</p>
              </div>
            </div>

            <!-- 海报主体 -->
            <div class="flex-1 px-4 py-4 overflow-hidden flex flex-col gap-3">
              <!-- 最佳吉日推荐：可视化卡片 -->
              <div>
                <div class="flex items-center gap-1.5 mb-2">
                  <UIcon name="i-heroicons-star" class="w-3.5 h-3.5 text-amber-400" />
                  <span class="text-xs font-semibold text-[var(--text-primary)]">{{ $t('huangdao.aiTopDates') }}</span>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="day in topDays.slice(0, 3)"
                    :key="day.date"
                    class="rounded-lg border overflow-hidden"
                    :class="day.isAuspicious ? 'border-[var(--accent-border)]' : 'border-[var(--border-subtle)]'"
                  >
                    <div class="flex items-center gap-2 p-2.5" :class="day.isAuspicious ? 'bg-[var(--accent-bg)]' : 'bg-[var(--surface-dropdown)]'">
                      <!-- 日期 -->
                      <div class="flex-shrink-0 text-center min-w-[52px]">
                        <div class="text-base font-bold text-[var(--text-primary)] leading-none">{{ formatPosterDay(day.date) }}</div>
                        <div class="text-[9px] text-[var(--text-faint)] mt-0.5">{{ day.week }}</div>
                      </div>
                      <!-- 分隔线 -->
                      <div class="w-px h-6 bg-[var(--border-subtle)]" />
                      <!-- 信息 -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 mb-1">
                          <span class="text-[11px] font-medium text-[var(--accent)]">{{ day.dayGanZhi }}</span>
                          <span
                            class="text-[9px] px-1 py-0.5 rounded-full border"
                            :class="day.matchScore >= 90
                              ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent-border)]'
                              : day.matchScore >= 70
                                ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                                : 'bg-[var(--surface-card)] text-[var(--text-muted)] border-[var(--border-light)]'"
                          >
                            {{ day.matchScore }}%
                          </span>
                        </div>
                        <!-- 匹配度进度条 -->
                        <div class="h-1 rounded-full bg-[var(--surface-card)] overflow-hidden mb-1">
                          <div
                            class="h-full rounded-full"
                            :class="day.matchScore >= 90 ? 'bg-[var(--accent)]' : day.matchScore >= 70 ? 'bg-amber-400' : 'bg-[var(--text-muted)]'"
                            :style="{ width: `${day.matchScore}%` }"
                          />
                        </div>
                        <!-- 宜 -->
                        <div class="flex flex-wrap gap-1">
                          <span
                            v-for="yi in day.yi.slice(0, 2)"
                            :key="yi"
                            class="text-[9px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          >
                            {{ yi }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <!-- 吉神 -->
                    <div class="px-2.5 py-1 bg-[var(--surface-card)] border-t border-[var(--border-subtle)] flex items-center gap-1 text-[9px] text-[var(--text-faint)]">
                      <UIcon name="i-heroicons-star" class="w-2.5 h-2.5 text-[var(--accent-muted)]" />
                      <span class="text-[var(--accent-muted)]">{{ day.jiShen.slice(0, 2).join('、') }}</span>
                      <span class="text-[var(--border-subtle)]">|</span>
                      <span>值神{{ day.tianShen }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- AI 解读摘要 -->
              <div v-if="posterAiSummary" class="flex-1 min-h-0 overflow-hidden">
                <div class="flex items-center gap-1.5 mb-2">
                  <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span class="text-xs font-semibold text-[var(--text-primary)]">{{ $t('huangdao.aiInterpretTitle') }}</span>
                </div>
                <div class="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-dropdown)] p-3 overflow-hidden">
                  <p class="text-[11px] text-[var(--text-body)] leading-relaxed">{{ posterAiSummary }}</p>
                </div>
              </div>
            </div>

            <!-- 底部 -->
            <div class="px-4 py-2 border-t border-[var(--border-subtle)] text-center flex-shrink-0">
              <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('share.generatedBy') }}</p>
            </div>
          </div>
        </div>

        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('huangdao.resultTitle', { name: formValues.name || '' }) }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('huangdao.resultSubtitle', { count: days.length, matter: formValues.matter || $t('huangdao.generalMatter') }) }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 统一的 AI 择日结果卡片 -->
        <div class="mb-8">
          <div class="rounded-2xl border-2 border-[var(--accent-border)] bg-[var(--surface-card)] overflow-hidden">
            <!-- 传统黄历金色头部 -->
            <div class="relative bg-[var(--accent)] px-6 py-5 text-center overflow-hidden">
              <div class="absolute inset-0 opacity-10">
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white" />
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white" />
              </div>
              <div class="relative z-10">
                <p class="text-[10px] text-white/70 tracking-[0.3em] uppercase mb-1">Auspicious Day</p>
                <h2 class="text-2xl font-bold text-white font-serif tracking-wider">{{ $t('huangdao.posterTitle') }}</h2>
                <p class="text-xs text-white/80 mt-1">{{ formValues.name || $t('common.unknown') }} · {{ formValues.matter || $t('huangdao.generalMatter') }}</p>
              </div>
            </div>

            <!-- 事项信息 -->
            <div class="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <p class="text-[10px] text-[var(--text-faint)] tracking-wide uppercase">{{ $t('huangdao.matter') }}</p>
                <p class="text-sm font-medium text-[var(--text-primary)]">{{ formValues.matter || $t('huangdao.generalMatter') }}</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-[var(--text-faint)] tracking-wide">{{ $t('huangdao.startDate') }} — {{ $t('huangdao.endDate') }}</p>
                <p class="text-xs text-[var(--text-muted)]">{{ formValues.startDate }} ~ {{ formValues.endDate }}</p>
              </div>
            </div>

            <!-- AI 解读（嵌入模式） -->
            <div class="p-5">
              <HuangdaoInterpretPanel
                :content="aiStreamContent"
                :streaming="aiLoading"
                :started="aiStarted"
                :error="aiStreamError"
                :days="days"
                embedded
                @retry="retryAiInterpret"
              />
            </div>

            <!-- 底部水印 -->
            <div class="px-5 py-3 border-t border-[var(--border-subtle)] text-center">
              <p class="text-[10px] text-[var(--text-placeholder)] tracking-wider">{{ $t('share.generatedBy') }}</p>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton color="warning" variant="soft" class="group/btn" @click="resetToForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('common.retry') }}
          </UButton>
          <UButton color="warning" variant="soft" class="group/btn" @click="handleShare">
            <template #leading>
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
            </template>
            {{ $t('common.shareResult') }}
          </UButton>
          <UButton color="neutral" variant="ghost" class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"  @click="() => { navigateTo('/') }">
            <template #leading>
              <UIcon name="i-heroicons-home" class="w-4 h-4" />
            </template>
            {{ $t('common.backHome') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="shareDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="shareDialogOpen = false">
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                  <UIcon name="i-heroicons-share" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('share.title') }}</h3>
              </div>
              <UButton color="neutral" variant="ghost" class="text-[var(--text-faint)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]" @click="() => { shareDialogOpen = false }">
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.copyContext') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3 text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">
                  {{ shareData?.copyText }}
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="copyShareText">
                  <template #leading>
                    <UIcon name="i-heroicons-clipboard-document" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('share.copyText') }}
                </UButton>
              </div>
              <div v-if="shareData?.screenshotDataUrl">
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('share.shareScreenshot') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-2 overflow-hidden">
                  <img :src="shareData.screenshotDataUrl" :alt="$t('share.shareScreenshot')" class="w-full rounded-lg">
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="downloadShareImage">
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('share.downloadImage') }}
                </UButton>
              </div>
              <div v-else class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-6 text-center">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-[var(--text-placeholder)] mx-auto mb-2" />
                <p class="text-xs text-[var(--text-faint)]">{{ $t('share.screenshotFailed') }}</p>
              </div>
            </div>
            <div class="px-5 py-3 border-t border-[var(--border-light)] text-center">
              <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('share.generatedBy') }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { HuangdaoDay, HuangdaoFormValues } from '~/types/huangdao'
import type { DiZhi } from '~/types/user'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import { useProfilesStore } from '~/stores/profiles'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const store = useProfilesStore()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const days = ref<HuangdaoDay[]>([])
const aiLoading = ref(false)
const aiStreamContent = ref('')
const aiStreamError = ref<string | null>(null)
const aiStarted = ref(false)
const submitting = ref(false)

// 档案选择
const selectedProfileId = ref('')

const selectedProfile = computed(() => store.list.find(p => p.id === selectedProfileId.value))

function selectProfile(profile: typeof store.list[0]) {
  selectedProfileId.value = profile.id
  manualForm.name = profile.name || ''
  manualForm.gender = profile.gender
  manualForm.birthDate = profile.birthDate || ''
  manualForm.birthHour = profile.birthHour
  if (manualForm.birthDate) {
    try {
      calendarDate.value = parseDate(manualForm.birthDate)
    } catch {
      calendarDate.value = undefined
    }
  } else {
    calendarDate.value = undefined
  }
}

// 手动表单
const manualForm = reactive({
  name: '',
  gender: 'male' as 'male' | 'female',
  birthDate: '',
  birthHour: undefined as DiZhi | undefined,
})

const calendarDate = ref<CalendarDate | undefined>(undefined)
watch(calendarDate, () => {
  if (calendarDate.value) {
    manualForm.birthDate = `${calendarDate.value.year}-${String(calendarDate.value.month).padStart(2, '0')}-${String(calendarDate.value.day).padStart(2, '0')}`
  }
})

// 日期范围
const startCalendarDate = ref<CalendarDate | undefined>(undefined)
const endCalendarDate = ref<CalendarDate | undefined>(undefined)

watch(startCalendarDate, () => {
  if (startCalendarDate.value) {
    formValues.startDate = `${startCalendarDate.value.year}-${String(startCalendarDate.value.month).padStart(2, '0')}-${String(startCalendarDate.value.day).padStart(2, '0')}`
  }
})

watch(endCalendarDate, () => {
  if (endCalendarDate.value) {
    formValues.endDate = `${endCalendarDate.value.year}-${String(endCalendarDate.value.month).padStart(2, '0')}-${String(endCalendarDate.value.day).padStart(2, '0')}`
  }
})

// 主表单
const formValues = reactive<HuangdaoFormValues>({
  profileId: '',
  name: '',
  gender: 'male',
  birthDate: '',
  birthHour: undefined,
  matter: '',
  startDate: '',
  endDate: '',
})

// 按匹配度降序排列的吉日（用于海报展示，与 AI 推荐逻辑一致）
const topDays = computed(() =>
  days.value.slice().sort((a, b) => b.matchScore - a.matchScore),
)

// 海报吉日摘要（基于黄历数据，不依赖 AI）
const posterSummary = computed(() => {
  if (!days.value.length) return ''
  const auspicious = days.value.filter(d => d.isAuspicious)
  const top = topDays.value.slice(0, 2)
  const dateStr = top.map(d => {
    const md = d.date.slice(5).replace('-', '/')
    return `${md} ${d.dayGanZhi}`
  }).join('、')
  return t('huangdao.posterSummary', {
    count: days.value.length,
    auspicious: auspicious.length,
    dates: dateStr,
  })
})

// 快捷按键
const quickButtons = computed(() => [
  { key: 'move', label: t('huangdao.quickButtons.move') },
  { key: 'marry', label: t('huangdao.quickButtons.marry') },
  { key: 'open', label: t('huangdao.quickButtons.open') },
  { key: 'contract', label: t('huangdao.quickButtons.contract') },
  { key: 'travel', label: t('huangdao.quickButtons.travel') },
  { key: 'medical', label: t('huangdao.quickButtons.medical') },
  { key: 'exam', label: t('huangdao.quickButtons.exam') },
])

// 时辰选项
const hourOptions = [
  { label: '未知时辰', value: '' },
  ...[
    { dizhi: '子' as DiZhi, label: '子时', range: '23:00~01:00' },
    { dizhi: '丑' as DiZhi, label: '丑时', range: '01:00~03:00' },
    { dizhi: '寅' as DiZhi, label: '寅时', range: '03:00~05:00' },
    { dizhi: '卯' as DiZhi, label: '卯时', range: '05:00~07:00' },
    { dizhi: '辰' as DiZhi, label: '辰时', range: '07:00~09:00' },
    { dizhi: '巳' as DiZhi, label: '巳时', range: '09:00~11:00' },
    { dizhi: '午' as DiZhi, label: '午时', range: '11:00~13:00' },
    { dizhi: '未' as DiZhi, label: '未时', range: '13:00~15:00' },
    { dizhi: '申' as DiZhi, label: '申时', range: '15:00~17:00' },
    { dizhi: '酉' as DiZhi, label: '酉时', range: '17:00~19:00' },
    { dizhi: '戌' as DiZhi, label: '戌时', range: '19:00~21:00' },
    { dizhi: '亥' as DiZhi, label: '亥时', range: '21:00~23:00' },
  ].map(s => ({ label: `${s.label}（${s.range}）`, value: s.dizhi })),
]

const tz = getLocalTimeZone()
const df = new DateFormatter(locale.value === 'en' ? 'en-US' : (locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN'), { dateStyle: 'long' })

// 初始化默认日期（今天到一个月后）
onMounted(() => {
  const today = new Date()
  const nextMonth = new Date(today)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  formValues.startDate = formatDate(today)
  formValues.endDate = formatDate(nextMonth)
  try {
    startCalendarDate.value = parseDate(formValues.startDate)
    endCalendarDate.value = parseDate(formValues.endDate)
  } catch { /* ignore */ }
})

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatPosterDay(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 从AI内容中提取概述摘要（用于海报展示）
const posterAiSummary = computed(() => {
  if (!aiStreamContent.value) return ''
  let text = aiStreamContent.value.replace(/<!--[\s\S]*?-->/g, '').trim()
  const sections = text.split(/\n(?=##\s)/)
  for (const section of sections) {
    const lines = section.split('\n')
    const firstLine = lines[0] ?? ''
    const titleMatch = firstLine.match(/^##\s*(.+)$/)
    const title = titleMatch?.[1]?.trim() ?? ''
    if (title.includes('总论') || title.includes('总结') || title.includes('Overview') || title.includes('Conclusion')) {
      const body = lines.slice(titleMatch ? 1 : 0).join('\n').trim()
      return body.replace(/[#*_`]/g, '').slice(0, 220)
    }
  }
  // 回退：返回前220字符
  return text.replace(/^##.*$/gm, '').replace(/[#*_`]/g, '').trim().slice(0, 220)
})

async function handleSubmit() {
  const profile = selectedProfile.value
  const name = profile?.name || manualForm.name
  const gender = profile?.gender || manualForm.gender
  const birthDate = profile?.birthDate || manualForm.birthDate
  const birthHour = profile?.birthHour || manualForm.birthHour

  if (!birthDate) {
    toast.add({ title: t('huangdao.errorNoBirthDate'), color: 'error' })
    return
  }
  if (!formValues.startDate || !formValues.endDate) {
    toast.add({ title: t('huangdao.errorNoDateRange'), color: 'error' })
    return
  }

  formValues.name = name
  formValues.gender = gender
  formValues.birthDate = birthDate
  formValues.birthHour = birthHour

  submitting.value = true
  phase.value = 'animating'

  try {
    const result = await $fetch<HuangdaoDay[]>('/api/huangdao/calculate', {
      method: 'POST',
      body: {
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        matter: formValues.matter,
      },
    })

    days.value = result
    phase.value = 'result'

    // 请求 AI 解读
    startAiInterpret(result)
  } catch (e: any) {
    toast.add({
      title: t('huangdao.calcError'),
      description: e?.data?.statusMessage || e?.message || '',
      color: 'error',
    })
    phase.value = 'form'
  } finally {
    submitting.value = false
  }
}

async function startAiInterpret(daysData: HuangdaoDay[]) {
  aiLoading.value = true
  aiStreamContent.value = ''
  aiStreamError.value = null
  aiStarted.value = false

  try {
    const response = await fetch('/api/huangdao/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        days: daysData,
        profile: {
          name: formValues.name,
          gender: formValues.gender,
          birthDate: formValues.birthDate,
          birthHour: formValues.birthHour,
        },
        matter: formValues.matter,
        locale: locale.value,
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      aiStreamError.value = `AI 服务错误 (${response.status})${text ? ': ' + text.slice(0, 200) : ''}`
      return
    }

    const contentType = response.headers.get('content-type') || ''
    const isEventStream = contentType.includes('text/event-stream')

    if (!isEventStream) {
      // 非流式降级
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || data.content || data.response || ''
      aiStreamContent.value = text
      aiStarted.value = true
      return
    }

    // SSE 流式读取
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
          const token = data.text || data.response || data.choices?.[0]?.delta?.content
          if (token) {
            if (!aiStarted.value) aiStarted.value = true
            aiStreamContent.value += token
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiStreamError.value = e?.message || 'AI 请求失败'
  } finally {
    aiLoading.value = false
  }
}

function resetToForm() {
  phase.value = 'form'
  days.value = []
  aiLoading.value = false
  aiStreamContent.value = ''
  aiStreamError.value = null
  aiStarted.value = false
}

async function retryAiInterpret() {
  if (!days.value.length) return
  await startAiInterpret(days.value)
}

// 分享
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLElement>()

async function handleShare() {
  if (!days.value.length) return
  const { share } = useShare()

  try {
    const result = await share({
      tool: 'huangdao',
      name: formValues.name,
      summary: formValues.matter || t('huangdao.generalMatter'),
      shareTarget: document.querySelector('.huangdao-first-day-card') as HTMLElement | null || shareTargetRef.value,
      filename: `huangdao-${formValues.name || '择日'}-${new Date().toISOString().slice(0, 10)}.png`,
      t,
    })

    shareData.value = result
    shareDialogOpen.value = true
  } catch (e: any) {
    toast.add({
      title: t('share.shareFail'),
      description: e?.message || t('share.pleaseRetry'),
      color: 'error',
    })
  }
}

function copyShareText() {
  if (!shareData.value) return
  navigator.clipboard.writeText(shareData.value.copyText).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

function downloadShareImage() {
  if (!shareData.value?.screenshotDataUrl) return
  const a = document.createElement('a')
  a.href = shareData.value.screenshotDataUrl
  a.download = shareData.value.filename
  a.click()
  toast.add({ title: t('share.downloadSuccess'), color: 'success' })
}

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.huangdaoTitle')} - ${siteName}`,
  description: t('seo.huangdaoDesc'),
  keywords: t('seo.huangdaoKeywords'),
  ogTitle: () => `${t('seo.huangdaoOgTitle')} - ${siteName}`,
  ogDescription: t('seo.huangdaoOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/huangdao',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.huangdaoTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/huangdao',
        description: t('seo.huangdaoDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('home.toolHuangdaoTitle'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/huangdao',
          description: t('home.toolHuangdaoDesc'),
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
/* huangdao-specific page styles removed; AI markdown rendering now lives in HuangdaoInterpretPanel.vue */
</style>
