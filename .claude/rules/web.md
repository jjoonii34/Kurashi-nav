---
paths:
  - "web/**"
---

# Frontend rules (`web/`) — Next.js static export on Cloudflare (ADR-0007)

- `next.config` sets `output: "export"` and `images: { unoptimized: true }`.
  Do not add route handlers (`app/api`), middleware, server actions, ISR,
  `cookies()` / `headers()`, or anything else that needs a Node server.
- Languages are static routes: `app/[lang]/...` with `generateStaticParams`
  returning `en`, `ko`, `ja`. `/` shows a language picker (no server redirect).
- All data comes from the Go API through one typed client module.
  Base URL from `NEXT_PUBLIC_API_BASE_URL` (dev: `http://localhost:8080`).
  Types come from `docs/openapi.yaml` once it exists (M1-6).
- Never call the MLIT API from the browser. Never put any secret in a
  `NEXT_PUBLIC_*` variable: it ships to every visitor.
- Do not persist user input (coordinates, rent) in localStorage, cookies or
  analytics. A language choice may be remembered.
- Map: MapLibre GL or Leaflet with 地理院タイル; always render the
  "地理院タイル" credit with a link. Sources from `/v1/meta/sources` go in the footer.
- 3D room preview: react-three-fiber, data from `/v1/room/size`; load it
  client-side only (dynamic import, `ssr: false`).
- Deploy: `npm run build` → `wrangler deploy` with `web/wrangler.jsonc`
  (`assets.directory = "./out"`, `not_found_handling = "404-page"`).
- Commands: `npm run dev`, `npm run lint`, `npm run build`. Run lint and build
  before declaring a frontend task done.
