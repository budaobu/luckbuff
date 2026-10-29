# bazi-paipan result modal segment inventory

Updated: 2026-10-27

This document inventories the `/tools/bazi-paipan` result overlays and their data contracts. The confirmed treatment for "pillar meaning" is option A: keep the segment and render it as calculated pillar evidence.

## Pending confirmation

Resolved on 2026-10-27: option A was selected.

The original decision was how to treat the existing "pillar meaning" segment.

| Option | Behavior | Consequence |
| --- | --- | --- |
| A. Calculated evidence view | Keep the segment, rename its detail to pillar evidence, and render it from the pillar's concrete ganzhi, ten god, hidden stems, terrain, and self-sitting fields. | Satisfies the real-data and traceability requirements. |
| B. Remove from segmented detail | Exclude "pillar meaning" from clickable segments and preserve the existing static sentence only as non-interactive explanatory copy. | Avoids presenting a static locale string as a calculated judgment. |
| C. Retain static locale copy as a segment | Keep the current locale-driven segment unchanged. | This does not satisfy the stated no-hardcoded, data-driven detail rule. |

All listed segments have direct output fields or deterministic derivations. The selected option is implemented by the `pillar-meaning` segment in `app/utils/bazi-paipan-3d/segments.ts`.

## Implementation status

Implemented by `app/composables/useBaziPaipanSegments.ts`, `app/utils/bazi-paipan-3d/segments.ts`, `BaziPaipan3DStage.vue`, and the renderer's segment overlay/view-snapshot APIs.

Playwright evidence is under `output/playwright/bazi-segments/`. The run covers all 20 segment types, three boundary charts, hover and touch icon behavior, low-quality static fallback, reduced-motion fallback, scroll and camera restoration, 50 repeated enter/return cycles, and zero browser console errors.

## Scope

`app/pages/tools/bazi-paipan.vue` renders its result through `app/components/bazi-paipan-3d/BaziPaipan3DStage.vue`. The page has no `UModal`, `UDrawer`, or separate report component in its result phase. The visible "modal" is therefore the stage's full-height `info-panel`; its states are selected by `controller.selectedNodeId`.

Current selection identities are:

| Modal state | Count | Existing node ID |
| --- | ---: | --- |
| Overview | 1 | `overview` |
| Pillar detail | 4 | `pillar:year`, `pillar:month`, `pillar:day`, `pillar:hour` |
| Five-element detail | 5 | `element:wood`, `element:fire`, `element:earth`, `element:metal`, `element:water` |
| Da Yun detail | dynamic | `dayun:{result.dayuns[].index}` |
| Liu Nian detail | dynamic | `liunian:{result.dayuns[].liunian[].year}` |

The source result type is `BaziChartResult` in `server/utils/tools/bazi-chart.ts:251`. The service builds it in `calculateBaziChartResult()` at line 964. It cross-checks `@openfate/bazi-engine` and `@soul-atelier/bazi` and rejects a mismatched four-pillar result.

## Modal to segment to data mapping

### Overview

