export type FilterId =
  | 'ascii'
  | 'dots'
  | 'voxel'
  | 'ancient'
  | 'terminal'
  | 'arcade'
  | 'bit16'
  | 'glitch'
  | 'static'
  | 'prism'
  | 'acid'
  | 'phantom'
  | 'ink'
  | 'crystal'

export type ExportMode = 'filter' | 'achievement' | 'both'

export interface FilterDef {
  id: FilterId
  /** i18n key suffix under achievementGenerator.filters.<id> */
  nameKey: string
  descKey: string
  icon: string
}

export interface AchievementCategory {
  id: string
  /** i18n key suffix under achievementGenerator.categories.<id> */
  nameKey: string
  icon: string
  /** i18n key suffixes for the 4 achievements under achievementGenerator.items.<id>.0..3 */
  itemKeys: string[]
}

export interface FilterParams {
  /** 字符/单元密度 — grid columns (ASCII/terminal/ancient/dots/arcade/bit16) or sample step */
  density: number
  /** 字符/像素尺寸 — glyph font size or block size in px */
  charSize: number
  /** 滤镜不透明度 0..1 */
  opacity: number
  /** 原图保留强度 0..1 — how much of the source image stays visible beneath the filter */
  original: number
}

export const DEFAULT_PARAMS: FilterParams = {
  density: 100,
  charSize: 12,
  opacity: 0.72,
  original: 0.1,
}

export const FILTERS: FilterDef[] = [
  { id: 'ascii', nameKey: 'achievementGenerator.filters.ascii.name', descKey: 'achievementGenerator.filters.ascii.desc', icon: 'i-heroicons-code-bracket' },
  { id: 'dots', nameKey: 'achievementGenerator.filters.dots.name', descKey: 'achievementGenerator.filters.dots.desc', icon: 'i-heroicons-ellipsis-horizontal' },
  { id: 'voxel', nameKey: 'achievementGenerator.filters.voxel.name', descKey: 'achievementGenerator.filters.voxel.desc', icon: 'i-heroicons-cube' },
  { id: 'ancient', nameKey: 'achievementGenerator.filters.ancient.name', descKey: 'achievementGenerator.filters.ancient.desc', icon: 'i-heroicons-book-open' },
  { id: 'terminal', nameKey: 'achievementGenerator.filters.terminal.name', descKey: 'achievementGenerator.filters.terminal.desc', icon: 'i-heroicons-command-line' },
  { id: 'arcade', nameKey: 'achievementGenerator.filters.arcade.name', descKey: 'achievementGenerator.filters.arcade.desc', icon: 'i-heroicons-puzzle-piece' },
  { id: 'bit16', nameKey: 'achievementGenerator.filters.bit16.name', descKey: 'achievementGenerator.filters.bit16.desc', icon: 'i-heroicons-squares-2x2' },
  { id: 'glitch', nameKey: 'achievementGenerator.filters.glitch.name', descKey: 'achievementGenerator.filters.glitch.desc', icon: 'i-heroicons-bolt' },
  { id: 'static', nameKey: 'achievementGenerator.filters.static.name', descKey: 'achievementGenerator.filters.static.desc', icon: 'i-heroicons-signal-slash' },
  { id: 'prism', nameKey: 'achievementGenerator.filters.prism.name', descKey: 'achievementGenerator.filters.prism.desc', icon: 'i-heroicons-sun' },
  { id: 'acid', nameKey: 'achievementGenerator.filters.acid.name', descKey: 'achievementGenerator.filters.acid.desc', icon: 'i-heroicons-cloud' },
  { id: 'phantom', nameKey: 'achievementGenerator.filters.phantom.name', descKey: 'achievementGenerator.filters.phantom.desc', icon: 'i-heroicons-eye-slash' },
  { id: 'ink', nameKey: 'achievementGenerator.filters.ink.name', descKey: 'achievementGenerator.filters.ink.desc', icon: 'i-heroicons-paint-brush' },
  { id: 'crystal', nameKey: 'achievementGenerator.filters.crystal.name', descKey: 'achievementGenerator.filters.crystal.desc', icon: 'i-heroicons-sparkles' },
]

export const CATEGORIES: AchievementCategory[] = [
  { id: 'career', nameKey: 'achievementGenerator.categories.career', icon: 'i-heroicons-briefcase', itemKeys: ['0', '1', '2', '3'] },
  { id: 'wealth', nameKey: 'achievementGenerator.categories.wealth', icon: 'i-heroicons-banknotes', itemKeys: ['0', '1', '2', '3'] },
  { id: 'love', nameKey: 'achievementGenerator.categories.love', icon: 'i-heroicons-heart', itemKeys: ['0', '1', '2', '3'] },
  { id: 'health', nameKey: 'achievementGenerator.categories.health', icon: 'i-heroicons-heart', itemKeys: ['0', '1', '2', '3'] },
  { id: 'study', nameKey: 'achievementGenerator.categories.study', icon: 'i-heroicons-academic-cap', itemKeys: ['0', '1', '2', '3'] },
  { id: 'social', nameKey: 'achievementGenerator.categories.social', icon: 'i-heroicons-user-group', itemKeys: ['0', '1', '2', '3'] },
  { id: 'growth', nameKey: 'achievementGenerator.categories.growth', icon: 'i-heroicons-arrow-trending-up', itemKeys: ['0', '1', '2', '3'] },
  { id: 'life', nameKey: 'achievementGenerator.categories.life', icon: 'i-heroicons-home-modern', itemKeys: ['0', '1', '2', '3'] },
  { id: 'fun', nameKey: 'achievementGenerator.categories.fun', icon: 'i-heroicons-face-smile', itemKeys: ['0', '1', '2', '3'] },
]
