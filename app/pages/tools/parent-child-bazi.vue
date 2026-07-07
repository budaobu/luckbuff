<template>
  <div class="relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[var(--accent)]/[0.05] blur-[120px]" />
      <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[var(--accent-purple)]/[0.04] blur-[100px]" />
    </div>

    <div class="relative z-10 max-w-2xl mx-auto px-6 py-12">
      <!-- 阶段 1：表单 -->
      <div v-if="phase === 'form'">
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Parent-Child Bazi</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('parentChildBazi.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('parentChildBazi.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('parentChildBazi.disclaimer') }}
          </p>
        </div>

        <div class="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-dropdown)] overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-8">
            <!-- 家长信息 -->
            <div>
              <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <UIcon name="i-heroicons-user" class="w-4 h-4 text-[var(--accent-muted)]" />
                {{ $t('parentChildBazi.parentSection') }}
              </h3>
              <div class="space-y-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('parentChildBazi.nameLabel') }}</label>
                  <UInput
                    v-model="form.parent.name"
                    :placeholder="$t('parentChildBazi.namePlaceholder')"
                    color="warning"
                    class="w-full"
                    :ui="{ base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                    {{ $t('parentChildBazi.genderLabel') }}
                    <span class="text-[var(--accent)]">*</span>
                  </label>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                      :class="form.parent.gender === 'male' ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]' : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
                      @click="form.parent.gender = 'male'"
                    >
                      {{ $t('common.male') }}
                    </button>
                    <button
                      type="button"
                      class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                      :class="form.parent.gender === 'female' ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]' : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
                      @click="form.parent.gender = 'female'"
                    >
                      {{ $t('common.female') }}
                    </button>
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                    {{ $t('parentChildBazi.birthDateLabel') }}
                    <span class="text-[var(--accent)]">*</span>
                  </label>
                  <UPopover>
                    <UButton
                      color="neutral"
                      variant="outline"
                      class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                      :class="{ 'text-[var(--text-placeholder)]': !form.parent.birthDate }"
                    >
                      <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                      {{ form.parent.birthDate && parentCalendarDate ? df.format(parentCalendarDate.toDate(tz)) : $t('parentChildBazi.birthDatePlaceholder') }}
                    </UButton>
                    <template #content>
                      <AppCalendar v-model="parentCalendarDate" color="warning" class="p-2" />
                    </template>
                  </UPopover>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('parentChildBazi.birthHourLabel') }}</label>
                  <USelect
                    v-model="form.parent.birthHour"
                    :items="hourOptions"
                    :placeholder="$t('parentChildBazi.birthHourPlaceholder')"
                    color="warning"
                    class="w-full"
                    :ui="{ base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]', placeholder: 'text-[var(--text-placeholder)]', content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl', item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]' }"
                  />
                </div>
              </div>
            </div>

            <div class="h-px bg-[var(--border-light)]" />

            <!-- 孩子信息 -->
            <div>
              <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <UIcon name="i-heroicons-face-smile" class="w-4 h-4 text-[var(--accent-muted)]" />
                {{ $t('parentChildBazi.childSection') }}
              </h3>
              <div class="space-y-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('parentChildBazi.nameLabel') }}</label>
                  <UInput
                    v-model="form.child.name"
                    :placeholder="$t('parentChildBazi.childNamePlaceholder')"
                    color="warning"
                    class="w-full"
                    :ui="{ base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]' }"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                    {{ $t('parentChildBazi.genderLabel') }}
                    <span class="text-[var(--accent)]">*</span>
                  </label>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                      :class="form.child.gender === 'male' ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]' : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
                      @click="form.child.gender = 'male'"
                    >
                      {{ $t('common.male') }}
                    </button>
                    <button
                      type="button"
                      class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                      :class="form.child.gender === 'female' ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]' : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)]'"
                      @click="form.child.gender = 'female'"
                    >
                      {{ $t('common.female') }}
                    </button>
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                    {{ $t('parentChildBazi.birthDateLabel') }}
                    <span class="text-[var(--accent)]">*</span>
                  </label>
                  <UPopover>
                    <UButton
                      color="neutral"
                      variant="outline"
                      class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                      :class="{ 'text-[var(--text-placeholder)]': !form.child.birthDate }"
                    >
                      <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                      {{ form.child.birthDate && childCalendarDate ? df.format(childCalendarDate.toDate(tz)) : $t('parentChildBazi.birthDatePlaceholder') }}
                    </UButton>
                    <template #content>
                      <AppCalendar v-model="childCalendarDate" color="warning" class="p-2" />
                    </template>
                  </UPopover>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('parentChildBazi.birthHourLabel') }}</label>
                  <USelect
                    v-model="form.child.birthHour"
                    :items="hourOptions"
                    :placeholder="$t('parentChildBazi.birthHourPlaceholder')"
                    color="warning"
                    class="w-full"
                    :ui="{ base: 'w-full bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]', placeholder: 'text-[var(--text-placeholder)]', content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl', item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]' }"
                  />
                </div>
              </div>
            </div>

            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!isValid"
              class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ $t('parentChildBazi.submitBtn') }}
            </UButton>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-heart" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('parentChildBazi.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('parentChildBazi.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-face-smile" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('parentChildBazi.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('parentChildBazi.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-bolt" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('parentChildBazi.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('parentChildBazi.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('parentChildBazi.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('parentChildBazi.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- 阶段 2：动画 -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-heart" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('parentChildBazi.calculating') }}</p>
        </div>
      </div>

      <!-- 阶段 3：结果 -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('parentChildBazi.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ calcResult.parent.profile.name || $t('parentChildBazi.parentLabel') }} · {{ calcResult.child.profile.name || $t('parentChildBazi.childLabel') }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 双方日主关系 -->
          <div class="rounded-2xl border border-[var(--accent-border)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-link" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-[10px] text-[var(--text-faint)] tracking-wide">{{ $t('parentChildBazi.relationLabel') }}</p>
                <h2 class="text-lg font-bold text-[var(--accent)]">
                  {{ calcResult.relation.parentToChildShiShen }}{{ $t('parentChildBazi.parentToChildSuffix') }} · {{ calcResult.relation.childToParentShiShen }}{{ $t('parentChildBazi.childToParentSuffix') }}
                </h2>
              </div>
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed">{{ calcResult.relation.dayMasterRelationLabel }}</p>
          </div>

          <!-- 孩子性格画像 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-face-smile" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-[10px] text-[var(--text-faint)] tracking-wide">{{ $t('parentChildBazi.childTraitLabel') }}</p>
                <h3 class="text-base font-semibold text-[var(--text-primary)]">
                  {{ calcResult.childTraits.dominantShiShen }}{{ $t('parentChildBazi.childTraitSuffix') }}
                </h3>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="tag in calcResult.childTraits.labels"
                :key="tag"
                class="text-xs px-2.5 py-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-faint)] text-[var(--accent-muted)]"
              >
                {{ tag }}
              </span>
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed mb-3">{{ calcResult.childTraits.scenario }}</p>
            <div class="rounded-xl bg-[var(--accent-bg)]/30 border border-[var(--accent-border)] p-3">
              <p class="text-xs text-[var(--text-muted)] leading-relaxed">
                <span class="font-medium text-[var(--accent)]">{{ $t('parentChildBazi.communicationTipLabel') }}</span>
                {{ calcResult.childTraits.communicationTip }}
              </p>
            </div>
          </div>

          <!-- 家长教养风格 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-user" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-[10px] text-[var(--text-faint)] tracking-wide">{{ $t('parentChildBazi.parentRoleLabel') }}</p>
                <h3 class="text-base font-semibold text-[var(--text-primary)]">
                  {{ calcResult.parentRole.labels.join(' · ') }}
                </h3>
              </div>
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed mb-3">{{ calcResult.parentRole.scenario }}</p>
            <div class="rounded-xl bg-red-500/5 border border-red-500/10 p-3">
              <p class="text-xs text-[var(--text-muted)] leading-relaxed">
                <span class="font-medium text-red-400">{{ $t('parentChildBazi.blindSpotLabel') }}</span>
                {{ calcResult.parentRole.blindSpot }}
              </p>
            </div>
          </div>

          <!-- 合盘摩擦点 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                <UIcon name="i-heroicons-bolt" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-[10px] text-[var(--text-faint)] tracking-wide">{{ $t('parentChildBazi.frictionLabel') }}</p>
                <h3 class="text-base font-semibold text-[var(--text-primary)]">{{ calcResult.friction?.title }}</h3>
              </div>
            </div>
            <p class="text-sm text-[var(--text-body)] leading-relaxed mb-4">{{ calcResult.friction?.conflict }}</p>
            <h4 class="text-xs font-semibold text-[var(--text-primary)] mb-2">{{ $t('parentChildBazi.actionsTitle') }}</h4>
            <ul class="space-y-2">
              <li
                v-for="(action, idx) in calcResult.friction?.actions"
                :key="idx"
                class="text-sm text-[var(--text-body)] leading-relaxed flex gap-2"
              >
                <span class="text-[var(--accent)] font-medium">{{ idx + 1 }}.</span>
                <span>{{ action }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- AI 解读 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('parentChildBazi.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('parentChildBazi.interpreting') }}</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
            </div>
          </div>

          <div v-if="aiSections.length > 0" class="space-y-3">
            <div
              v-for="(section, index) in aiSections"
              :key="section.title"
              class="group relative rounded-xl border border-[var(--border-light)] overflow-hidden"
              :style="{ background: 'linear-gradient(to bottom right, var(--card-gradient-from), transparent)' }"
            >
              <div class="relative z-10 p-4">
                <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">{{ section.title.replace(/^##\s*/, '') }}</h4>
                <div class="ai-section-content" v-html="renderMarkdown(section.content)" />
                <span
                  v-if="aiStreaming && index === aiSections.length - 1"
                  class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-0.5 align-middle animate-pulse mt-1"
                />
              </div>
            </div>
          </div>

          <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
            <div class="flex flex-col items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
              </div>
              <p class="text-xs text-[var(--text-muted)]">{{ $t('parentChildBazi.generatingInterpretation') }}</p>
            </div>
          </div>

          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>

          <div v-if="!aiStreaming && (aiContent || aiError)" class="flex justify-center mt-4">
            <UButton color="warning" variant="soft" size="sm" class="group/btn" @click="startAiStream">
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
              </template>
              {{ $t('parentChildBazi.reinterpret') }}
            </UButton>
          </div>
        </div>

        <!-- 复访提示 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 mb-5">
          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-clock" class="w-5 h-5 text-[var(--accent-muted)] mt-0.5" />
            <div>
              <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-1">{{ $t('parentChildBazi.revisitTitle') }}</h4>
              <p class="text-xs text-[var(--text-muted)] leading-relaxed mb-2">{{ $t('parentChildBazi.revisitDesc') }}</p>
              <UButton color="warning" variant="soft" size="xs" @click="startAiStream">
                {{ $t('parentChildBazi.revisitBtn') }}
              </UButton>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton color="warning" variant="soft" class="group/btn" @click="handleCopy">
            <template #leading>
              <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
            </template>
            {{ $t('parentChildBazi.copyResult') }}
          </UButton>
          <AppShareButton
            tool="parent-child-bazi"
            :name="shareName"
            :summary="shareSummary"
            :share-target="resultRef"
            :filename="`parent-child-bazi-${calcResult.child.profile.name || 'result'}-${new Date().toISOString().slice(0, 10)}.png`"
          />
          <UButton color="warning" variant="soft" class="group/btn" @click="resetForm">
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('parentChildBazi.recalculate') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo('/tools') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('parentChildBazi.backToTools') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import type { DiZhi } from '~/types/user'
import { SHICHEN_OPTIONS } from '~/types/user'
import type { ParentChildBaziCalcResult } from '~/types/parent-child-bazi'

interface PersonForm {
  gender: 'male' | 'female'
  birthDate: string
  birthHour?: DiZhi
  name: string
}

const { t, locale } = useI18n()
const toast = useToast()

const phase = ref<'form' | 'animating' | 'result'>('form')
const form = reactive<{ parent: PersonForm; child: PersonForm }>({
  parent: { gender: 'male', birthDate: '', birthHour: undefined, name: '' },
  child: { gender: 'male', birthDate: '', birthHour: undefined, name: '' },
})
const calcResult = ref<ParentChildBaziCalcResult | null>(null)

const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)
const resultRef = ref<HTMLDivElement>()

const tz = getLocalTimeZone()
const df = new DateFormatter('zh-CN', { dateStyle: 'long' })
const parentCalendarDate = ref<CalendarDate | undefined>(undefined)
const childCalendarDate = ref<CalendarDate | undefined>(undefined)

const hourOptions = SHICHEN_OPTIONS.map(s => ({
  label: `${s.label}（${s.range}）`,
  value: s.dizhi,
}))

watch(parentCalendarDate, (v) => {
  form.parent.birthDate = v ? `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}` : ''
})
watch(childCalendarDate, (v) => {
  form.child.birthDate = v ? `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}` : ''
})

const isValid = computed(() => {
  return (
    form.parent.gender &&
    form.parent.birthDate &&
    form.child.gender &&
    form.child.birthDate
  )
})

const shareName = computed(() => {
  if (!calcResult.value) return ''
  return `${calcResult.value.parent.profile.name || t('parentChildBazi.parentLabel')} · ${calcResult.value.child.profile.name || t('parentChildBazi.childLabel')}`
})

const shareSummary = computed(() => {
  if (!calcResult.value) return ''
  return `${calcResult.value.childTraits.dominantShiShen}${t('parentChildBazi.childTraitSuffix')} · ${calcResult.value.friction?.title || ''}`
})

async function handleSubmit() {
  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<ParentChildBaziCalcResult>('/api/tools/parent-child-bazi/calc', {
      method: 'POST',
      body: {
        parent: {
          gender: form.parent.gender,
          birthDate: form.parent.birthDate,
          birthHour: form.parent.birthHour || null,
          name: form.parent.name || '',
        },
        child: {
          gender: form.child.gender,
          birthDate: form.child.birthDate,
          birthHour: form.child.birthHour || null,
          name: form.child.name || '',
        },
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    setTimeout(() => startAiStream(), 300)
  }
  catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('parentChildBazi.calcFail'),
      description: err.data?.message || err.message || t('parentChildBazi.checkInput'),
      color: 'error',
    })
  }
}

async function startAiStream() {
  if (!calcResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/parent-child-bazi/reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: calcResult.value,
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
          }
          else if (data.type === 'error') {
            aiError.value = data.message || t('parentChildBazi.aiUnavailable')
          }
        }
        catch {
          // ignore
        }
      }
    }
  }
  catch (e: any) {
    aiError.value = e?.message || t('parentChildBazi.aiUnavailable')
  }
  finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
}

