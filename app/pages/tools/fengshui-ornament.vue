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
          <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Feng Shui Ornaments</span>
          <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
            {{ $t('fengshuiOrnament.title') }}
          </h1>
          <p class="text-sm text-[var(--text-faint)] mt-2">
            {{ $t('fengshuiOrnament.subtitle') }}
          </p>
          <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
        </div>

        <!-- 顶部免责声明 -->
        <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
          <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
            {{ $t('fengshuiOrnament.disclaimer') }}
          </p>
        </div>

        <!-- 表单卡片 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden">
          <div class="h-px bg-gradient-to-r from-transparent via-[var(--accent-border-hover)] to-transparent" />
          <div class="p-6 space-y-6">
            <!-- 房间类型 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.roomTypeLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <RoomTypeSelector v-model="form.roomType" />
            </div>

            <!-- 房间朝向角度 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.directionLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model.number="form.direction"
                type="number"
                :min="0"
                :max="360"
                :placeholder="$t('fengshuiOrnament.directionPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('fengshuiOrnament.directionHint') }}
              </p>
              <FengshuiCompassInput v-model="form.direction" />
            </div>

            <!-- 建成/装修年份 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.yearLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <UInput
                v-model.number="form.year"
                type="number"
                :min="1900"
                :max="2100"
                :placeholder="$t('fengshuiOrnament.yearPlaceholder')"
                class="w-full"
                :ui="inputUi"
              />
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('fengshuiOrnament.yearHint') }}
              </p>
            </div>

            <!-- 房间长宽 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.sizeLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="flex items-center gap-3">
                <UInput
                  v-model.number="form.lengthM"
                  type="number"
                  :min="1"
                  :max="100"
                  step="0.1"
                  :placeholder="$t('fengshuiOrnament.lengthPlaceholder')"
                  class="flex-1"
                  :ui="inputUi"
                />
                <span class="text-[var(--text-faint)]">×</span>
                <UInput
                  v-model.number="form.widthM"
                  type="number"
                  :min="1"
                  :max="100"
                  step="0.1"
                  :placeholder="$t('fengshuiOrnament.widthPlaceholder')"
                  class="flex-1"
                  :ui="inputUi"
                />
              </div>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('fengshuiOrnament.sizeHint') }}
              </p>
            </div>

            <!-- 门的大致方位 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.doorLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="dir in eightDirections"
                  :key="dir"
                  type="button"
                  class="py-2 rounded-lg border text-sm font-medium transition-all duration-200"
                  :class="form.doorDirection === dir
                    ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                    : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                  @click="form.doorDirection = dir"
                >
                  {{ t(`fengshuiOrnament.directions.${directionKey(dir)}`) }}
                </button>
              </div>
            </div>

            <!-- 缺角/凸出标注（可选） -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.irregularLabel') }}
                <span class="text-[var(--text-faint)]">（{{ $t('common.optional') }}）</span>
              </label>
              <div class="grid grid-cols-4 gap-2">
                <div
                  v-for="dir in eightDirections"
                  :key="dir"
                  class="rounded-lg border border-[var(--border-light)] bg-[var(--surface-input)] p-2 text-center"
                >
                  <div class="text-xs text-[var(--text-muted)] mb-1.5">
                    {{ t(`fengshuiOrnament.directions.${directionKey(dir)}`) }}
                  </div>
                  <div class="flex gap-1 justify-center">
                    <button
                      type="button"
                      class="px-1.5 py-0.5 rounded text-[10px] border transition-all duration-200"
                      :class="irregularType(dir) === 'missing'
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                        : 'border-[var(--border-light)] text-[var(--text-faint)] hover:border-[var(--border-medium)]'"
                      @click="toggleIrregular(dir, 'missing')"
                    >
                      {{ $t('fengshuiOrnament.irregularMissing') }}
                    </button>
                    <button
                      type="button"
                      class="px-1.5 py-0.5 rounded text-[10px] border transition-all duration-200"
                      :class="irregularType(dir) === 'protruding'
                        ? 'border-sky-500/40 bg-sky-500/10 text-sky-400'
                        : 'border-[var(--border-light)] text-[var(--text-faint)] hover:border-[var(--border-medium)]'"
                      @click="toggleIrregular(dir, 'protruding')"
                    >
                      {{ $t('fengshuiOrnament.irregularProtruding') }}
                    </button>
                  </div>
                </div>
              </div>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('fengshuiOrnament.irregularHint') }}
              </p>
            </div>

            <!-- 使用者列表 -->
            <div>
              <label class="block text-sm text-[var(--text-muted)] mb-2">
                {{ $t('fengshuiOrnament.usersLabel') }} <span class="text-[var(--accent)]">*</span>
              </label>
              <div class="space-y-3">
                <div
                  v-for="(user, idx) in form.users"
                  :key="idx"
                  class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-input)] p-4 space-y-3"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-medium text-[var(--text-muted)]">
                      {{ $t('fengshuiOrnament.userTitle', { index: idx + 1 }) }}
                    </span>
                    <button
                      v-if="form.users.length > 1"
                      type="button"
                      class="text-[var(--text-faint)] hover:text-red-400 transition-colors"
                      @click="form.users.splice(idx, 1)"
                    >
                      <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                    </button>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <UInput
                      v-model="user.nickname"
                      :placeholder="$t('fengshuiOrnament.nicknamePlaceholder')"
                      :ui="inputUi"
                    />
                    <div class="flex gap-2">
                      <button
                        type="button"
                        class="flex-1 py-2 rounded-lg border text-sm font-medium transition-all duration-200"
                        :class="user.gender === 'male'
                          ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                          : 'border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                        @click="user.gender = 'male'"
                      >
                        {{ $t('common.male') }}
                      </button>
                      <button
                        type="button"
                        class="flex-1 py-2 rounded-lg border text-sm font-medium transition-all duration-200"
                        :class="user.gender === 'female'
                          ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                          : 'border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                        @click="user.gender = 'female'"
                      >
                        {{ $t('common.female') }}
                      </button>
                    </div>
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs text-[var(--text-muted)]">
                      {{ $t('fengshuiOrnament.birthLabel') }}
                    </label>
                    <div class="grid grid-cols-4 gap-2">
                      <UInput
                        v-model.number="user.birthYear"
                        type="number"
                        :min="1900"
                        :max="2100"
                        :placeholder="$t('fengshuiOrnament.birthYearPlaceholder')"
                        :ui="inputUi"
                      />
                      <UInput
                        v-model.number="user.birthMonth"
                        type="number"
                        :min="1"
                        :max="12"
                        :placeholder="$t('fengshuiOrnament.birthMonthPlaceholder')"
                        :ui="inputUi"
                      />
                      <UInput
                        v-model.number="user.birthDay"
                        type="number"
                        :min="1"
                        :max="31"
                        :placeholder="$t('fengshuiOrnament.birthDayPlaceholder')"
                        :ui="inputUi"
                      />
                      <UInput
                        v-model.number="user.birthHour"
                        type="number"
                        :min="0"
                        :max="23"
                        :placeholder="$t('fengshuiOrnament.birthHourPlaceholder')"
                        :ui="inputUi"
                      />
                    </div>
                    <p class="text-[11px] text-[var(--text-faint)]">
                      {{ $t('fengshuiOrnament.birthHint') }}
                    </p>
                  </div>
                </div>
              </div>
              <UButton
                v-if="form.users.length < 6"
                color="neutral"
                variant="soft"
                size="sm"
                class="mt-3"
                @click="addUser"
              >
                <template #leading>
                  <UIcon name="i-heroicons-plus" class="w-4 h-4" />
                </template>
                {{ $t('fengshuiOrnament.addUser') }}
              </UButton>
              <p class="text-[11px] text-[var(--text-faint)] mt-1.5">
                {{ $t('fengshuiOrnament.usersHint') }}
              </p>
            </div>

            <!-- 计算按钮 -->
            <UButton
              color="warning"
              size="lg"
              block
              :disabled="!canSubmit"
              class="mt-2 shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
              @click="handleSubmit"
            >
              <template #leading>
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
              </template>
              {{ $t('fengshuiOrnament.submitBtn') }}
            </UButton>
          </div>
        </div>

        <!-- 知识卡片 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-square-3-stack-3d" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('fengshuiOrnament.knowledgeCard1Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('fengshuiOrnament.knowledgeCard1Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('fengshuiOrnament.knowledgeCard2Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('fengshuiOrnament.knowledgeCard2Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-user-group" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('fengshuiOrnament.knowledgeCard3Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('fengshuiOrnament.knowledgeCard3Desc') }}</p>
          </div>
          <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-heroicons-gift" class="w-4 h-4 text-[var(--accent-muted)]" />
              <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('fengshuiOrnament.knowledgeCard4Title') }}</h4>
            </div>
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('fengshuiOrnament.knowledgeCard4Desc') }}</p>
          </div>
        </div>
      </div>

      <!-- ============ 阶段 2：动画 ============ -->
      <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
              <UIcon name="i-heroicons-compass" class="w-8 h-8 text-[var(--accent)] animate-pulse" />
            </div>
            <div class="absolute inset-0 rounded-2xl bg-[var(--accent)]/10 animate-ping" />
          </div>
          <p class="text-sm text-[var(--text-muted)]">{{ $t('fengshuiOrnament.calculating') }}</p>
        </div>
      </div>

      <!-- ============ 阶段 3：结果 ============ -->
      <div v-if="phase === 'result' && calcResult">
        <div ref="resultRef">
          <!-- Section 标题 -->
          <div class="mb-8">
            <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
              {{ $t('fengshuiOrnament.resultTitle') }}
            </h1>
            <p class="text-sm text-[var(--text-faint)] mt-2">
              {{ calcResult.xuankong.sittingLabel }}{{ calcResult.xuankong.facingLabel }} · {{ calcResult.xuankong.period.name }}
              ｜{{ calcResult.liunian.ganzhiYear }}{{ $t('fengshuiOrnament.liunianSuffix') }}
            </p>
            <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
          </div>

          <!-- 格局判断 -->
          <div v-if="calcResult.xuankong.pattern" class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
              <UIcon name="i-heroicons-chart-pie" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('fengshuiOrnament.patternLabel') }}
            </h3>
            <p class="text-base font-bold text-[var(--accent)]">
              {{ t(`xuankong.patterns.${calcResult.xuankong.pattern.key}`) }}
            </p>
            <p class="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
              {{ t(`xuankong.patternDescriptions.${calcResult.xuankong.pattern.key}`) }}
            </p>
          </div>

          <!-- 八方位判定盘 -->
          <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <UIcon name="i-heroicons-table-cells" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ $t('fengshuiOrnament.palaceChartTitle') }}
            </h3>
            <p class="text-[11px] text-[var(--text-faint)] mb-4">{{ calcResult.roomGeometry.sectorNote }}</p>
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="cell in gridCells"
                :key="cell.direction"
                class="relative rounded-xl border p-3 min-h-[104px] flex flex-col justify-between"
                :class="cellClass(cell)"
              >
                <div class="flex items-start justify-between">
                  <span class="text-[10px] text-[var(--text-faint)]">{{ directionLabel(cell.direction) }}</span>
                  <div class="flex gap-1">
                    <span v-if="cell.isDoor" class="text-[9px] px-1 rounded bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent-border)]">{{ $t('fengshuiOrnament.flagDoor') }}</span>
                    <span v-if="cell.hasIrregularCorner" class="text-[9px] px-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{{ $t('fengshuiOrnament.flagIrregular') }}</span>
                  </div>
                </div>
                <div class="flex items-center justify-center gap-1 py-1 text-[var(--text-primary)]">
                  <span class="text-sm font-bold">{{ cell.mountainStar }}</span>
                  <span class="text-[10px] text-[var(--text-faint)]">/</span>
                  <span class="text-sm font-bold">{{ cell.facingStar }}</span>
                  <span class="text-[10px] text-[var(--text-faint)]">/</span>
                  <span class="text-xs text-[var(--text-muted)]">{{ cell.yearStar }}</span>
                </div>
                <div class="flex flex-wrap gap-1 justify-center">
                  <span v-if="cell.isTaiSui" class="text-[9px] px-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">{{ $t('fengshuiOrnament.shaTaiSui') }}</span>
                  <span v-if="cell.isWuHuang" class="text-[9px] px-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">{{ $t('fengshuiOrnament.shaWuHuang') }}</span>
                  <span v-if="cell.isSanSha" class="text-[9px] px-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">{{ $t('fengshuiOrnament.shaSanSha') }}</span>
                  <span v-if="cell.isAnJianSha" class="text-[9px] px-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">{{ $t('fengshuiOrnament.shaAnJian') }}</span>
                  <span class="text-[9px] px-1 rounded border" :class="gapBadgeClass(cell.elementGap)">
                    {{ t(`fengshuiOrnament.gapTypes.${cell.elementGap}`) }}
                  </span>
                </div>
              </div>
            </div>
            <p class="text-[10px] text-[var(--text-faint)] mt-3">{{ $t('fengshuiOrnament.chartLegend') }}</p>
          </div>

          <!-- 逐人游星层 -->
          <div
            v-for="person in calcResult.perPerson"
            :key="person.nickname"
            class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5"
          >
            <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <UIcon name="i-heroicons-user" class="w-4 h-4 text-[var(--accent-muted)]" />
              {{ person.nickname }} · {{ person.mingGua }}{{ $t('fengshuiOrnament.mingGuaSuffix') }}（{{ person.dongSiMing }}）
            </h3>
            <p class="text-[11px] text-[var(--text-faint)] mb-4">
              {{ $t('fengshuiOrnament.roomFacingNote', { direction: directionLabel(person.roomFacingStar.direction), star: person.roomFacingStar.star }) }}
            </p>
            <div class="grid grid-cols-4 gap-2 mb-4">
              <div
                v-for="dir in eightDirections"
                :key="dir"
                class="rounded-lg border p-2 text-center"
                :class="isAuspiciousYouxing(person.baguaAssignment[dir])
                  ? 'border-[var(--accent-border)] bg-[var(--accent-bg)]/30'
                  : 'border-[var(--border-light)] bg-[var(--surface-input)]'"
              >
                <div class="text-[10px] text-[var(--text-faint)]">{{ directionLabel(dir) }}</div>
                <div class="text-xs font-semibold mt-0.5" :class="isAuspiciousYouxing(person.baguaAssignment[dir]) ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'">
                  {{ person.baguaAssignment[dir] ? t(`fengshuiOrnament.youxing.${person.baguaAssignment[dir]}`) : '—' }}
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 text-xs">
              <span
                v-if="person.wenchangDirection"
                class="px-2 py-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)]/40 text-[var(--accent)]"
              >
                {{ $t('fengshuiOrnament.posWenchang') }}：{{ directionLabel(person.wenchangDirection) }}
              </span>
              <span
                v-if="person.taohuaDirection"
                class="px-2 py-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)]/40 text-[var(--accent)]"
              >
                {{ $t('fengshuiOrnament.posTaohua') }}：{{ directionLabel(person.taohuaDirection) }}
              </span>
              <span
                v-for="dir in person.guirenDirections"
                :key="dir"
                class="px-2 py-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)]/40 text-[var(--accent)]"
              >
                {{ $t('fengshuiOrnament.posGuiren') }}：{{ directionLabel(dir) }}
              </span>
            </div>
          </div>
        </div>

        <!-- AI 解读 -->
        <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
          <!-- 标题区 -->
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('fengshuiOrnament.interpretation') }}</h3>
            </div>
            <div v-if="aiStreaming" class="flex items-center gap-1.5">
              <span class="text-xs text-[var(--accent-muted)]">{{ $t('fengshuiOrnament.interpreting') }}</span>
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
              </span>
            </div>
          </div>

          <!-- 结构化展示 -->
          <div v-if="aiSections.length > 0" class="space-y-3">
            <div
              v-for="(section, index) in aiSections"
              :key="section.title + index"
              class="group relative rounded-xl border border-[var(--border-light)] overflow-hidden"
              :style="{ background: 'linear-gradient(to bottom right, var(--card-gradient-from), transparent)' }"
            >
              <div class="relative z-10 p-4">
                <h4 class="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  {{ section.title.replace(/^##\s*/, '') }}
                </h4>
                <div class="ai-section-content" v-html="renderMarkdown(section.content)" />
                <span
                  v-if="aiStreaming && index === aiSections.length - 1"
                  class="inline-block w-[2px] h-5 bg-[var(--accent)] ml-0.5 align-middle animate-pulse mt-1"
                />
              </div>
            </div>
          </div>

          <!-- 加载中 -->
          <div v-else-if="aiStreaming" class="flex items-center justify-center py-10">
            <div class="flex flex-col items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-[var(--accent)] animate-pulse" />
              </div>
              <p class="text-xs text-[var(--text-muted)]">{{ $t('fengshuiOrnament.generatingInterpretation') }}</p>
            </div>
          </div>

          <!-- 错误 -->
          <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
              <p class="text-sm text-red-400">{{ aiError }}</p>
            </div>
          </div>

          <!-- 免责声明 -->
          <div v-if="!aiStreaming && aiContent" class="mt-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card-hover)] px-4 py-3">
            <p class="text-xs text-[var(--text-faint)] leading-relaxed">
              {{ $t('fengshuiOrnament.disclaimer') }}
            </p>
          </div>

          <!-- 重新解读 -->
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
              {{ $t('fengshuiOrnament.reinterpret') }}
            </UButton>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3 justify-center mt-10 flex-wrap">
          <AppShareButton
            tool="fengshui-ornament"
            :summary="`${calcResult.xuankong.sittingLabel}${calcResult.xuankong.facingLabel} · ${calcResult.xuankong.period.name}`"
            :share-target="resultRef"
            :filename="`fengshui-ornament-${new Date().toISOString().slice(0, 10)}.png`"
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
            {{ $t('fengshuiOrnament.recalculate') }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-[var(--surface-card-hover)]"
            @click="() => { navigateTo('/fengshui') }"
          >
            <template #leading>
              <UIcon name="i-heroicons-cube" class="w-4 h-4" />
            </template>
            {{ $t('fengshuiOrnament.backToTopic') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { Direction } from '~/utils/bazhai'
import type { ElementGap } from '~/utils/ornament-rules'

type YouXingKey = 'shengqi' | 'tianyi' | 'yannian' | 'fuwei' | 'wugui' | 'liusha' | 'huohai' | 'jueming'

interface EnvironmentPalace {
  direction: Direction | '中宫'
  mountainStar: number
  facingStar: number
  periodStar: number
  yearStar: number
  isTaiSui: boolean
  isWuHuang: boolean
  isSanSha: boolean
  isAnJianSha: boolean
  isDoor: boolean
  hasIrregularCorner: boolean
  elementGap: ElementGap
  gapReasons: string[]
}

interface PerPersonResult {
  nickname: string
  gender: 'male' | 'female'
  mingGua: string
  mingGuaNumber: number
  dongSiMing: string
  dayGan: string
  yearZhi: string
  baguaAssignment: Partial<Record<Direction, YouXingKey>>
  roomFacingStar: { direction: Direction; star: string; auspicious: boolean }
  matchedPositions: { wenchang: boolean; taohua: boolean; guiren: boolean }
  wenchangDirection: Direction | null
  taohuaDirection: Direction | null
  guirenDirections: Direction[]
}

interface CalcResult {
  roomType: string
  direction: number
  year: number
  roomGeometry: {
    lengthM: number
    widthM: number
    doorDirection: Direction
    sectorNote: string
    irregular?: Array<{ direction: Direction; type: 'missing' | 'protruding' }>
  }
  xuankong: {
    period: { number: number; name: string; startYear: number; endYear: number }
    sittingLabel: string
    facingLabel: string
    pattern: { key: string; name: string; description: string } | null
    warning: string | null
  }
  liunian: {
    ganzhiYear: string
    yearCenter: number
    taiSuiDirection: Direction
    suiPoDirection: Direction
    sanShaDirection: Direction
  }
  environment: { palaces: EnvironmentPalace[] }
  perPerson: PerPersonResult[]
  locale: string
}

interface UserForm {
  nickname: string
  birthYear: number | undefined
  birthMonth: number | undefined
  birthDay: number | undefined
  birthHour: number | undefined
  gender: 'male' | 'female'
}

const { t, locale } = useI18n()
const phase = ref<'form' | 'animating' | 'result'>('form')
const calcResult = ref<CalcResult | null>(null)
const resultRef = ref<HTMLDivElement>()
const toast = useToast()

const eightDirections: Direction[] = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']

const DIR_TO_SPOT: Record<Direction, string> = {
  北: 'n', 东北: 'ne', 东: 'e', 东南: 'se', 南: 's', 西南: 'sw', 西: 'w', 西北: 'nw',
}
const SPOT_TO_DIR: Record<string, Direction> = {
  n: '北', ne: '东北', e: '东', se: '东南', s: '南', sw: '西南', w: '西', nw: '西北',
}

function emptyUser(): UserForm {
  return {
    nickname: '',
    birthYear: undefined,
    birthMonth: undefined,
    birthDay: undefined,
    birthHour: undefined,
    gender: 'male',
  }
}

const form = reactive({
  roomType: 'bedroom',
  direction: undefined as number | undefined,
  year: undefined as number | undefined,
  lengthM: undefined as number | undefined,
  widthM: undefined as number | undefined,
  doorDirection: '东南' as Direction,
  irregular: [] as Array<{ spot: string; type: 'missing' | 'protruding' }>,
  users: [emptyUser()] as UserForm[],
})

// ---- 本地持久化（本工具独立命名空间，不与其他工具互通）----
const STORAGE_KEY = 'fengshui-ornament-form'

onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (saved && typeof saved === 'object') {
      if (typeof saved.roomType === 'string') form.roomType = saved.roomType
      if (typeof saved.direction === 'number') form.direction = saved.direction
      if (typeof saved.year === 'number') form.year = saved.year
      if (typeof saved.lengthM === 'number') form.lengthM = saved.lengthM
      if (typeof saved.widthM === 'number') form.widthM = saved.widthM
      if (typeof saved.doorDirection === 'string' && eightDirections.includes(saved.doorDirection)) {
        form.doorDirection = saved.doorDirection
      }
      if (Array.isArray(saved.irregular)) form.irregular = saved.irregular
      if (Array.isArray(saved.users) && saved.users.length > 0) {
        form.users = saved.users.map((u: Partial<UserForm>) => ({ ...emptyUser(), ...u }))
      }
    }
  } catch {
    // 本地存储损坏时忽略，使用默认表单
  }
})