| Segment | Existing data fields | Data source and rule | Final judgment source |
| --- | --- | --- | --- |
| Birth info | `birth.solarText`, `birth.clockText`, `birth.genderText`, `birth.lunarDetail`, `birth.locationName` | `calculateBaziChart()` supplies civil solar time, true solar time, lunar conversion, timezone, and longitude handling; `lunar-javascript` supplies the lunar and solar-term text. Boundaries use 23:00 day change. | `birth.solarTimeStatus`, `birth.solarTimeStatusText`, `birth.selectedHour`, `birth.effectiveHour`, `birth.dayBoundaryChanged`, `birth.solarTerm` |
| Day strength | `energy.strength`, `energy.supportRatio`, `energy.rootStatus`, `energy.adjustment` | `buildEnergy()` and `buildWeightedElements()` weigh visible stems and branches, hidden stems by main/middle/residual type, and month command by `siLing.daysAfterTerm`. Day-master and resource elements form the support ratio. | `energy.monthCommand`, `energy.monthCommandDetail`, `energy.rootQuality`, `energy.primaryUseGod`, `energy.supportUseGod`, `energy.avoidGod` |
| Element distribution | `energy.wuxing[].label`, `.visibleCount` | `buildWeightedElements()` counts visible stems/branches and hidden-stem presence. | Full item: `.weight`, `.percent`, `.hiddenCount`, `.role`, `.state`, `.stateLabel`, `.evidence` |
| Natal signals | `relations[]`, `shensha[]` | `buildRelations()` normalizes `@openfate/bazi-engine` branch interactions and `@soul-atelier/bazi` stem/branch interactions, then deduplicates. `buildShensha()` maps the engine's shensha table and metadata. | Each relation: `.type`, `.value`, `.positions`, `.impact`, `.intensity`, `.status`; each shensha: `.classification`, `.positions`, `.description` |
| Da Yun list | `dayuns[].startAge`, `.ganzhi` | `buildDayuns()` maps `openChart.daYun.cycles`; flow years are attached from `buildFlowYears()`. | `dayuns[].isCurrent`, `.startYear`, `.endYear`, `.startAge`, `.endAge`, plus `dayunMeta.direction`, `.isForward`, `.startText`, `.startDate` |
| Structure | `pattern.name`, `energy.primaryUseGod`, `structure.evidence[]` | `buildPattern()` takes the month-branch main hidden stem, derives its ten god, checks whether that god is transparent in other stems, and considers Seven Killings neutralization. `buildEnergy()` supplies support and root context. | `pattern.status`, `.monthMainQi`, `.transparency`, `.rootStatus`, `.evidence[]`; `structure.patternEvidence` |

### Pillar detail: one instance for each pillar

| Segment | Existing data fields | Data source and rule | Final judgment source |
| --- | --- | --- | --- |
| Pillar summary and stem ten god | `pillars[].label`, `.ganzhi`, `.shishenGan`, `.tag` | `@soul-atelier/bazi` derives pillars and ten gods against the day master; `calculateBaziChartResult()` maps them into `pillarMap()`. | `.gan`, `.ganWuxing`, `.zhi`, `.zhiWuxing`; day-pillar comparison is implicit through `.shishenGan` |
| Hidden stems | `pillars[].hiddenStems[].gan`, `.type`, `.wuxing`, `.shishen`, `.isMain` | The engine returns main/middle/residual hidden stems and corresponding hidden-stem ten gods. | Each hidden stem's element, ten god, and `isMain`; month-pillar main qi additionally feeds `pattern` and `energy.monthCommand` |
| Na Yin, Di Shi, and Xun Kong | `pillars[].nayin`, `.diShi`, `.xunKong`, plus unused `.xun` and `.voidKinds` | The engine supplies the sexagenary cycle derivations: sound, terrain, xun, void branches, and void kind. | `.nayin`, `.diShi`, `.selfSitting`, `.xun`, `.xunKong`, `.voidKinds` |
| Pillar shensha | `pillars[].shensha[].name`, `.classification` | `buildShensha()` distributes engine shensha by their pillar positions and resolves descriptions from `SHEN_SHA_META`. | `.description`, global `shenshaCombinations[]` when multiple shensha occupy the same pillar |
| Pillar meaning | currently static locale text: `bazi3d.${key}Meaning` | This is the only current segment without a direct `BaziChartResult` data field. The locale string is explanatory copy, not calculated output. | To satisfy the no-hardcoded-example rule, its detail must synthesize the concrete `.gan`, `.zhi`, `.shishenGan`, `.hiddenStems`, `.diShi`, and `.selfSitting` values. It should not present the static locale sentence as a calculated judgment. |

### Five-element detail: one instance for each element

