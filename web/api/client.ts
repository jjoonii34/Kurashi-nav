import type { components } from "./schema";

type Schemas = components["schemas"];

export type CheckRequest = Schemas["CheckRequest"];
export type Report = Schemas["Report"];
export type Section = Schemas["Section"];
export type CostResult = Schemas["CostResult"];
export type CostInput = Schemas["CostInput"];

// Why a check produced no report, in terms the screen can explain:
// network — the API could not be reached; invalid — the API rejected the
// input (4xx); server — the API failed (5xx or an unreadable answer).
export type CheckFailure = "network" | "invalid" | "server";

export type CheckResult =
  | { ok: true; report: Report }
  | { ok: false; reason: CheckFailure };

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// The only place the frontend talks to the Go API. It never throws: every
// outcome comes back as a CheckResult.
export async function checkHousing(
  request: CheckRequest,
  signal: AbortSignal,
): Promise<CheckResult> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/v1/housing/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });
  } catch {
    return { ok: false, reason: "network" };
  }

  if (response.status === 400 || response.status === 422) {
    return { ok: false, reason: "invalid" };
  }
  if (!response.ok) {
    return { ok: false, reason: "server" };
  }

  try {
    return { ok: true, report: (await response.json()) as Report };
  } catch {
    return { ok: false, reason: "server" };
  }
}
