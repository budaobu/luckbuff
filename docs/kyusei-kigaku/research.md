# Kyusei Kigaku research

## Scope and methodology

This review covers the classical Nine Star Ki chart, not a generic Purple White Flying Star house chart. Candidate libraries and repositories were checked against field coverage, maintenance, TypeScript readiness, and commercial license. Search tooling notes:

- `agent-reach` and `mcporter` were not installed in this checkout, so the Exa route from `agent-reach` could not run. GitHub repository/code search, npm registry metadata, Google autocomplete, and direct source inspection were used instead.
- The following public implementations were inspected only to verify formulas and known cases: Mythsensus (npm `mythsensus-mcp`, MIT), `ishibashm/portfolio` (no license), `apsinbm/nine-star-ki-mobile` (all rights reserved), `Rohiona/houitori` (no license), and `io0323/fortune-fusion` (no license). Non-MIT code was not copied or added as a dependency. The MIT Mythsensus package is 11.7 MB unpacked and is structured as an MCP server; its coverage is birth-star centric and does not justify adding that runtime to this Nuxt service.
- `lunar-javascript@1.7.0` is already a project dependency. npm reports MIT licensing and 2025-11 maintenance; its year, month, and day Nine Star layers avoid importing a second calendar engine.

## Field coverage

| Field | Candidate/library support | This implementation | Status |
|---|---|---|---:|
| Honmei star / 本命星 | Mythsensus, lunar-javascript, public calculators | `yearStar` by solar-year digit-sum, exact local Risshun boundary | Supported |
| Month star / 月命星 | lunar-javascript; public tables by year branch group | `monthStar` using exact solar-term month and branch-group descent | Supported |
| Keisha palace / 傾斜宮 | `fortune-fusion` and `Fortune_platform` document the placement rule | Position of the month star on a board centered by the honmei star; center confluence uses the opposite/back palace convention | Supported |
| Year board / 年盤 | Mythsensus and flying-star references | Annual star centered; descending Lo Shu flight | Supported |
| Month board / 月盤 | Public board tables and lunar-javascript | Solar-term month star centered; same flight rule | Supported |
| Day board / 日盤 | lunar-javascript and portfolio boundary tests | Day Nine Star centered; local civil day is preserved through the location timezone | Supported |
| Hour board / 時盤 | Portfolio documents the classical 2-hour rule | Day-branch group selects Rat-hour star 1/4/7, then descends through twelve branches | Supported |
| Five Yellow / 五黄殺 | Mythsensus and board references | Palace containing star 5; center placement has no direction | Supported |
| Dark Sword / 暗剣殺 | Mythsensus and board references | Opposite palace/direction of Five Yellow | Supported |
| Year breaker / 歳破 | Branch-clash rule | Opposite direction of the solar year branch | Supported |
| Month breaker / 月破 | Branch-clash rule | Opposite direction of the solar month branch | Supported |
| Honmei kill / 本命殺 | Directional board rules | Palace containing the birth year star | Supported |
| Honmei target kill / 本命的殺 | Directional board rules | Opposite palace/direction of the birth year star | Supported |
| Nine-palace direction board | Standard Lo Shu mapping | Palace 1=N, 2=SW, 3=E, 4=SE, 5=center, 6=NW, 7=W, 8=NE, 9=S | Supported |
| Compatibility / 相性 | Mythsensus exposes only personality; public 81 tables are largely proprietary or unlicensed | Five-element relation between the honmei and month stars plus a nine-star affinity matrix | Supported as chart-level compatibility; full 81-entry school-specific text is not claimed |
| Gender-based Nine Star rules | Not part of the classical natal year/month/day boards used here | Not used | Not applicable |

No unsupported field is rendered as blank: the UI maps every enum key through locale resources. The known scope limitation above is explicitly labeled in the UI rather than invented.

## Selected approach

Use the existing `lunar-javascript` as the sole calendar dependency. `getYearNineStar`, `getMonthNineStar`, and `getDayNineStar` are pure numeric/date layers. A service-only pure module normalizes birth time to the location timezone, anchors the month board to the exact solar longitude term, derives hour and boards, and emits semantic enum keys only. No third-party Nine Star package is added.

Rejected options:

