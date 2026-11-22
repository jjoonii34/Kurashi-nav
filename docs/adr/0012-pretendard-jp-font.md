# ADR-0012: Pretendard JP, self-hosted, as the only typeface

- Status: accepted
- Date: 2026-11-22

## Context

Every screen mixes three scripts on one line: Hangul or Latin explanations
next to the Japanese words printed on an estimate (敷金, 仲介手数料). With
system fonts each script came from a different family, so weights and
heights did not match, and the page looked different on every device.

Options considered:

- **System fonts** — no download, but inconsistent across scripts and devices.
- **Noto Sans KR + Noto Sans JP** — common and complete, but two families to
  balance, loaded per language.
- **Pretendard JP** — one family covering Latin, Hangul, kana and kanji;
  Pretendard is widely used on Korean product sites.

## Decision

Use Pretendard JP (variable font) from the `pretendard-jp` npm package,
imported once in each root layout. The files are built into `out/` and
served from our own origin; nothing is requested from a font CDN.

## Consequences

- The package ships the font as 119 small subset files (about 5 MB in
  `out/`); a browser downloads only the subsets a page actually uses.
- No third party sees a visitor's request, in line with ADR-0002.
- One more npm dependency for Dependabot to track.
- Kanji use Japanese glyph shapes in every language, which is what the
  Japanese terms on screen need.
