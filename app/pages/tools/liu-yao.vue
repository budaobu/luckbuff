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
        <!-- Section 标题 -->
        <div class="mb-8">
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Liuyao World Cup 2026</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('liuyao.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('liuyao.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('liuyao.disclaimerTop') }}
          </p>
        </div>

        <!-- 比赛选择卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden mb-5">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-5">
            <!-- 比赛选择 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ t('qimenWorldcup.form.selectMatch') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <USelectMenu
                v-model="selectedMatchUid"
                :items="matchItems"
                :placeholder="t('qimenWorldcup.form.matchPlaceholder')"
                searchable
                class="w-full"
                :ui="selectUi"
              />
            </div>

            <!-- 已选比赛信息 -->
            <div v-if="selectedMatch" class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 flex-1">
                  <span class="text-base font-bold text-[var(--text-primary)]">{{ translateTeamName(selectedMatch.homeTeam) }}</span>
                  <span class="text-xs text-[var(--text-faint)]">VS</span>
                  <span class="text-base font-bold text-[var(--text-primary)]">{{ translateTeamName(selectedMatch.awayTeam) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5" />
                <span>{{ formatMatchTime(selectedMatch.startTime) }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5" />
                <span>{{ selectedMatch.venue || t('common.unknown') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 摇卦工作台卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden mb-5">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6">
            <LiuyaoTossWorkbench
              ref="tossWorkbenchRef"
              @update="handleLineValuesUpdate"
            />
          </div>
        </div>

        <!-- 起卦按钮 -->
        <UButton
          color="warning"
          size="lg"
          block
          :disabled="!canSubmit"
          class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
          @click="handleSubmit"
        >
          <template #leading>
            <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
          </template>
          {{ $t('liuyao.castingBtn') }}
        </UButton>

        <p v-if="!canSubmit" class="text-center text-[10px] text-[var(--text-placeholder)] mt-2">
          {{ submitHint }}
        </p>

        <!-- 错误卡片：物理层熔断 -->
        <div
          v-if="errorInfo"
          class="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4"
        >
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-heroicons-shield-exclamation" class="w-4 h-4 text-red-400" />
            <span class="text-sm font-semibold text-red-400">{{ $t('liuyao.physicalBlowout') }}</span>
          </div>
          <p class="text-xs text-[var(--text-muted)]">{{ errorInfo.message }}</p>
          <p class="text-[10px] text-[var(--text-placeholder)] mt-1 font-mono">code: {{ errorInfo.code }}</p>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyao.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyao.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyao.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyao.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyao.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyao.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyao.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('liuyao.knowledgeCard4Desc') }}</p>
          </div>
        </div>

      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <LiuyaoCoinSpin size="full" :label="$t('liuyao.calculating')" />
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && liuYaoResult">
        <div ref="shareTargetRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Divination Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('liuyao.resultTitle') }}
            </h1>
            <div class="flex items-center gap-3 mt-3">
              <span class="text-base">{{ getFlag(subject.home!.id) }}</span>
              <span class="text-sm text-[var(--text-primary)]">{{ getTeamName(subject.home!.id, subject.home!.name) }}</span>
              <span class="text-xs text-[var(--text-placeholder)]">VS</span>
              <span class="text-sm text-[var(--text-primary)]">{{ getTeamName(subject.away!.id, subject.away!.name) }}</span>
              <span class="text-base">{{ getFlag(subject.away!.id) }}</span>
            </div>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 时空信息 -->
          <div v-if="liuYaoResult.temporal_context" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('liuyaoPage.temporalParams') }}
            </h3>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="rounded-lg bg-[var(--surface-card)] p-3">
                <span class="text-[var(--text-placeholder)] block mb-1">{{ $t('liuyaoPage.yueJian') }}</span>
                <span class="text-[var(--text-primary)] font-medium">{{ liuYaoResult.temporal_context.月建 }}</span>
              </div>
              <div class="rounded-lg bg-[var(--surface-card)] p-3">
                <span class="text-[var(--text-placeholder)] block mb-1">{{ $t('liuyaoPage.riChen') }}</span>
                <span class="text-[var(--text-primary)] font-medium">{{ liuYaoResult.temporal_context.日辰 }}</span>
              </div>
              <div class="rounded-lg bg-[var(--surface-card)] p-3">
                <span class="text-[var(--text-placeholder)] block mb-1">{{ $t('liuyaoPage.shiChen') }}</span>
                <span class="text-[var(--text-primary)] font-medium">{{ liuYaoResult.temporal_context.时辰 }}</span>
              </div>
              <div class="rounded-lg bg-[var(--surface-card)] p-3">
                <span class="text-[var(--text-placeholder)] block mb-1">{{ $t('liuyaoPage.xunKong') }}</span>
                <span class="text-[var(--text-primary)] font-medium">{{ liuYaoResult.temporal_context.旬空 }}</span>
              </div>
            </div>
          </div>

          <!-- 卦象信息 -->
          <div v-if="liuYaoResult.hexagram" class="grid grid-cols-3 gap-3 mb-5">
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
              <p class="text-[10px] text-[var(--text-faint)] mb-1.5">{{ $t('liuyaoPage.benGua') }}</p>
              <p class="text-lg font-bold text-[var(--text-primary)]">{{ liuYaoResult.hexagram.本卦 }}</p>
              <p class="text-[10px] text-[var(--accent-muted)] mt-1">{{ $t('liuyaoPage.shiYing', { shi: liuYaoResult.hexagram.世爻位, ying: liuYaoResult.hexagram.应爻位 }) }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
              <p class="text-[10px] text-[var(--text-faint)] mb-1.5">{{ $t('liuyaoPage.bianGua') }}</p>
              <p class="text-lg font-bold text-[var(--text-primary)]">{{ liuYaoResult.hexagram.变卦 }}</p>
            </div>
            <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4 text-center">
              <p class="text-[10px] text-[var(--text-faint)] mb-1.5">{{ $t('liuyaoPage.huGua') }}</p>
              <p class="text-lg font-bold text-[var(--text-primary)]">{{ liuYaoResult.hexagram.互卦 }}</p>
            </div>
          </div>

          <!-- 爻象展示 -->
          <div v-if="liuYaoResult.lines_top_down" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3">{{ $t('liuyao.chartTitle') }}</h3>
            <div class="space-y-1.5">
              <div
                v-for="(line, index) in liuYaoResult.lines_top_down"
                :key="index"
                class="flex items-center gap-3 rounded-xl border px-3 py-2"
                :class="line.isMoving ? 'border-l-2 border-l-[#c9a227]/40 bg-[var(--surface-card)]' : 'border-[var(--border-light)] bg-[var(--surface-card)]'"
              >
                <span class="text-[10px] text-[var(--text-placeholder)] w-8 text-center">{{ line.label }}</span>
                <!-- 铜钱可视化 -->
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

        <!-- AI 断语 -->
        <div ref="aiInterpretationRef" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <LiuyaoAiInterpretation
            :content="aiContent"
            :streaming="aiStreaming"
            :started="aiStarted"
            :error="aiError"
            :home-label="subject.home ? `${getTeamName(subject.home.id, subject.home.name)} ${$t('liuyaoPage.homeWinSuffix')}` : $t('matchProbability.homeDefault')"
            :away-label="subject.away ? `${getTeamName(subject.away.id, subject.away.name)} ${$t('liuyaoPage.awayWinSuffix')}` : $t('matchProbability.awayDefault')"
          />

          <!-- 重新解读按钮 -->
          <div v-if="!aiStreaming && (aiContent || aiError)" class="flex justify-center mt-4">
            <UButton
              color="warning"
              variant="soft"
              size="sm"
              class="group/btn"
              @click="startAiStream"
            >
              <template #leading>
                <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
              </template>
              {{ $t('liuyaoPage.reinterpretBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 结果页免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mt-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('liuyao.disclaimerTop') }}
          </p>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="handleShare"
          >
            <template #leading>
              <UIcon name="i-heroicons-share" class="w-4 h-4" />
            </template>
            {{ $t('liuyaoPage.shareBtn') }}
          </UButton>
          <UButton
            color="warning"
            variant="soft"
            class="group/btn"
            @click="resetForm"
          >
            <template #leading>
              <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            </template>
            {{ $t('liuyaoPage.restartBtn') }}
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
            {{ $t('liuyaoPage.backToTools') }}
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
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoPage.timeGuardTitle') }}</h3>
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
              <p class="text-sm text-[var(--text-muted)] leading-relaxed" v-html="unescapeHtml($t('liuyaoPage.timeGuardDesc'))" />

              <!-- 城市未识别的错误提示 -->
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
                  {{ geo.loading ? $t('liuyaoPage.gettingLocation') : $t('liuyaoPage.getLocation') }}
                </UButton>

                <!-- 定位失败时提示手动输入 -->
                <p v-if="geoError" class="text-xs text-[var(--text-faint)] -mt-1 text-center">
                  {{ $t('liuyaoPage.locationUnavailable') }} ↓
                </p>

                <div class="flex items-center gap-2">
                  <div class="flex-1 h-px bg-[var(--surface-card-hover)]" />
                  <span class="text-[10px] text-[var(--text-placeholder)]">{{ $t('liuyaoPage.or') }}</span>
                  <div class="flex-1 h-px bg-[var(--surface-card-hover)]" />
                </div>

                <div class="flex gap-2">
                  <UInput
                    ref="cityInputRef"
                    v-model="manualCity"
                    :placeholder="$t('liuyaoPage.cityInputPlaceholder')"
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
                    {{ $t('liuyaoPage.confirm') }}
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

    <!-- 分享弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="shareDialogOpen"
          class="fixed inset-0 z-50 flex items-center justify-center"
          @click.self="shareDialogOpen = false"
        >
          <div class="absolute inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm" />
          <div class="relative rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-dropdown)] overflow-hidden w-[90vw] max-w-md mx-4 shadow-2xl">
            <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
            <div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
                  <UIcon name="i-heroicons-share" class="w-4 h-4" />
                </div>
                <h3 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('liuyaoPage.shareTitle') }}</h3>
              </div>
              <UButton
                color="neutral"
                variant="ghost"
                class="text-[var(--text-faint)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
                @click="() => { shareDialogOpen = false }"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </UButton>
            </div>
            <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('liuyaoPage.shareTextLabel') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-3 text-sm text-[var(--text-body)] leading-relaxed whitespace-pre-wrap">
                  {{ shareData?.copyText }}
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="copyShareText">
                  <template #leading>
                    <UIcon name="i-heroicons-clipboard-document" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('liuyaoPage.copyTextBtn') }}
                </UButton>
              </div>
              <div v-if="shareData?.screenshotDataUrl">
                <p class="text-[11px] text-[var(--text-faint)] mb-1.5 tracking-wide">{{ $t('liuyaoPage.shareScreenshotLabel') }}</p>
                <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-2 overflow-hidden">
                  <img :src="shareData.screenshotDataUrl" :alt="$t('liuyaoPage.screenshotAlt')" class="w-full rounded-lg">
                </div>
                <UButton color="warning" variant="soft" size="xs" class="mt-2" @click="downloadShareImage">
                  <template #leading>
                    <UIcon name="i-heroicons-arrow-down-tray" class="w-3.5 h-3.5" />
                  </template>
                  {{ $t('liuyaoPage.downloadImageBtn') }}
                </UButton>
              </div>
              <div v-else class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] px-3.5 py-6 text-center">
                <UIcon name="i-heroicons-photo" class="w-8 h-8 text-[var(--text-placeholder)] mx-auto mb-2" />
                <p class="text-xs text-[var(--text-faint)]">{{ $t('liuyaoPage.screenshotFailed') }}</p>
                <p v-if="shareData?.screenshotError" class="text-[10px] text-red-400/60 mt-1.5 font-mono">
                  {{ shareData.screenshotError }}
                </p>
              </div>
            </div>
            <div class="px-5 py-3 border-t border-[var(--border-light)] text-center">
              <p class="text-[10px] text-[var(--text-placeholder)]">{{ $t('liuyaoPage.generatedBy') }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { WorldCupTeam, LineValue, LiuYaoResult } from '~/types/liuyao'
import type { WorldCupFixture, WorldCupFixturesData } from '~/types/qimen-worldcup'

const { t, locale } = useI18n()

// AI 解读状态（本地管理，替代 useAiStream）
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)

