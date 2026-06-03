export function useGeolocation() {
  const { t } = useI18n()

  const location = reactive<{
    city?: string
    longitude?: number
    latitude?: number
    timezone?: string
    loading: boolean
    error: string | null
  }>({
    loading: false,
    error: null,
  })

  function detectTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai'
    } catch {
      return 'Asia/Shanghai'
    }
  }

  async function requestLocation() {
    location.loading = true
    location.error = null

    return new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) {
        location.error = t('geolocation.notSupported')
        location.loading = false
        resolve(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          location.longitude = pos.coords.longitude
          location.latitude = pos.coords.latitude
          location.timezone = detectTimezone()
          location.loading = false
          resolve(true)
        },
        (err) => {
          // 针对不同错误给出友好提示
          if (err.code === err.PERMISSION_DENIED) {
            location.error = t('geolocation.permissionDenied') || '定位权限被拒绝，请手动输入城市'
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            location.error = t('geolocation.positionUnavailable') || '无法获取位置，请手动输入城市'
          } else if (err.code === err.TIMEOUT) {
            location.error = t('geolocation.timeout') || '定位超时，请手动输入城市'
          } else {
            location.error = err.message || t('geolocation.getLocationFailed')
          }
          location.loading = false
          resolve(false)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
      )
    })
  }

  function setCity(city: string) {
    location.city = city
    location.timezone = detectTimezone()
  }

  // 根据城市名查询经纬度（使用 Open-Meteo Geocoding API，免费无需 API Key）
  // 注意：Open-Meteo 的 name 参数仅支持英文/拼音，不支持中文
  async function resolveCityCoords(city: string): Promise<{ longitude: number; latitude: number; timezone?: string } | null> {
    if (!city?.trim()) return null

    try {
      // Open-Meteo Geocoding API：免费、无需注册、返回 timezone
      // language=en 确保返回英文城市名用于搜索
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      const res = await fetch(url)
      if (!res.ok) return null

      const data = await res.json()
      if (data.results && data.results.length > 0) {
        const first = data.results[0]
        return {
          longitude: first.longitude,
          latitude: first.latitude,
          timezone: first.timezone,
        }
      }
    } catch {
      // Silently fail — user can still enter coordinates manually
    }
    return null
  }

  // Nominatim 备用（不返回时区）
  async function resolveCityCoordsFallback(city: string): Promise<{ longitude: number; latitude: number } | null> {
    if (!city?.trim()) return null

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&accept-language=zh`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'LuckBuff/1.0' },
      })
      if (!res.ok) return null

      const data = await res.json()
      if (data && data.length > 0) {
        return {
          longitude: parseFloat(data[0].lon),
          latitude: parseFloat(data[0].lat),
        }
      }
    } catch {
      // Silently fail — fallback already exhausted
    }
    return null
  }

  function clear() {
    location.city = undefined
    location.longitude = undefined
    location.latitude = undefined
    location.timezone = undefined
    location.error = null
  }

  return {
    location: readonly(location),
    requestLocation,
    setCity,
    resolveCityCoords,
    resolveCityCoordsFallback,
    clear,
  }
}