watch(form, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  } catch {
    // 存储失败不影响使用
  }
}, { deep: true })

function addUser() {
  if (form.users.length < 6) form.users.push(emptyUser())
}

function irregularType(dir: Direction): 'missing' | 'protruding' | null {
  return form.irregular.find(r => r.spot === DIR_TO_SPOT[dir])?.type ?? null
}

function toggleIrregular(dir: Direction, type: 'missing' | 'protruding') {
  const spot = DIR_TO_SPOT[dir]
  const idx = form.irregular.findIndex(r => r.spot === spot)
  if (idx >= 0 && form.irregular[idx]!.type === type) {
    form.irregular.splice(idx, 1)
  } else if (idx >= 0) {
    form.irregular[idx]!.type = type
  } else {
    form.irregular.push({ spot, type })
  }
}

const canSubmit = computed(() => {
  const baseOk = form.direction !== undefined && form.direction >= 0 && form.direction <= 360
    && form.year !== undefined && form.year >= 1900 && form.year <= 2100
    && form.lengthM !== undefined && form.lengthM > 0
    && form.widthM !== undefined && form.widthM > 0
  if (!baseOk) return false
  return form.users.every(u =>
    u.birthYear !== undefined && u.birthYear >= 1900 && u.birthYear <= 2100
    && u.birthMonth !== undefined && u.birthMonth >= 1 && u.birthMonth <= 12
    && u.birthDay !== undefined && u.birthDay >= 1 && u.birthDay <= 31)
})

