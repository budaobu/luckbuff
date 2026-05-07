import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'
import type { UserProfile } from '~/types/user'

export const useProfilesStore = defineStore('profiles', {
  state: () => ({
    list: [] as UserProfile[],
  }),

  getters: {
    defaultProfile: (state): UserProfile | null =>
      state.list.find(p => p.isDefault) ?? state.list[0] ?? null,
  },

  actions: {
    isLabelUnique(label: string, excludeId?: string): boolean {
      return !this.list.some(p => p.label === label && p.id !== excludeId)
    },
    add(data: Omit<UserProfile, 'id'>): { ok: boolean; error?: string } {
      if (!this.isLabelUnique(data.label)) {
        return { ok: false, error: '标签已存在，请使用其他名称' }
      }
      if (data.isDefault) this._clearDefault()
      this.list.push({ ...data, id: nanoid() })
      return { ok: true }
    },
    update(id: string, data: Partial<Omit<UserProfile, 'id'>>): { ok: boolean; error?: string } {
      const idx = this.list.findIndex(p => p.id === id)
      if (idx === -1) return { ok: false, error: '档案不存在' }
      if (data.label !== undefined && !this.isLabelUnique(data.label, id)) {
        return { ok: false, error: '标签已存在，请使用其他名称' }
      }
      if (data.isDefault) this._clearDefault()
      this.list[idx] = { ...this.list[idx], ...data }
      return { ok: true }
    },
    remove(id: string) {
      this.list = this.list.filter(p => p.id !== id)
      if (this.list.length > 0 && !this.list.some(p => p.isDefault)) {
        this.list[0].isDefault = true
      }
    },
    _clearDefault() {
      this.list.forEach(p => { p.isDefault = false })
    },
  },

  persist: true,
})
