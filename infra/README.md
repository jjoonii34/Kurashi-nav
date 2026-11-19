# Infrastructure (phase 2 — not started)

The backend is already deployment-ready: one static binary, configured by
environment variables, listening on `$PORT`, logging JSON with Cloud Logging
field names, shutting down gracefully on `SIGTERM`, with `/healthz` for
probes. This directory will hold the infrastructure code.

## Target

Google Cloud, region `asia-northeast1` (Tokyo).

```
GitHub ──(OIDC, no JSON keys)──▶ Workload Identity Federation
   │ tag v*                              │
   ▼                                     ▼
GitHub Actions ──docker push──▶ Artifact Registry ──deploy──▶ Cloud Run (api)
                                                          │   ├─ env: DATA_MODE=live, LOG_FORMAT=json
                                                          │   └─ secret: REINFOLIB_API_KEY ◀── Secret Manager
                                                          ▼
                                                   Cloud Logging / Monitoring
```

## Checklist

1. [ ] Project, billing **budget alert** (e.g. ¥1,000/month), APIs enabled
2. [ ] Artifact Registry repository (Docker, Tokyo)
3. [ ] Secret Manager: `reinfolib-api-key`
4. [ ] Service account for Cloud Run with only `secretAccessor` on that secret
5. [ ] Cloud Run service: min instances 0, max 2, 256 MiB, concurrency 80,
       request timeout ≥ `REQUEST_TIMEOUT`
6. [ ] Workload Identity Federation for GitHub Actions (deploy role only)
7. [ ] `cd.yml`: on tag → build → push → deploy → smoke test `/healthz`
8. [ ] Terraform for all of the above in `infra/terraform/`, state in a GCS bucket
9. [ ] Uptime check on `/healthz`; alert on 5xx rate and `layer lookup failed` count
10. [ ] Frontend hosting (Next.js) and `ALLOWED_ORIGINS`
11. [ ] Custom domain + managed certificate

## Things to decide then

- Cloud Run vs. a small VM (cost model, cold starts)
- Whether the tile cache should move to Memorystore when running >1 instance
- Terraform vs. plain `gcloud` scripts for a one-person project