function handleCopy() {
  if (!calcResult.value) return
  const text = `${t('parentChildBazi.resultTitle')}

${t('parentChildBazi.parentLabel')}：${calcResult.value.parent.profile.name || t('common.unknown')}
${t('parentChildBazi.childLabel')}：${calcResult.value.child.profile.name || t('common.unknown')}

【${t('parentChildBazi.relationLabel')}】
${calcResult.value.relation.parentToChildShiShen}${t('parentChildBazi.parentToChildSuffix')} · ${calcResult.value.relation.childToParentShiShen}${t('parentChildBazi.childToParentSuffix')}
${calcResult.value.relation.dayMasterRelationLabel}

【${t('parentChildBazi.childTraitLabel')}】
${calcResult.value.childTraits.dominantShiShen}${t('parentChildBazi.childTraitSuffix')}
${calcResult.value.childTraits.labels.join('、')}
${calcResult.value.childTraits.scenario}

【${t('parentChildBazi.frictionLabel')}】
${calcResult.value.friction?.title}
${calcResult.value.friction?.conflict}

${t('parentChildBazi.actionsTitle')}：
${calcResult.value.friction?.actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

${aiContent.value ? '【' + t('parentChildBazi.interpretation') + '】\n' + aiContent.value : ''}
`
  navigator.clipboard.writeText(text).then(() => {
    toast.add({ title: t('share.textCopied'), color: 'success' })
  }).catch(() => {
    toast.add({ title: t('share.copyFail'), color: 'error' })
  })
}

