# ADR-0013: Place search from bundled open data

- Status: accepted
- Date: 2026-11-22

## Context

Moving the map from Tokyo Station by hand is slow. ADR-0002 forbids sending
what the user types to a third party; ADR-0005 keeps geocoding off the
critical path.

Options: a geocoding service (sends the query out), a hand-written list of
places (few places, no outline), or bundled official data.

## Decision

Ship the data with the frontend and match in the browser.

| File | Source | Made by |
|---|---|---|
| `web/public/data/municipalities-2021.topo.json` (1.5 MB) | 国土数値情報 N03, 2021-01-01, simplified to 1% | smartnews-smri/japan-topography |
| `web/public/data/municipality-names.json` (77 KB) | Geolonia 住所データ readings | `web/scripts/build-places.ts` |
| `web/public/data/towns/NN.json` (47 files, 6.3 MB) | Geolonia 住所データ | same script |
| `web/geo/hanzi.ts` (8 KB) | OpenCC character tables | `web/scripts/build-hanzi.ts` |

- **Search:** prefecture, city with wards, municipality; then towns inside
  the chosen municipality. Files load on first use; towns load per prefecture.
- **Names:** English is the reading in Hepburn, Korean is the reading in
  Hangul by the NIKL rules (`web/geo/kana.ts`). The generator stops if a
  reading does not match Japan Post's romaji. Chinese is a kanji-by-kanji
  rewrite. Prefectures are a hand-written table.
- **Matching:** ㅋ/ㄱ, ㅌ/ㄷ, ㅆ/ㅉ/ㅊ/ㅈ count as the same initial; 浜, 滨 and
  濱 as the same character (`web/geo/match.ts`).
- **Display:** names follow the script that was typed, not the page language
  (`web/geo/script.ts`).
- **Outline:** members of a prefecture or city are merged with
  `topojson-client`. A town has no shape; the map moves to its centre.
- **Tap:** the municipality under a tap is found by ray casting
  (`web/geo/locate.ts`) and outlined without moving the map.
- The search and the tap only move or mark the map. The location sent to the
  API is still the pin (ADR-0005).

## Consequences

- One runtime package (`topojson-client`), three type packages, about 8 MB of
  data in the repository.
- Boundaries are from 2021 and simplified: a tap on a border may pick the
  neighbour.
- Korean names are converted by rule, not checked one by one.
- Eight municipalities (six Northern Territories villages, 利島村, 湯前町)
  and about one town in four have no reading: Japanese name only.
- Kana names (さいたま市) stay in kana in Chinese. A query in characters
  shared by both languages (新宿) is treated as Japanese.
- 丁目 are folded into their town. No street, station or building search.
- Credits are always shown on the map and under the home search box.
