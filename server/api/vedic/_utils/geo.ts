export interface GeoResult {
  lat: number
  lng: number
  cityName: string
}

const cache = new Map<string, { value: GeoResult; expiresAt: number }>()
const TTL_MS = 24 * 60 * 60 * 1000

function isChinese(text: string): boolean {
  return /[一-龥]/.test(text)
}

async function viaOpenMeteo(query: string): Promise<GeoResult | null> {
  if (isChinese(query)) return null
  try {
    const data = await $fetch<any>('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: query, count: 1, language: 'en', format: 'json' },
    })
    const hit = data?.results?.[0]
    if (!hit) return null
    return {
      lat: hit.latitude,
      lng: hit.longitude,
      cityName: [hit.name, hit.admin1, hit.country].filter(Boolean).join(', '),
    }
  } catch {
    return null
  }
}

async function viaNominatim(query: string): Promise<GeoResult | null> {
  try {
    const data = await $fetch<any[]>('https://nominatim.openstreetmap.org/search', {
      params: { q: query, format: 'json', limit: 1, 'accept-language': 'zh' },
      headers: { 'User-Agent': 'luckbuff/1.0 (https://www.ososn.com)' },
    })
    const hit = data?.[0]
    if (!hit) return null
    return {
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      cityName: hit.display_name,
    }
  } catch {
    return null
  }
}

export async function resolveGeo(cityQuery: string): Promise<GeoResult | null> {
  const key = cityQuery.trim().toLowerCase()
  if (!key) return null

  const cached = cache.get(key)
  const now = Date.now()
  if (cached && cached.expiresAt > now) {
    return cached.value
  }

  const result = (await viaOpenMeteo(cityQuery)) ?? (await viaNominatim(cityQuery))
  if (result) {
    cache.set(key, { value: result, expiresAt: now + TTL_MS })
  }
  return result
}
