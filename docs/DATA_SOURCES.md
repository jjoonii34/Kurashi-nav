# Data sources

Every external dataset this service uses, how it is used, and the credit it
requires. The same entries are served at `GET /v1/meta/sources` and must be
shown under every result in the UI. Re-check each row before launch and
whenever monetisation is considered.

| ID | Data | Provider | How it is used | Terms | Credit shown | Last checked |
|---|---|---|---|---|---|---|
| `reinfolib` | 不動産情報ライブラリ API: XKT002 用途地域, XKT004/005 小・中学校区, XKT025 液状化, XKT026 洪水, XKT027 高潮, XKT028 津波, XKT029 土砂災害, XPT001 取引価格 | 国土交通省 (MLIT) | Server-side only (the manual asks callers not to call from browsers). Fetched per XYZ tile (z11–15), cached 24h, point-in-polygon / nearest points, properties filtered to an allow-list. | API利用規約 — application and key required. **TODO: read the full terms on key issuance and record the required credit wording (Art. 7) here and in `internal/source`.** | `出典：国土交通省「不動産情報ライブラリ」（加工して作成）` *(placeholder until the terms are confirmed)* | API list & params: 2026-11-19 |
| `gsi_tiles` | 地理院タイル (background map) | 国土地理院 (GSI) | Loaded directly by the frontend map (Leaflet, ADR-0009): the 淡色地図 `pale` layer, zoom 5–18. | Real-time tile loading needs no application; credit and a link are required. | `地理院タイル` linked to the tile list page | 2026-11 |
| `n03_boundaries` | 国土数値情報 行政区域データ (N03, as of 2021-01-01) | 国土交通省 | Bundled with the frontend as `web/public/data/municipalities-2021.topo.json`, the 1% simplification published by スマートニュース メディア研究所 (smartnews-smri/japan-topography). Used only to search for a region and outline it on the map (ADR-0013). | The N03 page lists 2018 and later as open data; the current download-site terms ask for the source and a note that the data was edited. The derivative's README asks for no credit of its own. | `国土数値情報（行政区域データ）を加工` linked to the N03 page, shown on the map with an outline | 2026-11 |
| `geolonia_addresses` | Geolonia 住所データ (latest.csv, fetched 2026-11-22) | 株式会社 Geolonia, from 国土交通省 位置参照情報 and 日本郵便 郵便番号データ | Municipality readings (katakana, romaji) become `web/public/data/municipality-names.json` (`web/scripts/build-names.ts`); town names, readings and centre points become `web/public/data/towns/NN.json` (`web/scripts/build-towns.ts`). Both are for the place search only (ADR-0013). The CSV itself is not in the repository. | CC BY 4.0 | `Geolonia 住所データ` linked to the project page, shown on the map with an outline | 2026-11 |
| `opencc_characters` | OpenCC character tables (JPShinjitaiCharacters.txt, TSCharacters.txt, fetched 2026-11-22) | BYVoid/OpenCC contributors | Reduced by `web/scripts/build-hanzi.ts` to the kanji used in the bundled place names (`web/geo/hanzi.ts`), so the place search accepts and shows simplified and traditional Chinese forms (ADR-0013). | Apache-2.0 | Named in the header of `web/geo/hanzi.ts`; no credit is required on screen | 2026-11 |
| `dummy` | Dummy data | this project | `DATA_MODE=fake` only. Every feature carries `"_dummy": true`. | — | `DUMMY DATA — not real` | — |

## Notes per source

### 不動産情報ライブラリ (MLIT)

- Several layers re-publish **国土数値情報** datasets. Some 国土数値情報
  datasets restrict commercial use. A non-commercial portfolio is fine;
  before any paid feature, check each underlying dataset's own terms.
- Transaction prices are aggregated (points sit at the nearest station).
  Do not build features that try to re-identify individual transactions.
- The transaction section carries a derived `price_summary`: quartiles of
  price ÷ area over the nearest records (at most 20) that have both values.
  It mixes property types. The parser for the price, area and period strings
  follows the dummy data and has not been checked against a live XPT001
  response yet.
