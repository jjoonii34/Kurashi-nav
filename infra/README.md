# Infrastructure (phase 2 — not started)

Two providers, one job each (ADR-0007):

| Part | Where | Why |
|---|---|---|
| Frontend (`web/`, Next.js static export) | **Cloudflare** Workers static assets | Free and unlimited static requests, global edge, no SSR needed |
| API (Go, this repo's root) | **Google Cloud Run**, `asia-northeast1` (Tokyo) | Runs the Docker image as-is, scales to zero, close to the MLIT API |

The backend is already deployment-ready: one static binary, configured by
environment variables, listening on `$PORT`, logging JSON with Cloud Logging
field names, shutting down gracefully on `SIGTERM`, with `/healthz` for probes.

```
                    ┌──────────── Cloudflare ────────────┐
Browser ──HTML/JS──▶│ Worker (assets-only): web/out/      │
   │                │ (phase 2: /api/* proxy Worker)      │
   │                └─────────────────────────────────────┘
   │ HTTPS JSON (CORS: ALLOWED_ORIGINS)
   ▼
┌──────────────────────── Google Cloud (Tokyo) ─────────────────────────┐
│ Cloud Run (api) ── env: DATA_MODE=live, LOG_FORMAT=json               │
│        └─ secret REINFOLIB_API_KEY ◀── Secret Manager                 │
│ Artifact Registry ◀── GitHub Actions (OIDC / Workload Identity Fed.)  │
│ Cloud Logging / Monitoring                                            │
└───────────────────────────────────────────────────────────────────────┘
```

## Checklist — Cloudflare (frontend)

1. [ ] Cloudflare account; `npx wrangler login`
2. [ ] `web/wrangler.jsonc`:
   ```jsonc
   {
     "name": "kurashi-nav-web",
     "compatibility_date": "YYYY-MM-DD", // the day you create it
     "assets": { "directory": "./out", "not_found_handling": "404-page" }
   }
   ```
3. [ ] First deploy: `npm run build && npx wrangler deploy` → note the `*.workers.dev` URL
4. [ ] Auto-deploy: Cloudflare Git integration (Workers Builds) **or** GitHub Actions
       with `wrangler deploy` and a scoped `CLOUDFLARE_API_TOKEN` secret — record the choice in an ADR
5. [ ] Custom domain on the Worker (domain via Cloudflare Registrar or elsewhere, DNS on Cloudflare)
6. [ ] (Phase 2, optional) proxy Worker: `run_worker_first: ["/api/*"]` → Cloud Run;
       edge-cache `/v1/room/*`; never log request bodies

## Checklist — Google Cloud (API)

1. [ ] Project, billing **budget alert** (e.g. ¥1,000/month), APIs enabled
2. [ ] Artifact Registry repository (Docker, Tokyo)
3. [ ] Secret Manager: `reinfolib-api-key`
4. [ ] Service account for Cloud Run with only `secretAccessor` on that secret
5. [ ] Cloud Run service: min instances 0, max 2, 256 MiB, concurrency 80,
       request timeout ≥ `REQUEST_TIMEOUT`;
       `ALLOWED_ORIGINS` = the workers.dev URL and the custom domain
6. [ ] Workload Identity Federation for GitHub Actions (deploy role only)
7. [ ] `cd.yml`: on tag → build → push → deploy → smoke test `/healthz`
8. [ ] Terraform in `infra/terraform/`, state in a GCS bucket
       (decide whether Cloudflare resources go in the same Terraform)
9. [ ] Uptime check on `/healthz`; alert on 5xx rate and `layer lookup failed` count

## Things to decide then

- Workers Builds vs. GitHub Actions for frontend deploys
- Cloud Run vs. a small VM (cost model, cold starts)
- Whether the tile cache should move to a shared store when running >1 instance
- Terraform vs. plain CLI scripts for a one-person project