- `mythsensus-mcp`: MIT but 11.7 MB, MCP-oriented, redundant with existing calendar/AI infrastructure, and incomplete for direction boards.
- `apsinbm/nine-star-ki-*`: relevant TypeScript boundary research, but no commercial license.
- `Rohiona/houitori`, `ishibashm/portfolio`, `io0323/fortune-fusion`, `Terumasa0218/Fortune_platform`: no detected license; formula corroboration only.
- Generic Purple White Flying Star packages: different house/date domain and do not produce Kigaku personal boards.

## Verified calculation cases

Boundary tests use independent public sources and JST cases documented in `ishibashm/portfolio` boundary tests. The implementation is not copied; expected values are fixed as contracts:

| Birth instant (timezone-aware) | Year/honmei | Month | Day | Rule |
|---|---:|---:|---:|---|
| 1986-03-15 12:00 Asia/Tokyo | 5 | 1 | 1 | Mid-year baseline |
| 1990-07-10 12:00 Asia/Tokyo | 1 | 3 | 6 | Mid-year baseline |
| 2026-02-01 12:00 Asia/Tokyo | 2 | 9 | 7 | Before 2026 Risshun |
| 2026-02-05 12:00 Asia/Tokyo | 1 | 8 | 2 | After 2026 Risshun |
| 2026-01-31 12:00 Asia/Tokyo | 2 | 9 | 6 | Year/month/day fixed case |
| 2028-02-04 16:32 Asia/Tokyo | 8 | 2 | 2 | Exact-term side after 16:31 JST |

Known cases 1986, 1990, and the 2026/2028 boundaries are fixed against `lunar-javascript`; the term-moment cases are additionally corroborated by the public boundary suite and National Astronomical Observatory of Japan term times. The MIT golden case that constructed some dates in UTC was not used where it disagreed with the requested civil timezone.

## Existing i18n mechanism

- Nuxt 4 + `@nuxtjs/i18n@10`, locale files under `i18n/locales`; `zh-CN` is default and has no URL prefix. `zh-TW`, `en`, and the existing partial `ja` use prefixes.
- `detectBrowserLanguage` only redirects the root and persists `i18n_redirected`; no route-level content negotiation is added.
- `i18n/i18n.config.ts` currently has a global `fallbackLocale: 'zh-CN'`. It changes to locale-aware fallback so `ja` and `ko` fall back to `en`; existing full locales are unchanged for keys they already contain.
- Locale switcher and `useLocaleHead` consume the central `i18n.locales` list. Adding `ko` automatically extends routes, `<html lang="ko-KR">`, switcher labels, canonical/hreflang, and sitemap split.
- Sitemap `autoI18n` previously had three locales. It gains `ja` and `ko`; existing auto routes and `_i18nTransform` entries therefore receive all five language alternates.
- CJK remains system-font only. Language selectors set a small font-stack variable: Japanese prefers Hiragino/Yu Gothic/Noto Sans JP and Korean prefers Apple SD Gothic Neo/Malgun Gothic/Noto Sans KR. No webfont payload is added. `lang` remains the primary glyph-disambiguation mechanism.
- Two legacy single-locale guards were removed because they blocked the project-wide Japanese rollout: a global route middleware that redirected every `/ja/*` path except Shichu Suimei, and an `app.vue` filter that suppressed Japanese hreflang/OG alternates outside Shichu Suimei. Nuxt UI now receives the `ko` locale object as well.

## Validation evidence

- Local production build on port 3001 returned HTTP 200 for all five tool routes with `html lang` values `zh-CN`, `zh-TW`, `en`, `ja-JP`, and `ko-KR`; each title, H1, canonical, and JSON-LD `WebApplication` was locale-specific.
- Every route emitted hreflang `x-default`, `zh`, `zh-CN`, `zh-TW`, `en`, `ja`, `ja-JP`, `ko`, and `ko-KR`; sitemap splits also include the same five-way alternates.
- `/ja/tools`, `/ko/tools`, `/ja/privacy`, and `/ko/privacy` return 200. Missing keys fall back to English rather than showing an i18n key.
- Pure tests cover five known charts, exact-term boundaries, hour grouping, and complete boards. `pnpm lint`, `pnpm test`, `pnpm typecheck`, and `pnpm build` pass.
- Browser automation ran form submission, hover, targeted AI click, SSE response, and the logged-out full-report gate for all five locales. Evidence is under `output/playwright/kyusei-kigaku/`. The local AI call used an isolated OpenAI-compatible stub so the five prompts could be observed without contacting production AI; each stream returned text in the requested language.
- The unauthenticated full-report endpoint returned 401. A disposable copied SQLite auth database with a test session was then mounted only on the local verification process; authenticated `mode=full` calls returned HTTP 200 for all five locales. The repository `auth.db` was not modified.