| Segment | Existing data fields | Data source and rule | Final judgment source |
| --- | --- | --- | --- |
| Element summary | `selectedElement.label`, `.visibleCount`, `.role`, `.percent` | `buildEnergy()` derives `energy.wuxing[]` after `buildWeightedElements()`. | `.weight`, `.hiddenCount`, `.state`, `.evidence` |
| Relation and favorable/unfavorable state | `.stateLabel`, `.direction`, `.evidence` | Favorable and avoid sets are based on day strength: strong day masters favor output, wealth, and control elements; otherwise they favor the day master and resource element. Direction is a fixed element-to-direction output mapping. | `.state`, `.role`, `energy.strength`, `energy.supportRatio`, `energy.primaryUseGod`, `energy.supportUseGod`, `energy.avoidGod` |
| Adjustment | `.organs`, `energy.adjustment` | `organs` is a fixed element-to-organ mapping retained in the output. `adjustment` is generated from day strength. | `energy.strength`, `energy.rootStatus`, `.state`; present `adjustment` explicitly as a global adjustment, not an element-specific prescription |

### Da Yun detail: one instance per returned cycle

| Segment | Existing data fields | Data source and rule | Final judgment source |
| --- | --- | --- | --- |
| Cycle summary | `dayuns[].startYear`, `.endYear`, `.ganzhi`, `.startAge`, `.endAge`, `.shishenGan`, `.shishenZhi` | `buildDayuns()` maps `openChart.daYun.cycles`; ten gods are read against the natal day master. | `.isCurrent`, `dayunMeta.isForward`, `dayunMeta.direction`, `dayunMeta.startText`, `dayunMeta.startDate` |
| Cycle shensha | `dayuns[].shensha[].name`, `.classification` | `buildDayuns()` matches the OpenFate cycle with `soulChart.decadeFortunes` by sixty-cycle name and maps its shensha. | `.description`; global `shenshaCombinations[]` remains natal, not a decade judgment |
| Annual list | `dayuns[].liunian[].year`, `.ganzhi`, `.intensity` | `buildFlowYears()` builds each year and `buildDayuns()` groups ten consecutive years. | Each year's `.signals[]`, `.shensha[]`, `.isCurrent`, `.summary` |

### Liu Nian detail: one instance per returned year

| Segment | Existing data fields | Data source and rule | Final judgment source |
| --- | --- | --- | --- |
| Annual summary | `.year`, `.age`, `.ganzhi`, `.shishenGan`, `.shishenZhi`, `.intensity` | `buildFlowYears()` finds the engine annual fortune, detects interactions between the four natal branches and the annual branch, and classifies intensity. Clash or punishment is high; two triggers, a combination, or a three-harmony is medium; otherwise stable. | `.signals[]`, `.energyShifts[]`, `.shensha[]`, `.isCurrent` |
| Annual reading and energy shifts | `.summary`, `.energyShifts[]` | Summary text is selected by the deterministic intensity value. Energy shifts derive the annual stem ten god role and annual branch element. | `.signals[]`; annual stem/branch against natal branches through `detectInteractions()` |
| Natal linkage signals | `.signals[].type`, `.value`, `.positions`, `.impact` | `detectInteractions()` is called with the four natal branches and the annual branch; only interactions containing the annual branch remain. | Signal type determines intensity; `.impact` is the normalized relation impact |

## Fields not present in the current modal

The following output fields exist but are not current modal segments. They are not proposed as new segments here:

- `extras.taiYuan`, `extras.mingGong`, `extras.shenGong`
- full `energy.tenGods[]`
- full `shensha[]` and `shenshaCombinations[]`
- `natalThemes[]`
- `methodology[]`
- `generatedAt`

## Existing 3D implementation

Files:

- `app/components/bazi-paipan-3d/BaziPaipan3DStage.vue`: overlay, toolbar, info panel, mount lifecycle, reduced-motion detection, and dynamic renderer import.
- `app/composables/useBaziPaipan3D.ts`: scene state, hover and selected IDs, lifecycle, stats, error state, and derived model.
- `app/utils/bazi-paipan-3d/model.ts`: derives characters, element clusters, generation/control edges, natal relations, day master, and compact dayun data from `BaziChartResult`.
- `app/utils/bazi-paipan-3d/renderer.ts`: Three.js renderer, scene, camera, OrbitControls, CSS2D labels, selection, animation, resize, visibility, context-loss, and disposal.