// ============================================================
// 赛程数据
// ============================================================
const { data: fixturesData, status: fixturesStatus } = await useAsyncData('liuyao-worldcup-fixtures', () =>
  $fetch<WorldCupFixturesData>('/api/prophet/worldcup-fixtures', { query: { lang: locale.value } })
)

const fixturesLoading = computed(() => fixturesStatus.value === 'pending')
const fixtures = computed(() => fixturesData.value?.events || [])

// 中文队名 → 国家代码（用于 i18n 翻译）
const teamNameToCode: Record<string, string> = {
  '墨西哥': 'MEX', '南非': 'RSA', '韩国': 'KOR', '捷克': 'CZE', '加拿大': 'CAN',
  '波黑': 'BIH', '卡塔尔': 'QAT', '瑞士': 'SUI', '巴西': 'BRA', '摩洛哥': 'MAR',
  '海地': 'HAI', '苏格兰': 'SCO', '美国': 'USA', '巴拉圭': 'PAR', '澳大利亚': 'AUS',
  '土耳其': 'TUR', '德国': 'GER', '库拉索': 'CUW', '科特迪瓦': 'CIV', '厄瓜多尔': 'ECU',
  '荷兰': 'NED', '日本': 'JPN', '瑞典': 'SWE', '突尼斯': 'TUN', '比利时': 'BEL',
  '埃及': 'EGY', '伊朗': 'IRN', '新西兰': 'NZL', '西班牙': 'ESP', '佛得角': 'CPV',
  '沙特阿拉伯': 'KSA', '乌拉圭': 'URU', '法国': 'FRA', '塞内加尔': 'SEN', '挪威': 'NOR',
  '伊拉克': 'IRQ', '阿根廷': 'ARG', '阿尔及利亚': 'ALG', '奥地利': 'AUT', '约旦': 'JOR',
  '葡萄牙': 'POR', '刚果（金）': 'COD', '乌兹别克斯坦': 'UZB', '哥伦比亚': 'COL',
  '英格兰': 'ENG', '克罗地亚': 'CRO', '加纳': 'GHA', '巴拿马': 'PAN',
  // English names (when fixtures API returns English ICS)
  'Mexico': 'MEX', 'South Africa': 'RSA', 'South Korea': 'KOR', 'Czech Republic': 'CZE',
  'Canada': 'CAN', 'Bosnia and Herzegovina': 'BIH', 'Qatar': 'QAT', 'Switzerland': 'SUI',
  'Brazil': 'BRA', 'Morocco': 'MAR', 'Haiti': 'HAI', 'Scotland': 'SCO', 'USA': 'USA',
  'Paraguay': 'PAR', 'Australia': 'AUS', 'Turkey': 'TUR', 'Germany': 'GER',
  'Curaçao': 'CUW', 'Ivory Coast': 'CIV', 'Ecuador': 'ECU', 'Netherlands': 'NED',
  'Japan': 'JPN', 'Sweden': 'SWE', 'Tunisia': 'TUN', 'Belgium': 'BEL', 'Egypt': 'EGY',
  'Iran': 'IRN', 'New Zealand': 'NZL', 'Spain': 'ESP', 'Cape Verde': 'CPV',
  'Saudi Arabia': 'KSA', 'Uruguay': 'URU', 'France': 'FRA', 'Senegal': 'SEN',
  'Norway': 'NOR', 'Iraq': 'IRQ', 'Argentina': 'ARG', 'Algeria': 'ALG',
  'Austria': 'AUT', 'Jordan': 'JOR', 'Portugal': 'POR', 'DR Congo': 'COD',
  'Uzbekistan': 'UZB', 'Colombia': 'COL', 'England': 'ENG', 'Croatia': 'CRO',
  'Ghana': 'GHA', 'Panama': 'PAN',
}

