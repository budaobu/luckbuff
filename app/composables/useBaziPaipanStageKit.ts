import type { BaziRoomSceneModel } from '~/utils/bazi-paipan-room/model'
import type { BaziRoomMount, BaziRoomQuality, BaziRoomRendererLabels, BaziRoomRendererStats } from '~/utils/bazi-paipan-room/renderer'

export interface BaziStageKitState {
  ready: Ref<boolean>
  quality: Ref<BaziRoomQuality>
  frameMs: Ref<number>
  errorMessage: Ref<string>
  rendererStats: Ref<BaziRoomRendererStats['renderer'] | null>
  keeperAnchor: Ref<{ x: number, y: number }>
}

export function useBaziPaipanStageKit(options: {
  initialModel: BaziRoomSceneModel
  reducedMotion: Ref<boolean>
  qualityOverride?: Ref<BaziRoomQuality | null>
  freeze?: Ref<boolean>
  onSelect?: (target: 'keeper' | 'visitor') => void
  onBackgroundClick?: () => void
  onKeeperAnchor?: (x: number, y: number) => void
}) {
  const state: BaziStageKitState = {
    ready: ref(false),
    quality: ref<BaziRoomQuality>('mid'),
    frameMs: ref(0),
    errorMessage: ref(''),
    rendererStats: ref(null),
    keeperAnchor: ref({ x: 31, y: 41 }),
  }
  let mount: BaziRoomMount | null = null
  let disposed = false
  let latestModel = options.initialModel

  async function attach(root: HTMLElement, labels: BaziRoomRendererLabels) {
    if (mount || disposed) return
    const { mountBaziPaipanRoom } = await import('~/utils/bazi-paipan-room/renderer')
    if (disposed) return
    mount = await mountBaziPaipanRoom({
      root,
      initialModel: latestModel,
      labels,
      reducedMotion: options.reducedMotion.value,
      qualityOverride: options.qualityOverride?.value ?? null,
      freeze: options.freeze?.value,
      onSelect: target => options.onSelect?.(target),
      onBackgroundClick: () => options.onBackgroundClick?.(),
      onKeeperAnchor: (x, y) => {
        const current = state.keeperAnchor.value
        if (Math.abs(current.x - x) < 0.2 && Math.abs(current.y - y) < 0.2) return
        state.keeperAnchor.value = { x, y }
      },
      onReady: (stats) => {
        state.ready.value = true
        state.quality.value = stats.quality
        state.frameMs.value = stats.sampleFrameMs
        state.rendererStats.value = stats.renderer
      },
      onError: message => state.errorMessage.value = message,
    })
  }

  function setScene(model: BaziRoomSceneModel) {
    latestModel = model
    mount?.setScene(model)
  }

  function setReducedMotion(value: boolean) {
    mount?.setReducedMotion(value)
  }

  function resetView() {
    mount?.resetView()
  }

  function dispose() {
    disposed = true
    mount?.dispose()
    mount = null
  }

  return { ...state, attach, setScene, setReducedMotion, resetView, dispose }
}