Rendering contract:

- The stage mounts client-only and dynamically imports Three.js, OrbitControls, and CSS2DRenderer.
- `mountBaziPaipan3D()` returns `dispose`, `resetView`, and `setAutoRotate`.
- A `WebGLRenderer` renders one persistent scene. A separate CSS2D layer renders Chinese character, pillar, element, relation, dayun, and current-year labels.
- Interactive meshes register in `clickable` and a `nodes` map keyed by the node IDs listed above. Pointer events update `hoveredNodeId`; click updates `selectedNodeId`.
- The selected-node watcher toggles auto-rotation and moves the camera. `focusNode()` currently knows pillar, element, dayun, and liunian parent nodes only.
- Low quality, missing WebGL, initialization failure, or context loss sets `state.state = 'static'`.
- `detectQuality()` honors `?bazi3dQuality=low|mid|high`, save-data, slow connections, few cores, low memory, and small viewports.
- Disposal stops the animation loop, clears watchers and timers, disconnects observers, removes events, disposes controls and tracked resources, and removes WebGL and CSS2D DOM.

## Parameterization assessment

The existing architecture can support segmented detail without rewriting the renderer or replacing the persistent WebGL context.

Recommended model:

1. Keep `selectedNodeId` as the existing parent node so current camera focus and panel resolution remain backward compatible.
2. Add an `activeSegmentId` state, for example `pillar:day/hidden-stems` or a paired `{ nodeId, segmentKey }`.
3. Add one common composable and one segment configuration table. Configuration supplies ID, parent node, title, icon, field resolver, evidence resolver, explanation key, scene kind, camera hint, and fallback image.
4. Extend the mount contract with view capture/restore and a segment-effect control. Existing `dispose` and `resetView` remain intact.
5. For segments that already have a mesh, highlight or isolate the existing mesh. For textual segments without a mesh, create one active overlay group per segment and dispose it before creating the next.
6. Never recreate the renderer for a segment switch. Dispose only the old segment overlay's geometries, materials, textures, temporary objects, and any segment-local timers. This preserves the base RAF and avoids leaking WebGL contexts.

The transition can remain within 300 ms by cross-fading the segment overlay group or by animating opacity and scale. On return, restore the saved `panel-body.scrollTop`, camera position, and OrbitControls target.

Known gaps:

- The current scene has dedicated objects only for pillars, elements, dayuns, and the current liunian. Hidden stems, ten gods, nayin/dishi, shensha, structure, birth info, and individual non-current years need segment overlays or mesh highlight extensions.
- `prefers-reduced-motion` currently disables auto-rotation, starfield drift, floating particles, and current-year pulsing, but the frame loop still moves generation and relation particles. Segment work should also make every segment-specific animation honor reduced motion.
- Static fallback has a poster surface but no per-segment static image yet. The common configuration needs a deterministic data-driven SVG or canvas snapshot plus a fade-in for low-quality and reduced-motion paths.
- Hover-only icons need absolute positioning inside each segment header so desktop hover does not shift layout. A `pointer: coarse` or no-hover media query should show a low-emphasis persistent icon on touch devices.
- Esc and the return button should share one composable-backed action. The listener must be active only while a segment detail is open.

## Traceability status

Every listed segment has a direct `BaziChartResult` field or a deterministic derivation from those fields. The one exception is "pillar meaning", whose current value is static locale copy. It can remain as a presentation wrapper only if the expanded detail is generated from the concrete pillar fields listed above. If the user prefers strict calculated-only detail, that segment should either be removed or renamed as pillar evidence and driven by `.gan`, `.zhi`, `.hiddenStems`, `.shishenGan`, `.diShi`, and `.selfSitting`.

No implementation should begin until this mapping and the treatment of "pillar meaning" are confirmed.