function translateTeamName(name: string): string {
  const code = teamNameToCode[name]
  if (code) return t(`teams.${code}`)

  const mw = name.match(/^第(\d+)场胜者$/)
  if (mw) return t('qimenWorldcup.placeholders.matchWinner', { n: mw[1] })

  const ml = name.match(/^第(\d+)场败者$/)
  if (ml) return t('qimenWorldcup.placeholders.matchLoser', { n: ml[1] })

  return name
}

function formatMatchTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const fmtLocale = locale.value === 'en' ? 'en-US' : locale.value
  return d.toLocaleString(fmtLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    hour12: false,
  })
}

function formatMatchTimeShort(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const fmtLocale = locale.value === 'en' ? 'en-US' : locale.value
  return d.toLocaleString(fmtLocale, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const matchItems = computed(() => {
  return fixtures.value.map(f => ({
    label: `${translateTeamName(f.homeTeam)} vs ${translateTeamName(f.awayTeam)} — ${formatMatchTimeShort(f.startTime)}`,
    value: f.uid,
  }))
})

const selectedMatchUid = ref<{ label: string; value: string } | undefined>(undefined)
const selectedMatch = ref<WorldCupFixture | null>(null)

// Nuxt UI v4 USelectMenu 单选模式下 v-model 返回的是整个 item 对象 { label, value }
watch(selectedMatchUid, (uid) => {
  if (!uid) {
    selectedMatch.value = null
    subject.home = null
    subject.away = null
    return
  }
  const uidValue = typeof uid === 'object' && uid !== null ? (uid as any).value : uid
  const match = fixtures.value.find(f => f.uid === uidValue)
  selectedMatch.value = match || null

  if (match) {
    const homeCode = teamNameToCode[match.homeTeam] || match.homeTeam
    const awayCode = teamNameToCode[match.awayTeam] || match.awayTeam
    subject.home = { id: homeCode, name: match.homeTeam }
    subject.away = { id: awayCode, name: match.awayTeam }
  }
})

// ============================================================
// 状态
// ============================================================
const phase = ref<'form' | 'animating' | 'result'>('form')

const subject = reactive<{ home: WorldCupTeam | null; away: WorldCupTeam | null }>({
  home: null,
  away: null,
})

const lineValues = ref<LineValue[]>([])
const tossWorkbenchRef = ref()

const { location: geo, requestLocation, setCity, resolveCityCoords, resolveCityCoordsFallback } = useGeolocation()
const showTimeGuard = ref(false)
const manualCity = ref('')
const pendingSubmit = ref(false)
const cityNotRecognized = ref('')
const citySubmitting = ref(false)
const geoError = ref(false)
const cityInputRef = ref()

// 排盘结果
const liuYaoResult = ref<LiuYaoResult | null>(null)
const errorInfo = ref<{ code: string; message: string } | null>(null)
const toast = useToast()

// 分享
const shareDialogOpen = ref(false)
const shareData = ref<{ copyText: string; screenshotDataUrl: string | null; filename: string; screenshotError: string | null } | null>(null)
const shareTargetRef = ref<HTMLDivElement>()
const aiInterpretationRef = ref<HTMLDivElement>()

// ============================================================
// 计算属性
// ============================================================
const canSubmit = computed(() => {
  return selectedMatch.value !== null && lineValues.value.length === 6
})

const submitHint = computed(() => {
  if (!selectedMatch.value) return t('liuyaoPage.needSelectMatch')
  if (lineValues.value.length < 6) return t('liuyaoPage.needMoreTosses', { n: 6 - lineValues.value.length })
  return ''
})

// ============================================================
// 子时边界检测
// ============================================================
function isZiHourBoundary(date: Date = new Date()): boolean {
  const h = date.getHours()
  const m = date.getMinutes()
  const totalMinutes = h * 60 + m
  // 22:30 = 1350 分钟, 01:30 = 90 分钟
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

  // 子时边界拦截
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
    // 定位失败，引导用户使用手动输入
    geoError.value = true
    nextTick(() => {
      // 聚焦到城市输入框
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
      cast_datetime: new Date().toISOString(),
      location: geo.longitude ? {
        longitude: geo.longitude,
        latitude: geo.latitude,
        timezone: geo.timezone,
        city: geo.city,
      } : {
        city: geo.city || undefined,
        timezone: geo.timezone,
      },
      subject_home: subject.home?.id,
      subject_away: subject.away?.id,
    }

    const result = await $fetch<LiuYaoResult>('/api/liu-yao/predict', {
      method: 'POST',
      body: payload,
    })

    liuYaoResult.value = result

    // Status 三路分流
    if (result.status === 'ok') {
      phase.value = 'result'
      // 延迟启动 AI 解读，让页面先渲染
      setTimeout(() => startAiStream(), 300)
    } else if (result.status === 'system_pause') {
      phase.value = 'form'
      if (result.error_code === 'CITY_NOT_RECOGNIZED') {
        // 城市名无法解析为经纬度，重新打开弹窗并显示具体错误
        showTimeGuard.value = true
        cityNotRecognized.value = (result as any).message || t('liuyaoPage.cityNotRecognizedMsg')
        pendingSubmit.value = true
        toast.add({
          title: t('liuyaoPage.cityNotRecognized'),
          description: (result as any).message || t('liuyaoPage.cityNotRecognizedDesc'),
          color: 'warning',
        })
      } else {
        // 其他 system_pause（如 ZI_HOUR_BOUNDARY_UNCALIBRATED）
        showTimeGuard.value = true
        pendingSubmit.value = true
        toast.add({
          title: t('liuyaoPage.timeGuardIntercept'),
          description: result.error_code || t('liuyaoPage.timeGuardInterceptDesc'),
          color: 'warning',
        })
      }
    } else if (result.status === 'fatal_error') {
      phase.value = 'form'
      errorInfo.value = {
        code: result.error_code || 'UNKNOWN',
        message: t('liuyaoPage.physicalBlowoutMsg'),
      }
      toast.add({
        title: t('liuyaoPage.chartFailMsg'),
        description: result.error_code || t('liuyaoPage.unknownErrorMsg'),
        color: 'error',
      })
    }
  } catch (err: any) {
    phase.value = 'form'
    errorInfo.value = {
      code: err.data?.error_code || 'NETWORK_ERROR',
      message: err.data?.message || err.message || t('liuyaoPage.requestFailMsg'),
    }
    toast.add({
      title: t('liuyaoPage.requestFailMsg'),
      description: errorInfo.value.message,
      color: 'error',
    })
  }
}

async function startAiStream() {
  if (!liuYaoResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/liu-yao/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        result: liuYaoResult.value,
        homeTeam: subject.home,
        awayTeam: subject.away,
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
            aiError.value = (data as any).message || t('liuyaoPage.aiRequestFailed')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('liuyaoPage.aiRequestFailed')
  } finally {
    aiStreaming.value = false
  }
}

function resetForm() {
  phase.value = 'form'
  subject.home = null
  subject.away = null
  lineValues.value = []
  liuYaoResult.value = null
  errorInfo.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null
  tossWorkbenchRef.value?.reset()
  pendingSubmit.value = false
  manualCity.value = ''
  selectedMatchUid.value = undefined
  selectedMatch.value = null
}

// 根据卦象计算简单胜负倾向（变卦阳爻多则主队有利，阴爻多则客队有利）
function getLiuYaoPrediction(result: LiuYaoResult): string {
  const lines = result.transformed_lines_top_down || result.lines_top_down
  if (!lines || lines.length === 0) return t('matchProbability.draw')

  let yangCount = 0
  let yinCount = 0
  for (const line of lines) {
    // 变卦中：6→7(阳), 7→7(阳), 8→8(阴), 9→8(阴)
    // 直接使用 transformed_lines 的 value，如果没有则推断
    const val = line.value
    if (val === 6 || val === 7) yangCount++
    else if (val === 8 || val === 9) yinCount++
  }

  const homeName = subject.home ? getTeamName(subject.home.id, subject.home.name) : t('tournamentPicker.homeTeam')
  const awayName = subject.away ? getTeamName(subject.away.id, subject.away.name) : t('tournamentPicker.awayTeam')

  if (yangCount > yinCount) return t('matchProbability.homeWin', { team: homeName })
  if (yinCount > yangCount) return t('matchProbability.awayWin', { team: awayName })
  return t('matchProbability.draw')
}

async function handleShare() {
  if (!liuYaoResult.value || !subject.home || !subject.away) return
  const { share } = useShare()

  const homeName = getTeamName(subject.home.id, subject.home.name)
  const awayName = getTeamName(subject.away.id, subject.away.name)
  const prediction = getLiuYaoPrediction(liuYaoResult.value)
  const hex = liuYaoResult.value.hexagram
  const hexSummary = hex
    ? hex.本卦 === hex.变卦
      ? hex.本卦
      : `${hex.本卦}变${hex.变卦}`
    : ''

  const summary = `六爻占卜预测2026世界杯「${homeName} vs ${awayName}」${prediction}${hexSummary ? '，' + hexSummary : ''}`

  try {
    // 优先截取 AI 断语卡片，若 AI 尚未输出则回退到完整结果区域
    const target = (aiContent.value && aiInterpretationRef.value)
      ? aiInterpretationRef.value
      : shareTargetRef.value

    const result = await share({
      tool: 'liuyao',
      name: '',
      summary,
      shareTarget: target,
      filename: `liuyao-${new Date().toISOString().slice(0, 10)}.png`,
      t,
    })
    shareData.value = result
    shareDialogOpen.value = true
  } catch (e: any) {
    toast.add({
      title: t('liuyaoPage.shareFailMsg'),
      description: e?.message || t('liuyaoPage.shareErrorMsg'),
      color: 'error',
    })
  }
}

async function copyShareText() {
  if (!shareData.value?.copyText) return
  try {
    await navigator.clipboard.writeText(shareData.value.copyText)
    toast.add({ title: t('liuyaoPage.copySuccessMsg'), color: 'success' })
  } catch {
    toast.add({ title: t('liuyaoPage.copyFailMsg'), color: 'error' })
  }
}

function downloadShareImage() {
  if (!shareData.value?.screenshotDataUrl) return
  const link = document.createElement('a')
  link.href = shareData.value.screenshotDataUrl
  link.download = shareData.value.filename
  link.click()
}

// 国旗映射
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

function unescapeHtml(str: string): string {
  return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
}

function getTeamName(id: string, fallbackName: string): string {
  const key = `teams.${id}`
  const translated = t(key)
  return translated === key ? fallbackName : translated
}

function isYin(val: number): boolean {
  return val === 6 || val === 8
}

// 根据爻值推断 3 枚铜钱正反面
// 6=3字(2+2+2) 7=2字1背(2+2+3) 8=1字2背(2+3+3) 9=3背(3+3+3)
function inferCoins(value: number): Array<{ isBack: boolean }> {
  switch (value) {
    case 6: return [{ isBack: false }, { isBack: false }, { isBack: false }]
    case 7: return [{ isBack: false }, { isBack: false }, { isBack: true }]
    case 8: return [{ isBack: false }, { isBack: true }, { isBack: true }]
    case 9: return [{ isBack: true }, { isBack: true }, { isBack: true }]
    default: return [{ isBack: false }, { isBack: false }, { isBack: false }]
  }
}

// ============ UI Config ============
const selectUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
  content: 'bg-[var(--surface-dropdown)] border border-[var(--border-light)] rounded-xl shadow-2xl max-h-[300px]',
  item: 'text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] data-[state=checked]:bg-[var(--accent-bg)] data-[state=checked]:text-[var(--accent)]',
}

// ============================================================
// SEO
// ============================================================
const pageDescription = computed(() => {
  if (phase.value === 'result' && subject.home && subject.away && liuYaoResult.value?.hexagram) {
    return t('liuyao.shareText', {
      home: subject.home.name,
      away: subject.away.name,
      benGua: liuYaoResult.value.hexagram.本卦,
      bianGua: liuYaoResult.value.hexagram.变卦,
    })
  }
  return t('liuyao.shareTextDefault')
})

const siteName = 'ososn'

useSeoMeta({
  title: () => `${t('seo.liuyaoTitle')} - ${siteName}`,
  description: pageDescription,
  keywords: t('seo.liuyaoKeywords'),
  ogTitle: () => `${t('seo.liuyaoOgTitle')} - ${siteName}`,
  ogDescription: pageDescription,
  ogImage: 'https://www.ososn.com/og-image.png',
  ogType: 'website',
  ogUrl: 'https://www.ososn.com/tools/liu-yao',
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.liuyaoTitle')} - ${siteName}`,
        url: 'https://www.ososn.com/tools/liu-yao',
        description: pageDescription.value,
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('home.toolLiuyaoTitle'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: 'https://www.ososn.com/tools/liu-yao',
          description: t('home.toolLiuyaoDesc'),
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