- Transaction lookups read a 2×2 block of tiles (4 requests on a cold cache)
  so that records just across a tile edge are found. Whether the API repeats
  a record in two neighbouring tiles has not been checked against a live
  response yet.
- Requests must be spaced out; the client enforces a token bucket
  (`REINFOLIB_RPS`, `REINFOLIB_BURST`).

### Reference rules used by the room API (`internal/room`)

| Rule | Source | Used for |
|---|---|---|
| 1畳 = at least 1.62㎡ in listings | 不動産の表示に関する公正競争規約 (不動産公正取引協議会連合会) | 畳 ↔ ㎡ conversion |
| Minimum DK size: 4.5畳 (1 room) / 6畳 (2+ rooms); minimum LDK: 8畳 / 10畳 | 不動産公正取引協議会 advertising guideline | `min_size_guideline` in `/v1/room/layout` |
| Regional tatami sizes (京間 955×1910, 中京間 910×1820, 江戸間 880×1760, 団地間 850×1700 mm) | Common industry values | `by_regional_tatami` |
| Furniture sizes, 2.4m ceiling | Typical values, not a specific product | 3D preview scale only |

Rules, not datasets: no licence applies, but the UI labels all room figures as approximate.

### Planned (not used yet)

| Data | Provider | Planned use | Terms to follow |
|---|---|---|---|
| 原状回復をめぐるトラブルとガイドライン | 国土交通省 | Move-out checklist, unofficial translation | 政府標準利用規約 (CC BY 4.0 compatible): credit, state that it was edited/translated, must not look government-authored |
| 外国人の民間賃貸住宅入居円滑化ガイドライン | 国土交通省 | Contract glossary, unofficial translation | as above |
| アドレス・ベース・レジストリ | デジタル庁 | Own geocoder (address → coordinate) | per dataset terms |

## Planned for v1.1 — not used yet, everything below is unverified

Requirements: `docs/requirements/v1.1-v1.2.md`. Nothing in this section
is implemented. Each item is confirmed by a real call or by reading the
official terms before any code relies on it.

| Source | Provider | Planned use | To verify |
|---|---|---|---|
| 住宅・土地統計調査 (令和5年) via e-Stat API | 総務省統計局 | Average private rent per municipality, embedded as a static table (ADR-0010) | `statsDataId` of the table with rent per month and per ㎡ for 民営借家 (専用住宅) by municipality; which municipalities are published; how suppressed cells are marked; terms and credit |
| J-SHIS 地震ハザードステーション API | 防災科学技術研究所 | Probability of strong shaking, looked up by mesh code (ADR-0011) | Endpoint URL and version, `case` and `eqcode` parameters, name of the "震度6弱以上 in 30 years" field, mesh level, rate limit, terms and credit |
| 不動産情報ライブラリ (existing layers) | 国土交通省 | Municipality code for the rent comparison | Whether any of the nine layers already returns a municipality code |
| 不動産情報ライブラリ (facility layers) | 国土交通省 | Medical facilities and similar (P2) | API IDs; whether the calls fit the rate budget |
| 昭和45年建設省告示第1552号 | 国土交通省 | Legal basis of the brokerage-fee warnings already in `internal/cost` | Wording of the cap and of the tenant-consent rule against the current text |

## Deliberately not used

| Source | Why not |
|---|---|
| REINS | For licensed brokers only; not open to individuals or outside services. |
| Listing portals (SUUMO, HOME'S, at home, …) | Scraping violates their terms and invites legal risk. Users type in what they see. See ADR-0004. |
| Listing photos (for 3D models or anything else) | Can be copyrighted works; a 3D reconstruction is an adaptation. See ADR-0006. |
| Undocumented GSI address-search endpoint | Not a published API, no availability guarantee. Not on the critical path (ADR-0005). |
| User-generated reviews | Defamation and moderation risk; not in the MVP. |

## User input

Coordinates, addresses and cost estimates are processed in memory to build
one response and then discarded: not stored, not logged, not sent to any
third party (including AI APIs). See ADR-0002.
