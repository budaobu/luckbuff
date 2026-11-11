import type { BaziRoomSceneModel } from '~/utils/bazi-paipan-room/model'
import type { BaziRoomMount, BaziRoomQuality, BaziRoomRendererStats } from '~/utils/bazi-paipan-room/renderer'

export interface BaziStageKitState {
  ready: Ref<boolean>
  quality: Ref<BaziRoomQuality>
  frameMs: Ref<number>
  errorMessage: Ref<string>
  rendererStats: Ref<BaziRoomRendererStats['renderer'] | null>
}

export function useBaziPaipanStageKit(options: {
  initialModel: BaziRoomSceneModel
  reducedMotion: Ref<boolean>
  qualityOverride?: Ref<BaziRoomQuality | null>
  freeze?: Ref<boolean>
}) {
  const state: BaziStageKitState = {
    ready: ref(false),
    quality: ref<BaziRoomQuality>('mid'),
    frameMs: ref(0),
    errorMessage: ref(''),
    rendererStats: ref(null),
  }
  let mount: BaziRoomMount | null = null
  let disposed = false

  async function attach(root: HTMLElement) {
    if (mount || disposed) return
    const { mountBaziPaipanRoom } = await import('~/utils/bazi-paipan-room/renderer')
    if (disposed) return
    mount = await mountBaziPaipanRoom({
      root,
      initialModel: options.initialModel,
      reducedMotion: options.reducedMotion.value,
      qualityOverride: options.qualityOverride?.value ?? null,
      freeze: options.freeze?.value,
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
