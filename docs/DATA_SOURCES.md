# Data sources

Every external dataset this service uses, how it is used, and the credit it
requires. The same entries are served at `GET /v1/meta/sources` and must be
shown under every result in the UI. Re-check each row before launch and
whenever monetisation is considered.

| ID | Data | Provider | How it is used | Terms | Credit shown | Last checked |
|---|---|---|---|---|---|---|
| `reinfolib` | 不動産情報ライブラリ API: XKT002 用途地域, XKT004/005 小・中学校区, XKT025 液状化, XKT026 洪水, XKT027 高潮, XKT028 津波, XKT029 土砂災害, XPT001 取引価格 | 国土交通省 (MLIT) | Server-side only (the manual asks callers not to call from browsers). Fetched per XYZ tile (z11–15), cached 24h, point-in-polygon / nearest points, properties filtered to an allow-list. | API利用規約 — application and key required. **TODO: read the full terms on key issuance and record the required credit wording (Art. 7) here and in `internal/source`.** | `出典：国土交通省「不動産情報ライブラリ」（加工して作成）` *(placeholder until the terms are confirmed)* | API list & params: 2026-11-19 |
| `gsi_tiles` | 地理院タイル (background map) | 国土地理院 (GSI) | Loaded directly by the frontend map (Leaflet / MapLibre). | Real-time tile loading needs no application; credit and a link are required. | `地理院タイル` linked to the tile list page | 2026-11 |
| `dummy` | Dummy data | this project | `DATA_MODE=fake` only. Every feature carries `"_dummy": true`. | — | `DUMMY DATA — not real` | — |

## Notes per source

### 不動産情報ライブラリ (MLIT)

- Several layers re-publish **国土数値情報** datasets. Some 国土数値情報
  datasets restrict commercial use. A non-commercial portfolio is fine;
  before any paid feature, check each underlying dataset's own terms.
- Transaction prices are aggregated (points sit at the nearest station).
  Do not build features that try to re-identify individual transactions.
- Requests must be spaced out; the client enforces a token bucket
  (`REINFOLIB_RPS`, `REINFOLIB_BURST`).

### Planned (not used yet)

| Data | Provider | Planned use | Terms to follow |
|---|---|---|---|
| 原状回復をめぐるトラブルとガイドライン | 国土交通省 | Move-out checklist, unofficial translation | 政府標準利用規約 (CC BY 4.0 compatible): credit, state that it was edited/translated, must not look government-authored |
| 外国人の民間賃貸住宅入居円滑化ガイドライン | 国土交通省 | Contract glossary, unofficial translation | as above |
| アドレス・ベース・レジストリ | デジタル庁 | Own geocoder (address → coordinate) | per dataset terms |

## Deliberately not used

| Source | Why not |
|---|---|
| Listing portals (SUUMO, HOME'S, at home, …) | Scraping violates their terms and invites legal risk. Users type in what they see. See ADR-0004. |
| Undocumented GSI address-search endpoint | Not a published API, no availability guarantee. Not on the critical path (ADR-0005). |
| User-generated reviews | Defamation and moderation risk; not in the MVP. |

## User input

Coordinates, addresses and cost estimates are processed in memory to build
one response and then discarded: not stored, not logged, not sent to any
third party (including AI APIs). See ADR-0002.