async function handleSubmit() {
  if (!canSubmit.value) return

  phase.value = 'animating'
  calcResult.value = null
  aiContent.value = ''
  aiStreaming.value = false
  aiStarted.value = false
  aiError.value = null

  try {
    const result = await $fetch<CalcResult>('/api/tools/fengshui-ornament/calc', {
      method: 'POST',
      body: {
        roomType: form.roomType,
        direction: form.direction,
        year: form.year,
        lengthM: form.lengthM,
        widthM: form.widthM,
        doorDirection: form.doorDirection,
        irregular: form.irregular,
        users: form.users.map((u, idx) => ({
          nickname: u.nickname.trim() || `${t('fengshuiOrnament.defaultNickname')}${idx + 1}`,
          birthYear: u.birthYear,
          birthMonth: u.birthMonth,
          birthDay: u.birthDay,
          birthHour: u.birthHour ?? null,
          gender: u.gender,
        })),
        locale: locale.value,
      },
    })

    calcResult.value = result
    phase.value = 'result'

    setTimeout(() => startAiStream(), 300)
  } catch (err: any) {
    phase.value = 'form'
    toast.add({
      title: t('fengshuiOrnament.calcFail'),
      description: err.data?.message || err.message || t('fengshuiOrnament.checkInput'),
      color: 'error',
    })
  }
}

