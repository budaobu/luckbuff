import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'
import { buildBaziPaipan3DModel, type BaziPaipan3DModel, type ElementKey } from '~/utils/bazi-paipan-3d/model'

export type Bazi3DQuality = 'high' | 'mid' | 'low'
export type Bazi3DScene = 'compass' | 'galaxy' | 'tunnel'
export type Bazi3DLifecycle = 'idle' | 'playing' | 'settled' | 'interactive' | 'tunnel' | 'fallback'
export type BaziPaipan3DState = ReturnType<typeof useBaziPaipan3D>

export function useBaziPaipan3D(result: Ref<BaziChartResult | null>) {
  return {
    scene: ref<Bazi3DScene>('galaxy'),
    state: ref<'pending' | 'ready' | 'error' | 'static'>('pending'),
    quality: ref<Bazi3DQuality>('high'),
    hoveredCharacterId: ref<string | null>(null),
    hoveredPillarKey: ref<string | null>(null),
    selectedPillarKey: ref<string | null>(null),
    selectedElementKey: ref<ElementKey | null>(null),
    selectedDayunIndex: ref(0),
    tunnelProgress: ref(0),
    introCompleted: ref(false),
    lifecycle: ref<Bazi3DLifecycle>('idle'),
    timelineProgress: ref(0),
    replayRequested: ref(0),
    timelineControl: null as null | { seek: (seconds: number) => void, replay: () => void },
    rendererStats: ref<{ geometries: number, textures: number, programs: number } | null>(null),
    errorMessage: ref(''),
    model: computed((): BaziPaipan3DModel | null => result.value ? buildBaziPaipan3DModel(result.value) : null),
  }
}

export function skipBazi3DIntro(state: { introCompleted: Ref<boolean> }) {
  state.introCompleted.value = true
}
