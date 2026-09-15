# Japanese omikuji data research

## Content model

The public sources agree that a conventional omikuji result is more than a rank. The Shinto Shrine Headquarters page describes overall fortune plus life guidance such as money, love, lost items, travel, awaited people and health. Nankai Electric Railway's visitor guide lists a common seven-rank sequence and thirteen slip fields. A Jalan explainer attributed to omikuji researcher Tae Hirano adds the common nine-rank sequence and explains handling rules.

The implementation therefore uses nine ranks (`daikichi` through `daikyo`) and 18 fields: wish, love, awaited person, parting, marriage, business, work, money, lost item, residence, travel, health, study, dispute, employees, childbirth, family, and new start. Each result also has a number, verse title, verse, summary, action, lucky direction, and symbol color. The UI states that this is a general reference framework, not a specific shrine or temple set.

## Library and data assessment

- npm `omikuji` 1.1.0 only picks a random array value; it has no Japanese slip content model.
- `yone1130/omikuji` is CC0 1.0, but only animates six rank names; it has no per-slip fields.
- `fumiama/senso-ji-omikuji` contains 200 photographs for Senso-ji slips 1-100 under an MIT repository license. It lacks structured text, and reusing photographs or OCR text derived from temple slips raises provenance risk beyond the repository license.
- No maintained npm package or public API was found with a complete, licensed, structured set of Japanese omikuji fields.

## Chosen approach

Use no external dependency for domain data. The project stores a 100-number deterministic model with original multilingual reference text and feeds the user question, rank, verse, and all field readings to the existing AI SSE interpreter. This avoids copying a shrine-specific text set while preserving the conventional nine-rank and multi-field structure needed for a complete result page.