// AI 解读状态
const aiContent = ref('')
const aiStreaming = ref(false)
const aiStarted = ref(false)
const aiError = ref<string | null>(null)

async function startAiStream() {
  if (!calcResult.value) return

  aiContent.value = ''
  aiStreaming.value = true
  aiStarted.value = false
  aiError.value = null

  await nextTick()

  try {
    const response = await fetch('/api/tools/fengshui-ornament/reading', {
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
          } else if (data.type === 'error') {
            aiError.value = data.message || t('fengshuiOrnament.aiUnavailable')
          }
        } catch {
          // ignore
        }
      }
    }
  } catch (e: any) {
    aiError.value = e?.message || t('fengshuiOrnament.aiUnavailable')
  } finally {
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

// 九宫格按上南下北排列：东南 南 西南 / 东 中宫 西 / 东北 北 西北
const gridCells = computed(() => {
  if (!calcResult.value) return []
  const order = ['东南', '南', '西南', '东', '中宫', '西', '东北', '北', '西北']
  return order
    .map(dir => calcResult.value!.environment.palaces.find(p => p.direction === dir))
    .filter((p): p is EnvironmentPalace => Boolean(p))
})

function directionKey(dir: string): string {
  const map: Record<string, string> = {
    北: 'n', 东北: 'ne', 东: 'e', 东南: 'se', 南: 's', 西南: 'sw', 西: 'w', 西北: 'nw', 中宫: 'center',
  }
  return map[dir] || 'center'
}

function directionLabel(dir: string): string {
  return t(`fengshuiOrnament.directions.${directionKey(dir)}`)
}

function cellClass(cell: EnvironmentPalace) {
  if (cell.isTaiSui || cell.isWuHuang || cell.isSanSha || cell.isAnJianSha) {
    return 'border-red-500/20 bg-red-500/[0.04]'
  }
  if (cell.elementGap !== 'neutral' && cell.elementGap !== 'avoid_only') {
    return 'border-[var(--accent-border)] bg-[var(--accent-bg)]/40'
  }
  return 'border-[var(--border-light)] bg-[var(--surface-card)]'
}

function gapBadgeClass(gap: ElementGap) {
  if (gap === 'avoid_only') return 'bg-red-500/10 text-red-400 border-red-500/20'
  if (gap === 'neutral') return 'bg-[var(--surface-card-hover)] text-[var(--text-faint)] border-[var(--border-light)]'
  return 'bg-[var(--accent-bg)] text-[var(--accent)] border-[var(--accent-border)]'
}

const AUSPICIOUS_YOUXING: YouXingKey[] = ['shengqi', 'tianyi', 'yannian', 'fuwei']

function isAuspiciousYouxing(key: YouXingKey | undefined): boolean {
  return key !== undefined && AUSPICIOUS_YOUXING.includes(key)
}

// AI 内容分段
const aiSections = computed(() => {
  if (!aiContent.value) return []
  const rawSections = aiContent.value.split(/\n(?=##\s)/)
  const result: { title: string; content: string }[] = []
  for (const raw of rawSections) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lines = trimmed.split('\n')
    const titleLine = (lines[0] ?? '').replace(/^##\s*/, '').trim()
    const content = lines.slice(1).join('\n').trim()
    if (titleLine || content) {
      result.push({ title: titleLine || t('fengshuiOrnament.interpretation'), content })
    }
  }
  return result
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}

// UI Config
const inputUi = {
  base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
}

// SEO
const config = useRuntimeConfig()
const siteName = config.public.siteName as string
const siteUrl = (config.public.siteUrl as string) || 'https://www.ososn.com'

useSeoMeta({
  title: () => `${t('seo.fengshuiOrnamentTitle')} - ${siteName}`,
  description: t('seo.fengshuiOrnamentDesc'),
  keywords: t('seo.fengshuiOrnamentKeywords'),
  ogTitle: () => `${t('seo.fengshuiOrnamentOgTitle')} - ${siteName}`,
  ogDescription: t('seo.fengshuiOrnamentOgDesc'),
  ogImage: `${siteUrl}/og-image.png`,
  ogType: 'website',
  ogUrl: `${siteUrl}/tools/fengshui-ornament`,
  twitterCard: 'summary_large_image',
})

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${t('seo.fengshuiOrnamentTitle')} - ${siteName}`,
        url: `${siteUrl}/tools/fengshui-ornament`,
        description: t('seo.fengshuiOrnamentDesc'),
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: t('fengshuiOrnament.title'),
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Any',
          url: `${siteUrl}/tools/fengshui-ornament`,
          description: t('seo.fengshuiOrnamentOgDesc'),
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
.ai-section-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}
.ai-section-content :deep(th),
.ai-section-content :deep(td) {
  border: 1px solid var(--border-light);
  padding: 0.3rem 0.5rem;
  text-align: left;
  color: var(--text-body);
}
.ai-section-content :deep(th) {
  color: var(--text-primary);
  font-weight: 600;
  background: var(--surface-card-hover);
}
</style>
