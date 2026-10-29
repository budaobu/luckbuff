import type { BaziChartResult } from '~~/server/utils/tools/bazi-chart'
import type { BaziPaipan3DMount } from '~/utils/bazi-paipan-3d/renderer'
import type { BaziSegmentConfig } from '~/utils/bazi-paipan-3d/segments'
import { buildBaziPaipanSegmentConfigs } from '~/utils/bazi-paipan-3d/segments'

export interface BaziPaipanCameraView {
  position: [number, number, number]
  target: [number, number, number]
}

interface SegmentOptions {
  result: Ref<BaziChartResult>
  selectedNodeId: Ref<string | null>
  mount: Ref<Pick<BaziPaipan3DMount, 'setSegment' | 'clearSegment' | 'captureView' | 'restoreView'> | null>
  panelBody: Ref<HTMLElement | null>
  staticMode: Ref<boolean>
  onSegmentNodeSelect?: (nodeId: string) => void
  onSegmentBackground?: () => void
}

let tabSwitching = false

export function useBaziPaipanSegments(options: SegmentOptions) {
  const activeSegmentId = ref<string | null>(null)
  const savedScrollTop = ref(0)
  const savedSelectedNodeId = ref<string | null>(null)
  let savedCameraView: BaziPaipanCameraView | null = null

  const segmentConfigs = computed(() => buildBaziPaipanSegmentConfigs(options.result.value))
  const activeSegment = computed(() => segmentConfigs.value.find(config => config.id === activeSegmentId.value) ?? null)
  const isActive = computed(() => Boolean(activeSegment.value))

  async function openConfig(config: BaziSegmentConfig) {
    const enteringDetail = !activeSegmentId.value
    const returnScroll = options.panelBody.value?.scrollTop ?? 0
    const returnSelectedNodeId = options.selectedNodeId.value
    const returnCameraView = options.mount.value?.captureView() ?? null
    if (options.selectedNodeId.value !== config.parentId) {
      tabSwitching = true
      options.selectedNodeId.value = config.parentId
      await nextTick()
      tabSwitching = false
    }
    await open(config.parentId, config.key)
    if (enteringDetail) {
      savedScrollTop.value = returnScroll
      savedSelectedNodeId.value = returnSelectedNodeId
      savedCameraView = returnCameraView ?? savedCameraView
    }
  }

  function configsForNode(nodeId: string) {
    return segmentConfigs.value.filter(config => config.parentId === nodeId)
  }

  function segmentForNode(nodeId: string, segmentKey: string) {
    return configsForNode(nodeId).find(config => config.key === segmentKey) ?? null
  }

  async function open(parentNodeId: string, segmentKey: string) {
    const config = segmentForNode(parentNodeId, segmentKey)
    if (!config || activeSegmentId.value === config.id) return

    const enteringDetail = !activeSegmentId.value
    if (enteringDetail) {
      savedScrollTop.value = options.panelBody.value?.scrollTop ?? 0
      savedSelectedNodeId.value = options.selectedNodeId.value
      savedCameraView = options.mount.value?.captureView() ?? { position: [0, 18, 38], target: [0, 1, 0] }
    }
    activeSegmentId.value = config.id
    if (!options.staticMode.value) {
      options.mount.value?.setSegment({
        effect: config.effect,
        accent: config.accent,
        anchor: config.parentId,
      })
    }
    await nextTick()
    if (options.panelBody.value) options.panelBody.value.scrollTop = 0
  }

  async function back() {
    const cameraView = savedCameraView
    const scrollTop = savedScrollTop.value
    const selectedNodeId = savedSelectedNodeId.value
    if (!activeSegmentId.value) return

    activeSegmentId.value = null
    options.mount.value?.clearSegment()
    await nextTick()
    if (selectedNodeId && options.selectedNodeId.value !== selectedNodeId) options.selectedNodeId.value = selectedNodeId
    await nextTick()
    if (options.panelBody.value) options.panelBody.value.scrollTop = scrollTop
    if (!options.staticMode.value && cameraView) options.mount.value?.restoreView(cameraView)
    savedCameraView = null
  }

  function closeForNodeChange(nextNodeId: string | null) {
    if (!activeSegmentId.value) return
    if (activeSegmentId.value.startsWith(`${nextNodeId}/`)) return

    activeSegmentId.value = null
    savedCameraView = null
    options.mount.value?.clearSegment()
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && activeSegmentId.value) {
      event.preventDefault()
      void back()
    }
  }

  watch(() => options.selectedNodeId.value, (nextNodeId: string | null) => {
    if (tabSwitching) return
    closeForNodeChange(nextNodeId)
  })
  onMounted(() => window.addEventListener('keydown', handleKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))

  return {
    activeSegmentId,
    activeSegment,
    isActive,
    segmentConfigs,
    openConfig,
    configsForNode,
    segmentForNode,
    open,
    back,
  }
}
