import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'

export interface FavoriteName {
  id: string
  fullName: string
  givenName: string
  pinyin: string
  score: number
  scoreGrade: string
  surname: string
  gender: 'male' | 'female' | 'neutral'
  birthDate: string // YYYY-MM-DD
  birthHour: number | null
  chartSnapshot: {
    pillars: { year: string; month: string; day: string; hour: string | null }
    riZhu: string
    riZhuStrength: string
    xiyong: string
    jishen: string
  }
  savedAt: number
}

export interface NamingHistoryItem {
  id: string
  surname: string
  gender: 'male' | 'female' | 'neutral'
  birthDate: string
  birthHour: number | null
  nameLength: number
  topName: string | null
  topScore: number | null
  createdAt: number
}

export const useBabyNamingStore = defineStore('babyNaming', {
  state: () => ({
    favorites: [] as FavoriteName[],
    history: [] as NamingHistoryItem[],
  }),

  getters: {
    isFavorite: (state) => (fullName: string) => state.favorites.some(f => f.fullName === fullName),
    favoriteCount: (state) => state.favorites.length,
  },

  actions: {
    addFavorite(data: Omit<FavoriteName, 'id' | 'savedAt'>) {
      if (this.favorites.some(f => f.fullName === data.fullName)) return
      this.favorites.unshift({ ...data, id: nanoid(), savedAt: Date.now() })
      this.trimFavorites()
    },
    removeFavorite(fullName: string) {
      this.favorites = this.favorites.filter(f => f.fullName !== fullName)
    },
    trimFavorites() {
      if (this.favorites.length > 30) {
        this.favorites = this.favorites.slice(0, 30)
      }
    },
    toggleFavorite(data: Omit<FavoriteName, 'id' | 'savedAt'>) {
      if (this.isFavorite(data.fullName)) {
        this.removeFavorite(data.fullName)
        return false
      }
      this.addFavorite(data)
      return true
    },
    addHistory(data: Omit<NamingHistoryItem, 'id' | 'createdAt'>) {
      this.history.unshift({ ...data, id: nanoid(), createdAt: Date.now() })
      // cookie 持久化容量有限，只保留最近 30 条
      if (this.history.length > 30) {
        this.history = this.history.slice(0, 30)
      }
    },
    clearHistory() {
      this.history = []
    },
  },

  persist: true,
})
