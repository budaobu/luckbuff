# Qizheng Paipan Kage mapping

## Observed Kage structure

- The rendered demo is a fixed, full-viewport live Three.js scene. Content sections scroll above it; the scene changes lighting and focus as chapters enter.
- The narrative moves from a single threshold hero to numbered chapters, then to a compact gallery, a grid of practice cards, and a quiet closing section.
- Typography is one humanist sans family at strongly contrasting sizes. Labels use small uppercase tracking; headings stay large but plain.
- The dark base is near black with a muted green-white foreground and a red accent. Depth comes from soft light, grain, and slow motion rather than heavy borders.
- Motion is slow and restrained: long ambient loops, section reveals, and a small scroll indicator. The page explicitly identifies the scene as Three.js.
- Mobile keeps the same chapter order and full-bleed scene, but collapses cards into a vertical rhythm and preserves the numbered labels.

## Translation to Qizheng Paipan

| Kage element | Qizheng Paipan equivalent |
| --- | --- |
| Full-screen threshold scene | A quiet client-only deep-sky backdrop behind the existing input form; the form remains the action center. |
| Numbered threshold hero | Input page sections: birth data, timing rules, and privacy rules, with short numbered labels. |
| Chapter progression | Result sections follow the calculation order: birth evidence, pillars, eleven luminaries, twelve palaces, signals, cycles, then methodology. |
| Gallery rhythm | The luminary table and palace grid become chapter blocks with generous, consistent spacing instead of unrelated dashboard cards. |
| Ambient light | A procedural Three.js starfield and slow horizon glow use deep indigo, pale silver, and one restrained gold accent. |
| Closing section | The existing methodology and disclaimer remain as the final evidence section. |

## Implementation decisions

- Keep all star, palace, mansion, relation, period, and interpretation meaning from `QizhengPaipanResult`; add only layout labels.
- Scope the dark surface and motion to `qzp-*` and `qzpr-*` classes or the dedicated backdrop component.
- Use Three.js only because the case study confirms it. Load it dynamically on the client; fall back to a static CSS gradient and stars when WebGL is unavailable, motion is reduced, or the viewport is coarse/small.
- Keep the chart tables the primary source of truth. The background is noninteractive, uses `aria-hidden`, and never overlays data.
- Do not copy Kage copy, assets, brand marks, shrine geometry, source code, or its paid package.
