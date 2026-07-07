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
           <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Ziwei Compatibility</span>
           <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
             {{ $t('ziweiHunpan.title') }}
           </h1>
           <p class="text-sm text-[var(--text-faint)] mt-2">
             {{ $t('ziweiHunpan.subtitle') }}
           </p>
           <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
         </div>

         <!-- 顶部免责声明 -->
         <div class="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 mb-5">
           <p class="text-[11px] text-[var(--text-faint)] text-center leading-relaxed">
             {{ $t('ziweiHunpan.disclaimer') }}
           </p>
         </div>

         <!-- Person A -->
         <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden mb-5">
           <div class="px-5 py-3 border-b border-[var(--border-light)] bg-[var(--surface-card-hover)]">
             <div class="flex items-center gap-2">
               <div class="w-6 h-6 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                 <UIcon name="i-heroicons-user" class="w-3 h-3 text-[var(--accent)]" />
               </div>
               <span class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ziweiHunpan.personA') }}</span>
             </div>
           </div>
           <div class="p-5 space-y-4">
             <!-- Profile 快选 -->
             <div v-if="profiles.length > 0" class="space-y-2">
               <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('ziweiHunpan.selectProfile') }}</label>
               <div class="flex flex-wrap gap-2">
                 <button
                   v-for="profile in profiles"
                   :key="profile.id"
                   type="button"
                   class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
                   :class="selectedA === profile.id
                     ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                     : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                   @click="selectProfile(profile, 'A')"
                 >
                   <UIcon name="i-heroicons-user" class="w-3 h-3" />
                   {{ profile.label }}
                   <span v-if="profile.isDefault" class="text-[10px]">★</span>
                 </button>
               </div>
             </div>

             <!-- 性别 -->
             <div>
               <label class="block text-sm text-[var(--text-muted)] mb-2">
                 {{ $t('ziweiHunpan.genderLabel') }} <span class="text-[var(--accent)]">*</span>
               </label>
               <div class="flex gap-3">
                 <button
                   type="button"
                   class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                   :class="formA.gender === 'male'
                     ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                     : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                   @click="formA.gender = 'male'"
                 >
                   {{ $t('common.male') }}
                 </button>
                 <button
                   type="button"
                   class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                   :class="formA.gender === 'female'
                     ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                     : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                   @click="formA.gender = 'female'"
                 >
                   {{ $t('common.female') }}
                 </button>
               </div>
             </div>

             <!-- 出生日期 -->
             <div class="space-y-1.5">
               <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                 {{ $t('ziweiHunpan.birthDateLabel') }} <span class="text-[var(--accent)]">*</span>
               </label>
               <UPopover>
                 <UButton
                   color="neutral"
                   variant="outline"
                   class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                   :class="{ 'text-[var(--text-placeholder)]': !formA.birthDate }"
                 >
                   <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                   {{ formA.birthDate && calendarDateA ? df.format(calendarDateA.toDate(tz)) : $t('ziweiHunpan.birthDatePlaceholder') }}
                 </UButton>
                 <template #content>
                   <AppCalendar v-model="calendarDateA" color="warning" class="p-2" />
                 </template>
               </UPopover>
             </div>

             <!-- 出生时辰 -->
             <div>
               <label class="block text-sm text-[var(--text-muted)] mb-2">
                 {{ $t('ziweiHunpan.birthHourLabel') }}
               </label>
               <USelectMenu
                 v-model="formA.birthHour"
                 :items="shichenOptions"
                 value-key="dizhi"
                 :placeholder="$t('ziweiHunpan.birthHourPlaceholder')"
                 class="w-full"
                 :ui="selectUi"
               />
             </div>

             <!-- 姓名 -->
             <div>
               <label class="block text-sm text-[var(--text-muted)] mb-2">
                 {{ $t('ziweiHunpan.nameLabel') }}
               </label>
               <UInput v-model="formA.name" :placeholder="$t('ziweiHunpan.namePlaceholder')" class="w-full" :ui="inputUi" />
             </div>

             <!-- 出生地 -->
             <div>
               <label class="block text-sm text-[var(--text-muted)] mb-2">
                 {{ $t('ziweiHunpan.birthProvinceLabel') }}
               </label>
               <UInput v-model="formA.birthProvince" :placeholder="$t('ziweiHunpan.birthProvincePlaceholder')" class="w-full" :ui="inputUi" />
             </div>
           </div>
         </div>

         <!-- Person B -->
         <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm overflow-hidden mb-5">
           <div class="px-5 py-3 border-b border-[var(--border-light)] bg-[var(--surface-card-hover)]">
             <div class="flex items-center gap-2">
               <div class="w-6 h-6 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                 <UIcon name="i-heroicons-user" class="w-3 h-3 text-[var(--accent)]" />
               </div>
               <span class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ziweiHunpan.personB') }}</span>
             </div>
           </div>
           <div class="p-5 space-y-4">
             <!-- Profile 快选 -->
             <div v-if="profiles.length > 0" class="space-y-2">
               <label class="text-xs font-medium text-[var(--text-muted)]">{{ $t('ziweiHunpan.selectProfile') }}</label>
               <div class="flex flex-wrap gap-2">
                 <button
                   v-for="profile in profiles"
                   :key="profile.id"
                   type="button"
                   class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200"
                   :class="selectedB === profile.id
                     ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                     : 'border-[var(--border-light)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                   @click="selectProfile(profile, 'B')"
                 >
                   <UIcon name="i-heroicons-user" class="w-3 h-3" />
                   {{ profile.label }}
                   <span v-if="profile.isDefault" class="text-[10px]">★</span>
                 </button>
               </div>
             </div>

             <!-- 性别 -->
             <div>
               <label class="block text-sm text-[var(--text-muted)] mb-2">
                 {{ $t('ziweiHunpan.genderLabel') }} <span class="text-[var(--accent)]">*</span>
               </label>
               <div class="flex gap-3">
                 <button
                   type="button"
                   class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                   :class="formB.gender === 'male'
                     ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                     : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                   @click="formB.gender = 'male'"
                 >
                   {{ $t('common.male') }}
                 </button>
                 <button
                   type="button"
                   class="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                   :class="formB.gender === 'female'
                     ? 'border-[var(--accent-border-hover)] bg-[var(--accent-bg)] text-[var(--accent)]'
                     : 'border-[var(--border-light)] bg-[var(--surface-input)] text-[var(--text-muted)] hover:border-[var(--border-medium)]'"
                   @click="formB.gender = 'female'"
                 >
                   {{ $t('common.female') }}
                 </button>
               </div>
             </div>

             <!-- 出生日期 -->
             <div class="space-y-1.5">
               <label class="flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                 {{ $t('ziweiHunpan.birthDateLabel') }} <span class="text-[var(--accent)]">*</span>
               </label>
               <UPopover>
                 <UButton
                   color="neutral"
                   variant="outline"
                   class="w-full justify-start bg-[var(--surface-input)] border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]"
                   :class="{ 'text-[var(--text-placeholder)]': !formB.birthDate }"
                 >
                   <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2 text-[var(--text-faint)]" />
                   {{ formB.birthDate && calendarDateB ? df.format(calendarDateB.toDate(tz)) : $t('ziweiHunpan.birthDatePlaceholder') }}
                 </UButton>
                 <template #content>
                   <AppCalendar v-model="calendarDateB" color="warning" class="p-2" />
                 </template>
               </UPopover>
             </div>

             <!-- 出生时辰 -->
             <div>
               <label class="block text-sm text-[var(--text-muted)] mb-2">
                 {{ $t('ziweiHunpan.birthHourLabel') }}
               </label>
               <USelectMenu
                 v-model="formB.birthHour"
                 :items="shichenOptions"
                 value-key="dizhi"
                 :placeholder="$t('ziweiHunpan.birthHourPlaceholder')"
                 class="w-full"
                 :ui="selectUi"
               />
             </div>

             <!-- 姓名 -->
             <div>
               <label class="block text-sm text-[var(--text-muted)] mb-2">
                 {{ $t('ziweiHunpan.nameLabel') }}
               </label>
               <UInput v-model="formB.name" :placeholder="$t('ziweiHunpan.namePlaceholder')" class="w-full" :ui="inputUi" />
             </div>

             <!-- 出生地 -->
             <div>
               <label class="block text-sm text-[var(--text-muted)] mb-2">
                 {{ $t('ziweiHunpan.birthProvinceLabel') }}
               </label>
               <UInput v-model="formB.birthProvince" :placeholder="$t('ziweiHunpan.birthProvincePlaceholder')" class="w-full" :ui="inputUi" />
             </div>
           </div>
         </div>

         <!-- 合盘按钮 -->
         <UButton
           color="warning"
           size="lg"
           block
           :disabled="!canSubmit"
           class="shadow-lg shadow-[#c9a227]/10 hover:shadow-[#c9a227]/20 transition-all duration-300"
           @click="handleSubmit"
         >
           <template #leading>
             <UIcon name="i-heroicons-heart" class="w-5 h-5" />
           </template>
           {{ $t('ziweiHunpan.submitBtn') }}
         </UButton>

         <!-- 紫薇合盘知识卡片 -->
         <div class="mt-6 space-y-3">
           <div class="flex items-center gap-2 mb-2">
             <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-[var(--accent-muted)]" />
             <span class="text-xs font-medium text-[var(--text-muted)]">{{ $t('ziweiHunpan.knowledgeTitle') }}</span>
           </div>
           <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
               <div class="flex items-center gap-2 mb-2">
                 <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                   <UIcon name="i-heroicons-star" class="w-3.5 h-3.5 text-[var(--accent)]" />
                 </div>
                 <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ziweiHunpan.knowledgeCard1Title') }}</h4>
               </div>
               <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ziweiHunpan.knowledgeCard1Desc') }}</p>
             </div>
             <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
               <div class="flex items-center gap-2 mb-2">
                 <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                   <UIcon name="i-heroicons-heart" class="w-3.5 h-3.5 text-[var(--accent)]" />
                 </div>
                 <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ziweiHunpan.knowledgeCard2Title') }}</h4>
               </div>
               <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ziweiHunpan.knowledgeCard2Desc') }}</p>
             </div>
             <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
               <div class="flex items-center gap-2 mb-2">
                 <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                   <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5 text-[var(--accent)]" />
                 </div>
                 <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ziweiHunpan.knowledgeCard3Title') }}</h4>
               </div>
               <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ziweiHunpan.knowledgeCard3Desc') }}</p>
             </div>
             <div class="rounded-xl border border-[var(--border-light)] bg-[var(--surface-card)] p-4">
               <div class="flex items-center gap-2 mb-2">
                 <div class="w-7 h-7 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
                   <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-[var(--accent)]" />
                 </div>
                 <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ $t('ziweiHunpan.knowledgeCard4Title') }}</h4>
               </div>
               <p class="text-xs text-[var(--text-faint)] leading-relaxed">{{ $t('ziweiHunpan.knowledgeCard4Desc') }}</p>
             </div>
           </div>
         </div>
       </div>

       <!-- ============ 阶段 2：动画 ============ -->
       <div v-if="phase === 'animating'" class="flex flex-col items-center justify-center min-h-[60vh]">
         <ClientOnly>
           <div class="w-full h-[300px]">
             <ZwdsHunpanTransition />
           </div>
         </ClientOnly>
         <p class="text-sm text-[var(--text-muted)] mt-4">{{ $t('ziweiHunpan.calculating') }}</p>
       </div>

       <!-- ============ 阶段 3：结果 ============ -->
       <div v-if="phase === 'result' && chartA && chartB">
         <div ref="resultRef">
           <!-- Section 标题 -->
           <div class="mb-8">
             <span class="text-xs text-[var(--accent-muted)] tracking-[0.2em] uppercase mb-2 block">Result</span>
             <h1 class="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight font-serif">
               {{ $t('ziweiHunpan.resultTitle') }}
             </h1>
             <p class="text-sm text-[var(--text-faint)] mt-2">
               {{ formA.name || $t('ziweiHunpan.personA') }} · {{ formB.name || $t('ziweiHunpan.personB') }}
             </p>
             <div class="w-12 h-px bg-[var(--accent-border-hover)] mt-4" />
           </div>

           <!-- 两人命盘关键信息并排 -->
           <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
             <!-- Person A -->
             <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5">
               <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                 <UIcon name="i-heroicons-user" class="w-4 h-4 text-[var(--accent-muted)]" />
                 {{ formA.name || $t('ziweiHunpan.personA') }}
                 <span class="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)]">
                   {{ formA.gender === 'male' ? $t('common.male') : $t('common.female') }}
                 </span>
               </h3>
               <div class="space-y-2 text-sm">
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwds.mingGong') }}</span>
                   <span class="font-medium text-[var(--accent)]">{{ chartA.mingGong.zhi }} {{ chartA.mingGong.mainStars.join('、') || $t('zwds.borrowPalace') }}</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwds.shenGong') }}</span>
                   <span class="font-medium text-[var(--text-primary)]">{{ chartA.shenGong.zhi }} {{ chartA.shenGong.mainStars.join('、') || $t('zwds.borrowPalace') }}</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwds.wuxingBureau') }}</span>
                   <span class="font-medium text-[var(--text-primary)]">{{ chartA.wuxingJu }}{{ $t('zwds.juLabel') }}</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwdsAnalysis.fuqiGongLabel', '夫妻宫') }}</span>
                   <span class="font-medium text-[var(--text-primary)]">{{ formatGongInfo(chartA, '夫妻') }}</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwdsAnalysis.fudeGongLabel', '福德宫') }}</span>
                   <span class="font-medium text-[var(--text-primary)]">{{ formatGongInfo(chartA, '福德') }}</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwds.currentDaXian') }}</span>
                   <span class="font-medium text-[var(--text-primary)]">{{ formatDaXian(chartA.currentDaXian) }}</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwdsAnalysis.yearPillarLabel', '年柱') }}</span>
                   <span class="font-medium text-[var(--text-primary)]">{{ chartA.yearGan }}{{ chartA.yearZhi }}</span>
                 </div>
               </div>
             </div>

             <!-- Person B -->
             <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5">
               <h3 class="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                 <UIcon name="i-heroicons-user" class="w-4 h-4 text-[var(--accent-muted)]" />
                 {{ formB.name || $t('ziweiHunpan.personB') }}
                 <span class="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)]">
                   {{ formB.gender === 'male' ? $t('common.male') : $t('common.female') }}
                 </span>
               </h3>
               <div class="space-y-2 text-sm">
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwds.mingGong') }}</span>
                   <span class="font-medium text-[var(--accent)]">{{ chartB.mingGong.zhi }} {{ chartB.mingGong.mainStars.join('、') || $t('zwds.borrowPalace') }}</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwds.shenGong') }}</span>
                   <span class="font-medium text-[var(--text-primary)]">{{ chartB.shenGong.zhi }} {{ chartB.shenGong.mainStars.join('、') || $t('zwds.borrowPalace') }}</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwds.wuxingBureau') }}</span>
                   <span class="font-medium text-[var(--text-primary)]">{{ chartB.wuxingJu }}{{ $t('zwds.juLabel') }}</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwdsAnalysis.fuqiGongLabel', '夫妻宫') }}</span>
                   <span class="font-medium text-[var(--text-primary)]">{{ formatGongInfo(chartB, '夫妻') }}</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwdsAnalysis.fudeGongLabel', '福德宫') }}</span>
                   <span class="font-medium text-[var(--text-primary)]">{{ formatGongInfo(chartB, '福德') }}</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwds.currentDaXian') }}</span>
                   <span class="font-medium text-[var(--text-primary)]">{{ formatDaXian(chartB.currentDaXian) }}</span>
                 </div>
                 <div class="flex justify-between">
                   <span class="text-[var(--text-faint)]">{{ $t('zwdsAnalysis.yearPillarLabel', '年柱') }}</span>
                   <span class="font-medium text-[var(--text-primary)]">{{ chartB.yearGan }}{{ chartB.yearZhi }}</span>
                 </div>
               </div>
             </div>
           </div>
         </div>

         <!-- AI 合盘解读 -->
         <div class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm p-5 mb-5">
           <!-- 标题区 -->
           <div class="flex items-center gap-3 mb-4">
             <div class="w-10 h-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)]">
               <UIcon name="i-heroicons-sparkles" class="w-5 h-5" />
             </div>
             <div class="flex-1 min-w-0">
               <h3 class="text-base font-semibold text-[var(--text-primary)] tracking-wide">{{ $t('ziweiHunpan.interpretation') }}</h3>
             </div>
             <div v-if="aiStreaming" class="flex items-center gap-1.5">
               <span class="text-xs text-[var(--accent-muted)]">{{ $t('ziweiHunpan.interpreting') }}</span>
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
               :key="section.title"
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
               <p class="text-xs text-[var(--text-muted)]">{{ $t('ziweiHunpan.generatingInterpretation') }}</p>
             </div>
           </div>

           <!-- 错误 -->
           <div v-else-if="aiError" class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
             <div class="flex items-center gap-2">
               <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-red-400" />
               <p class="text-sm text-red-400">{{ aiError }}</p>
             </div>
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
               {{ $t('ziweiHunpan.reinterpret') }}
             </UButton>
           </div>
         </div>

         <!-- 底部操作 -->
         <div class="flex gap-3 justify-center mt-10 flex-wrap">
           <UButton
             color="warning"
             variant="soft"
             class="group/btn"
             @click="handleCopy"
           >
             <template #leading>
               <UIcon name="i-heroicons-clipboard-document" class="w-4 h-4" />
             </template>
             {{ $t('ziweiHunpan.copyResult') }}
           </UButton>
           <AppShareButton
             tool="ziwei-hunpan"
             :name="`${formA.name || $t('ziweiHunpan.personA')} & ${formB.name || $t('ziweiHunpan.personB')}`"
             :summary="`${formA.name || $t('ziweiHunpan.personA')} · ${formB.name || $t('ziweiHunpan.personB')} · ${chartA.mingGong.zhi}命 · ${chartB.mingGong.zhi}命`"
             :share-target="resultRef"
             :filename="`ziwei-hunpan-${new Date().toISOString().slice(0, 10)}.png`"
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
             {{ $t('ziweiHunpan.recalculate') }}
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
             {{ $t('ziweiHunpan.backToTools') }}
           </UButton>
         </div>
       </div>
     </div>
   </div>
 </template>

 <script setup lang="ts">
 import { marked } from 'marked'
 import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
 import { SHICHEN_OPTIONS } from '~/types/user'
 import type { UserProfile, DiZhi } from '~/types/user'
 import type { ZwdsChart, ZwdsDaXian } from '~/types/zwds'

 const { t, locale } = useI18n()
 const phase = ref<'form' | 'animating' | 'result'>('form')

 // Person A form
 const formA = reactive({
   name: '',
   gender: 'male' as 'male' | 'female',
   birthDate: '',
   birthHour: undefined as DiZhi | undefined,
   birthProvince: '',
 })

 // Person B form
 const formB = reactive({
   name: '',
   gender: 'female' as 'male' | 'female',
   birthDate: '',
   birthHour: undefined as DiZhi | undefined,
   birthProvince: '',
 })

 const chartA = ref<ZwdsChart | null>(null)
 const chartB = ref<ZwdsChart | null>(null)

 // Profile selection
 const { profiles, defaultProfile } = useProfiles()
 const selectedA = ref<string | null>(null)
 const selectedB = ref<string | null>(null)

 // Calendar pickers
 const tz = getLocalTimeZone()
 const df = computed(() => new DateFormatter(locale.value === 'en' ? 'en-US' : (locale.value === 'zh-TW' ? 'zh-TW' : 'zh-CN'), { dateStyle: 'long' }))
 const calendarDateA = ref<CalendarDate | undefined>(undefined)
 const calendarDateB = ref<CalendarDate | undefined>(undefined)

 watch(calendarDateA, () => {
   if (calendarDateA.value) {
     formA.birthDate = `${calendarDateA.value.year}-${String(calendarDateA.value.month).padStart(2, '0')}-${String(calendarDateA.value.day).padStart(2, '0')}`
   } else {
     formA.birthDate = ''
   }
 })

 watch(calendarDateB, () => {
   if (calendarDateB.value) {
     formB.birthDate = `${calendarDateB.value.year}-${String(calendarDateB.value.month).padStart(2, '0')}-${String(calendarDateB.value.day).padStart(2, '0')}`
   } else {
     formB.birthDate = ''
   }
 })

 function selectProfile(profile: UserProfile, target: 'A' | 'B') {
   if (target === 'A') {
     selectedA.value = profile.id
     formA.name = profile.name || profile.label || ''
     formA.gender = profile.gender
     formA.birthDate = profile.birthDate || ''
     formA.birthHour = profile.birthHour
     formA.birthProvince = profile.birthProvince || ''
     if (formA.birthDate) {
       try { calendarDateA.value = parseDate(formA.birthDate) } catch { calendarDateA.value = undefined }
     } else {
       calendarDateA.value = undefined
     }
   } else {
     selectedB.value = profile.id
     formB.name = profile.name || profile.label || ''
     formB.gender = profile.gender
     formB.birthDate = profile.birthDate || ''
     formB.birthHour = profile.birthHour
     formB.birthProvince = profile.birthProvince || ''
     if (formB.birthDate) {
       try { calendarDateB.value = parseDate(formB.birthDate) } catch { calendarDateB.value = undefined }
     } else {
       calendarDateB.value = undefined
     }
   }
 }

 onMounted(() => {
   // 如果有默认档案，填充给 A；如果有第二个档案，填充给 B
   if (defaultProfile.value && !formA.birthDate) {
     selectProfile(defaultProfile.value, 'A')
   }
   if (profiles.value.length > 1 && !formB.birthDate) {
     const second = profiles.value.find(p => p.id !== defaultProfile.value?.id)
     if (second) selectProfile(second, 'B')
   }
 })

 // AI 解读状态
 const aiContent = ref('')
 const aiStreaming = ref(false)
 const aiStarted = ref(false)
 const aiError = ref<string | null>(null)
 const resultRef = ref<HTMLDivElement>()

 const toast = useToast()
 const { calc } = useZwdsCalc()

 const canSubmit = computed(() => {
   return formA.birthDate.length > 0 && formB.birthDate.length > 0
 })

 const shichenOptions = [...SHICHEN_OPTIONS]

 function formatGongInfo(chart: ZwdsChart, name: string): string {
   const gong = chart.gongs.find(g => g.name === name)
   if (!gong) return t('common.unknown')
   const stars = gong.mainStars.join('、') || t('zwds.borrowPalace')
   return `${gong.zhi} ${stars}`
 }

 function formatDaXian(daXian: ZwdsDaXian | null): string {
   if (!daXian) return t('common.unknown')
   return `${daXian.gongName}宫 ${daXian.ageRange[0]}-${daXian.ageRange[1]}${t('zwds.ageSuffix')}`
 }

 async function handleSubmit() {
   if (!canSubmit.value) return

   const [yearA, monthA, dayA] = formA.birthDate.split('-').map(Number) as [number, number, number]
   const [yearB, monthB, dayB] = formB.birthDate.split('-').map(Number) as [number, number, number]

   const calculatedA = calc(yearA, monthA, dayA, formA.birthHour ?? null, formA.gender)
   const calculatedB = calc(yearB, monthB, dayB, formB.birthHour ?? null, formB.gender)

   phase.value = 'animating'
   chartA.value = null
   chartB.value = null
   aiContent.value = ''
   aiStreaming.value = false
   aiStarted.value = false
   aiError.value = null

   setTimeout(() => {
     chartA.value = calculatedA
     chartB.value = calculatedB
     phase.value = 'result'
     startAiStream()
   }, 1500)
 }

 async function startAiStream() {
   if (!chartA.value || !chartB.value) return

   aiContent.value = ''
   aiStreaming.value = true
   aiStarted.value = false
   aiError.value = null

   await nextTick()

   try {
     const response = await fetch('/api/tools/ziwei-hunpan/analyze', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         chartA: chartA.value,
         chartB: chartB.value,
         locale: locale.value,
         nameA: formA.name,
         nameB: formB.name,
         genderA: formA.gender,
         genderB: formB.gender,
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
             aiError.value = data.message || t('ziweiHunpan.aiUnavailable')
           }
         } catch {
           // ignore
         }
       }
     }
   } catch (e: any) {
     aiError.value = e?.message || t('ziweiHunpan.aiUnavailable')
   } finally {
     aiStreaming.value = false
   }
 }

 function resetForm() {
   phase.value = 'form'
   chartA.value = null
   chartB.value = null
   aiContent.value = ''
   aiStreaming.value = false
   aiStarted.value = false
   aiError.value = null
   selectedA.value = null
   selectedB.value = null
   calendarDateA.value = undefined
   calendarDateB.value = undefined
   formA.name = ''
   formA.gender = 'male'
   formA.birthDate = ''
   formA.birthHour = undefined
   formA.birthProvince = ''
   formB.name = ''
   formB.gender = 'female'
   formB.birthDate = ''
   formB.birthHour = undefined
   formB.birthProvince = ''
 }

 function handleCopy() {
   if (!chartA.value || !chartB.value) return
   const text = `${$t('ziweiHunpan.resultTitle')}

 ${formA.name || $t('ziweiHunpan.personA')}：
 ${$t('zwds.mingGong')}：${chartA.value.mingGong.zhi} ${chartA.value.mingGong.mainStars.join('、') || $t('zwds.borrowPalace')}
 ${$t('zwds.shenGong')}：${chartA.value.shenGong.zhi} ${chartA.value.shenGong.mainStars.join('、') || $t('zwds.borrowPalace')}
 ${$t('zwds.wuxingBureau')}：${chartA.value.wuxingJu}${$t('zwds.juLabel')}
 ${$t('zwdsAnalysis.yearPillarLabel', '年柱')}：${chartA.value.yearGan}${chartA.value.yearZhi}

 ${formB.name || $t('ziweiHunpan.personB')}：
 ${$t('zwds.mingGong')}：${chartB.value.mingGong.zhi} ${chartB.value.mingGong.mainStars.join('、') || $t('zwds.borrowPalace')}
 ${$t('zwds.shenGong')}：${chartB.value.shenGong.zhi} ${chartB.value.shenGong.mainStars.join('、') || $t('zwds.borrowPalace')}
 ${$t('zwds.wuxingBureau')}：${chartB.value.wuxingJu}${$t('zwds.juLabel')}
 ${$t('zwdsAnalysis.yearPillarLabel', '年柱')}：${chartB.value.yearGan}${chartB.value.yearZhi}

 ${aiContent.value ? '【' + $t('ziweiHunpan.interpretation') + '】\n' + aiContent.value : ''}
 `
   navigator.clipboard.writeText(text).then(() => {
     toast.add({ title: t('share.textCopied'), color: 'success' })
   }).catch(() => {
     toast.add({ title: t('share.copyFail'), color: 'error' })
   })
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
     const titleLine = lines[0]!.replace(/^##\s*/, '').trim()
     const content = lines.slice(1).join('\n').trim()
     if (titleLine || content) {
       result.push({ title: titleLine || t('ziweiHunpan.interpretation'), content })
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

 const selectUi = {
   base: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
   trigger: 'bg-[var(--surface-input)] ring-1 ring-inset ring-[var(--border-light)] focus:ring-[var(--accent-border-hover)] text-[var(--text-primary)]',
 }

 // SEO
 const siteName = 'ososn'

 useSeoMeta({
   title: () => `${t('seo.ziweiHunpanTitle')} - ${siteName}`,
   description: t('seo.ziweiHunpanDesc'),
   keywords: t('seo.ziweiHunpanKeywords'),
   ogTitle: () => `${t('seo.ziweiHunpanOgTitle')} - ${siteName}`,
   ogDescription: t('seo.ziweiHunpanOgDesc'),
   ogImage: 'https://www.ososn.com/og-image.png',
   ogType: 'website',
   ogUrl: 'https://www.ososn.com/tools/ziwei-hunpan',
   twitterCard: 'summary_large_image',
 })

 useHead(() => ({
   script: [
     {
       type: 'application/ld+json',
       innerHTML: JSON.stringify({
         '@context': 'https://schema.org',
         '@type': 'WebPage',
         name: `${t('seo.ziweiHunpanTitle')} - ${siteName}`,
         url: 'https://www.ososn.com/tools/ziwei-hunpan',
         description: t('seo.ziweiHunpanDesc'),
         mainEntity: {
           '@type': 'SoftwareApplication',
           name: t('ziweiHunpan.title'),
           applicationCategory: 'LifestyleApplication',
           operatingSystem: 'Any',
           url: 'https://www.ososn.com/tools/ziwei-hunpan',
           description: t('seo.ziweiHunpanOgDesc'),
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