## Term table

| Key | zh-CN | zh-TW | en | ja | ko |
|---|---|---|---|---|---|
| Tool | 九星气学排盘 | 九星氣學排盤 | Nine Star Ki Chart | 九星気学 | 구성학 |
| Honmei star | 本命星 | 本命星 | Honmei star | 本命星 | 본명성 |
| Month star | 月命星 | 月命星 | Month star | 月命星 | 월명성 |
| Inclined palace | 倾斜宫 | 傾斜宮 | Inclined palace | 傾斜宮 | 기울어진 궁 |
| Five Yellow | 五黄杀 | 五黃殺 | Five Yellow | 五黄殺 | 오행살(五黄殺) |
| Dark Sword | 暗剑杀 | 暗劍殺 | Dark Sword | 暗剣殺 | 암검살 |
| Year breaker | 岁破 | 歲破 | Year breaker | 歳破 | 세파 |
| Month breaker | 月破 | 月破 | Month breaker | 月破 | 월파 |
| Honmei kill | 本命杀 | 本命殺 | Honmei kill | 本命殺 | 본명살 |
| Honmei target kill | 本命的杀 | 本命的殺 | Honmei target kill | 本命的殺 | 본명적살 |

Korean uses `구성학`, the established Korean reading of 九星學 found by Google Korea autocomplete; `구성비` is a ratio term and was rejected. The Korean locale may retain the Hanja in parentheses where disambiguation helps.

## SEO autocomplete evidence

Captured 2026-10-26 from `suggestqueries.google.com/complete/search?client=firefox&ie=utf-8&oe=utf-8` with matching `hl`/`gl`. Results are raw suggestions, deduplicated but otherwise in Google order. Where fewer than ten appeared, the endpoint returned fewer suggestions; none were invented.

### ja-JP query `九星気学`

九星気学 / 九星気学 2026 / 九星気学 自動計算 / 九星気学 相性 / 九星気学 調べ方 / 九星気学とは / 九星気学 自動計算 2026 / 九星気学自動計算アプリ / 九星気学 計算 / 九星気学 調べる

Additional directional query: 九星気学 吉方位 / 九星気学 吉方位カレンダー / 九星気学 吉方位2026 / 九星気学 吉方位カレンダー 2026 / 九星気学 吉方位 アプリ / 九星気学 吉方位 2025 / 九星気学 吉方位 出し方 / 九星気学 吉方位 見方 / 九星気学 吉方位 日盤

### zh-TW query `九星氣學`

九星氣學 / 九星氣學怎麼算 / 九星氣學吉方位 / 九星氣學 計算 / 九星氣學 日本. Google returned only five suggestions for Taiwan; the low demand is recorded rather than padded.

### zh-CN query `九星气学`

九星気学 / 九星气学怎么算 / 九星気学 本命星 月命星 日命星 / 九星气学吉方位 / 九星気学 本命星 月命星 / 九星气学 日本 / 九星气学 计算. Mainland users often type the Japanese form; this is recorded as evidence, not treated as a typo to replace.

### ko-KR query `구성학`

구성학 / 구성학 만세력 / 구성학이란 / 구성학 숫자 의미 / 구성학 적중률 / 구성학 본명성 / 구성학 풀이 / 구성학 프로그램 / 구성학 래 정법 / 구성학 보는 법

### en-US query `nine star ki`

nine star ki / nine star ki calculator / nine star ki 2026 / nine star ki chart / nine star ki number meaning / nine star ki astrology / nine star ki reading free / nine star ki compatibility / nine star ki michio kushi / nine star ki michio kushi pdf
