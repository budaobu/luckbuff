export interface SavedReport {
  id: string
  tool: string
  toolPath: string
  title: string
  preview: string
  savedAt: number
  data: Record<string, unknown>
}

const STORAGE_KEY = 'ososn:my-reports'
const MAX_REPORTS = 50

export function useReports() {
  const reports = useState<SavedReport[]>('my-reports', () => [])
  const loaded = ref(false)

  function load() {
    if (loaded.value) return
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) reports.value = JSON.parse(raw)
    } catch {
      reports.value = []
    }
    loaded.value = true
  }

  function persist() {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.value))
  }

  function save(tool: string, toolPath: string, title: string, preview: string, data: Record<string, unknown>) {
    load()
    const report: SavedReport = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tool,
      toolPath,
      title,
      preview: preview.slice(0, 200),
      savedAt: Date.now(),
      data,
    }
    reports.value.unshift(report)
    if (reports.value.length > MAX_REPORTS) reports.value.length = MAX_REPORTS
    persist()
  }

  function remove(id: string) {
    load()
    reports.value = reports.value.filter(r => r.id !== id)
    persist()
  }

  function clearAll() {
    reports.value = []
    persist()
  }

  return { reports, load, save, remove, clearAll }
}
