# Horoscope research and engine decision

## Scope

A competitive daily horoscope surface needs more than one prose paragraph. The implemented fact layer covers the sign, date, tropical planetary positions, Moon sign, Moon phase, aspects to the natal Sun, overall/love/work/money/health scores, lucky number and color, plus explicit methodology. The product layer adds a twelve-sign ranking, per-sign detail, AI interpretation, SEO, and an ICS subscription.

## Sources and candidates

| Candidate | License / access | Result |
| --- | --- | --- |
| `astronomy-engine@2.1.19` | MIT; local Sun/Moon/planet positions and Moon phase | **Selected.** Already in the repository, has no native build, covers the astronomical facts needed for a daily evidence layer. |
| `celestine@0.2.1` | MIT; repository already validated for natal/transit work | Valid alternative. It was not added here because Astronomy Engine already covers positions/phase and a smaller custom aspect rule keeps the daily result deterministic. |
| `horoscope@2.0.1` | `UNLICENSED`; birthday sign lookup | Rejected. It has no daily categories and cannot be redistributed under a deterministic product license. |
| Aztro | Apache-2.0 repository, but its live endpoint returned 404 during research; fields are mood, color, lucky number/time, compatibility and description | Rejected as a runtime source. It lacks work/money/health/aspects and its text is a third-party content layer, not licensed as data. |
| Swiss Ephemeris wrappers | AGPL/special commercial terms | Rejected for this hosted product. |
| Kerykeion | AGPL-3.0 | Rejected. |
| Scraping APIs / Flask horoscope APIs | Upstream prose and availability are unsafe | Rejected. No third-party prose is copied. |

## Implemented combination

1. `astronomy-engine` calculates geocentric ecliptic longitudes for Sun through Pluto and the Moon phase at 12:00 Asia/Shanghai.
2. A local deterministic rule layer converts aspects, element affinity and phase into love/work/money/health/overall scores, lucky number/color/direction, and short practical hints.
3. The interpretation endpoint uses the same structured result as AI context. Target readings are free; full reports call `getAuthSession()` and return 401 when signed out.
4. `/api/horoscope/ics` renders a valid VTIMEZONE-based ICS from URL parameters, so macOS/Windows/iOS/Android clients can use either `webcal:` or the HTTPS URL.

## Measured Google Suggest

Measured on 2026-09-23 with `suggestqueries.google.com/complete/search?client=firefox`. The core topic queries returned exact matches: `星座运势`, `星座运势今天`, `horoscope today`, and `星座運勢 今日`. All twelve core sign queries returned an exact first match in zh-CN, zh-TW, en, and ja; examples:

- zh-CN: `白羊座今日运势`, `金牛座今日运势`, `双子座今日运势`, `天蝎座今日运势`, `双鱼座今日运势`.
- zh-TW: `牡羊座今日運勢`, `雙子座今日運勢`, `天蠍座今日運勢`, `雙魚座今日運勢`.
- en: `aries horoscope today`, `taurus horoscope today love`, `capricorn horoscope today`, `pisces horoscope today love`.
- ja: `牡羊座 今日 運勢`, `双子座 今日 運勢`, `射手座 今日 運勢`, `魚座 今日 運勢`.

The titles therefore keep the measured sign + “today” stem and add the requested category intent: love/career/money/health. Brand-specific suggestions such as 唐绮阳, Vogue, Astroyogi, and Ganesha were rejected. Low-deliverable terms were also rejected.