const aiSections = computed(() => {
  if (!aiContent.value) return []
  const rawSections = aiContent.value.split(/\n(?=##\s)/)
  const result: { title: string; content: string }[] = []
  for (const raw of rawSections) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lines = trimmed.split('\n')
    const titleLine = lines[0]!.replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      result.push({ title: titleLine || t('parentChildBazi.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.parentChildBaziTitle')} - ${siteName}`,
  description: t('seo.parentChildBaziDesc'),
  keywords: t('seo.parentChildBaziKeywords'),
  ogTitle: () => `${t('seo.parentChildBaziOgTitle')} - ${siteName}`,
  ogDescription: t('seo.parentChildBaziOgDesc'),
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/parent-child-bazi',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.parentChildBaziTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/parent-child-bazi',
        description: t('seo.parentChildBaziDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('parentChildBazi.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/parent-child-bazi',
          description: t('seo.parentChildBaziOgDesc'),
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
.ai-section-content :deep(p) {
  margin-bottom: 0.6em;
  line-height: 1.75;
  color: var(--text-body);
}
.ai-section-content :deep(p:last-child) {
  margin-bottom: 0;
}
.ai-section-content :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}
.ai-section-content :deep(ul) {
  margin-left: 0;
  padding-left: 0;
  list-style: none;
  margin-bottom: 0.5rem;
}
.ai-section-content :deep(ul li) {
  position: relative;
  padding-left: 1.1rem;
  margin-bottom: 0.3rem;
  line-height: 1.65;
  color: var(--text-body);
}
.ai-section-content :deep(ul li::before) {
  content: '•';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--accent);
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
