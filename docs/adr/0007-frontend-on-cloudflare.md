# ADR-0007: Frontend on Cloudflare (static export), API stays on Cloud Run

- Status: accepted
- Date: 2026-11-19

## Context

The frontend is a Next.js + TypeScript app (`web/`). Every screen works in
the browser: map pin, cost form, result cards, the Three.js room preview.
Nothing needs server-side rendering, and the location data must come from
our Go API anyway (the MLIT manual forbids calling its API from browsers).

Cloudflare serves static assets from Workers at no cost and without a
request limit. For full Next.js features on Workers, Cloudflare currently
recommends vinext (beta) and keeps the OpenNext adapter for existing apps;
both add an adapter layer this app does not need.

## Decision

- Build the frontend with Next.js **static export** (`output: "export"`) and
  deploy the `out/` directory as an **assets-only Cloudflare Worker**
  (`web/wrangler.jsonc` with `assets.directory = "./out"`).
- No SSR, route handlers, middleware, server actions or ISR in `web/`.
  Languages are static routes (`/en`, `/ko`, `/ja`) via `generateStaticParams`.
- **Phase 1:** the browser calls the Go API on Cloud Run directly
  (`NEXT_PUBLIC_API_BASE_URL`), allowed by `ALLOWED_ORIGINS` CORS.
- **Phase 2 (optional):** add a small Worker script with
  `run_worker_first: ["/api/*"]` that proxies to Cloud Run — same origin, no
  CORS, backend URL hidden, `/v1/room/*` cacheable at the edge.
- The Go API stays on Cloud Run in Tokyo. Workers do not run Go natively;
  Cloudflare Containers (GA 2026-04) require the Workers Paid plan. Revisit
  only if Cloud Run becomes a problem.

## Consequences

- Hosting the frontend is free; static requests do not consume Worker invocations.
- No vendor-specific Next.js adapter; the same `out/` folder can move to any CDN.
- Two providers to operate (Cloudflare + Google Cloud). Each gets its own
  section in `infra/README.md`.
- In phase 2 user input passes through a Cloudflare Worker: it must not log
  request bodies, and the privacy policy must name Cloudflare as a processor.
