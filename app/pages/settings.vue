<template>
  <div>
    <!-- 表单状态 -->
    <ProfileForm
      v-if="formMode"
      :profile="editingProfile"
      @cancel="closeForm"
      @submit="handleFormSubmit"
    />

    <!-- 列表状态 -->
    <div v-else class="relative min-h-screen overflow-hidden">
      <!-- 氛围背景光晕 -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-[#c9a227]/[0.05] blur-[120px]" />
        <div class="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] rounded-full bg-[#8b5cf6]/[0.04] blur-[100px]" />
      </div>

      <div class="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <!-- Section 标题 -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <span class="text-xs text-[#c9a227]/60 tracking-[0.2em] uppercase mb-2 block">Profiles</span>
            <h1 class="text-2xl md:text-3xl font-bold text-[#f5e6c0] tracking-tight">
              我的档案
            </h1>
            <p class="text-sm text-[#e8e0d0]/40 mt-2">
              管理生辰信息，推演时自动填入
            </p>
          </div>
          <UButton
            v-if="profiles.length > 0"
            color="warning"
            variant="soft"
            size="md"
            class="group/btn self-start"
            @click="openCreate"
          >
            <template #leading>
              <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            </template>
            新建档案
            <template #trailing>
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
            </template>
          </UButton>
        </div>

        <!-- 空状态 -->
        <div v-if="profiles.length === 0" class="text-center py-24">
          <div class="w-16 h-16 rounded-2xl bg-[#c9a227]/5 border border-[#c9a227]/10 flex items-center justify-center mx-auto mb-5">
            <UIcon name="i-heroicons-user-group" class="w-8 h-8 text-[#c9a227]/30" />
          </div>
          <h3 class="text-lg font-medium text-[#f5e6c0]/60 mb-2">还没有保存任何档案</h3>
          <p class="text-sm text-[#e8e0d0]/30 mb-6 max-w-sm mx-auto">
            创建第一份生辰档案，算命时自动填入，省去每次手动输入的麻烦
          </p>
          <UButton color="warning" variant="soft" size="md" @click="openCreate">
            <template #leading>
              <UIcon name="i-heroicons-plus" class="w-4 h-4" />
            </template>
            创建第一份档案
          </UButton>
        </div>

        <!-- 档案列表 -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ProfileCard
            v-for="profile in profiles"
            :key="profile.id"
            :profile="profile"
            @edit="handleEdit"
            @delete="handleDelete"
            @set-default="handleSetDefault"
          />
        </div>

        <!-- 提示 -->
        <div class="mt-12 text-center">
          <p class="text-xs text-[#e8e0d0]/20 inline-flex items-center gap-2">
            <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5" />
            所有数据仅存储在您的浏览器本地，不会上传服务器
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/types/user'
import { useProfilesStore } from '~/stores/profiles'

const store = useProfilesStore()
const { profiles } = useProfiles()

const formMode = ref<'create' | 'edit' | null>(null)
const editingProfile = ref<UserProfile | null>(null)

function openCreate() {
  editingProfile.value = null
  formMode.value = 'create'
}

function handleEdit(profile: UserProfile) {
  editingProfile.value = profile
  formMode.value = 'edit'
}

function closeForm() {
  formMode.value = null
  editingProfile.value = null
}

function handleDelete(id: string) {
  if (confirm('确定要删除这份档案吗？')) {
    store.remove(id)
  }
}

function handleSetDefault(id: string) {
  store.update(id, { isDefault: true })
}

function handleFormSubmit(data: Omit<UserProfile, 'id'>) {
  if (editingProfile.value) {
    const result = store.update(editingProfile.value.id, data)
    if (!result.ok) {
      alert(result.error)
      return
    }
  } else {
    const result = store.add(data)
    if (!result.ok) {
      alert(result.error)
      return
    }
  }
  closeForm()
}

useSeoMeta({
  title: '我的档案 - LuckBuff',
  description: '管理您的生辰档案，算命时快速选择',
})
</script>
