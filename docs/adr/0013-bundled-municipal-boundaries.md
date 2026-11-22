# ADR-0013: Region search from bundled municipal boundaries

- Status: accepted
- Date: 2026-11-22

## Context

Moving the map from Tokyo Station to another city by hand is slow. The owner
wants to type a prefecture, city or ward and have the map jump there with
the area outlined. ADR-0005 keeps address geocoding off the critical path,
and ADR-0002 forbids sending what the user types to a third party.

Options considered:

- **A geocoding service** — finds any address, but sends the query to a
  third party and adds a dependency ADR-0005 avoided.
- **A hand-written list of place coordinates** — small, but only a few
  dozen places, no outline, and the coordinates are unverified.
- **Bundled official boundaries** — every municipality with its real
  outline, matched in the browser.

## Decision

- Ship 国土数値情報 行政区域データ (N03, boundaries as of 2021-01-01) as one
  TopoJSON file, `web/public/data/municipalities-2021.topo.json` (1.5 MB,
  simplified to 1% by スマートニュース メディア研究所).
- The browser fetches it from our own origin the first time the search box
  is focused, builds the search list from it (`web/geo/regions.ts`) and
  matches the query locally. Nothing typed leaves the browser.
- A prefecture, or a city with wards, is outlined by merging its members
  with `topojson-client`.
- Every municipality is also found by an English and a Korean name. The
  boundary data has Japanese names only, so `web/scripts/build-names.ts`
  makes `web/public/data/municipality-names.json` (77 KB) from the katakana
  reading and Japan Post romaji in Geolonia 住所データ (CC BY 4.0): the
  English name is the reading in Hepburn, the Korean name is the reading
  written in Hangul by the National Institute of Korean Language rules
  (`web/scripts/kana.ts`). The generator refuses a name whose reading does
  not match the published romaji. Prefecture names are a hand-written table
  (`web/geo/regionAliases.ts`).
- Hangul queries are compared with ㅋ/ㄱ, ㅌ/ㄷ and ㅆ/ㅉ/ㅊ/ㅈ treated as the
  same initial, because people write 고마에 and 코마에 for the same place.
- Results are named in the script of the query, not of the page: Hangul in,
  Korean names out; Latin letters, English; kana or kanji, Japanese
  (`web/geo/script.ts`).
- Chinese is supported for search only. `web/scripts/build-hanzi.ts` makes
  `web/geo/hanzi.ts` from the OpenCC character tables (Apache-2.0): for each
  kanji used in the bundled names, its simplified and traditional form.
  横浜, 横滨 and 橫濱 match the same place, and a query with a form Japanese
  names never use is answered with the name in that Chinese form.
- Tapping the map outlines the municipality under the finger without moving
  the map: the boundaries are decoded once and tested with ray casting
  (`web/geo/locate.ts`). The tapped point never leaves the browser.
- After a municipality is chosen, the same box searches its towns (大字・町).
  `web/scripts/build-towns.ts` writes one file per prefecture,
  `web/public/data/towns/NN.json` (47 files, 6.3 MB in total, 120,127 towns),
  from the same address data: name, katakana reading and a centre point,
  with 一丁目, 二丁目 … folded into one town. Only the file of the chosen
  prefecture is fetched. A town has no boundary in this data, so the map
  moves to its centre and keeps the municipality outlined.
- The home page asks the same question first; the choice is kept in memory
  (`web/state/check.tsx`) and the map opens on it.
- The search moves the map only. The pin and the location sent to the API
  are still set by the user, so ADR-0005 stands.

## Consequences

- Two more npm packages (`topojson-client` and its types) and about 8 MB of
  data files in the repository.
- Boundaries are from 2021 and simplified: fine for orientation, not for
  deciding which municipality a home on a border belongs to.
- Korean names are converted by rule, not checked one by one. A long vowel
  that is really two syllables may be dropped.
- Eight municipalities with no rows in the address data (six villages in
  the Northern Territories, 利島村, 湯前町) are found by Japanese name only.
- Towns are points, not shapes, and about one in eight has no reading, so
  it is found by its Japanese name only.
- Chinese names are a character-by-character rewrite of the Japanese name:
  kana names (さいたま市) stay in kana, and a query written only with
  characters shared by both languages (新宿, 大阪) is treated as Japanese.
- Chinese pages (`/zh`, Simplified) show Chinese names for a tapped region;
  the search still follows the script that was typed.
- No 丁目, street, station or building search.
- Both credits are shown on the map while an outline is drawn and recorded
  in `docs/DATA_SOURCES.md`.
