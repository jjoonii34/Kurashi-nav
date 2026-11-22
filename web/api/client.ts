import type { components } from "./schema";

type Schemas = components["schemas"];

export type CheckRequest = Schemas["CheckRequest"];
export type Report = Schemas["Report"];
export type Section = Schemas["Section"];
export type CostResult = Schemas["CostResult"];
export type RoomSize = Schemas["RoomSize"];
export type Furniture = Schemas["Furniture"];
export type RoomLayout = Schemas["RoomLayout"];

// Why a call produced no data, in terms the screen can explain:
// network — the API could not be reached; invalid — the API rejected the
// input (400 / 422); server — the API failed or sent an unreadable answer.
export type ApiFailure = "network" | "invalid" | "server";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: ApiFailure };

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

// The only place the frontend talks to the Go API. It never throws: every
// outcome comes back as an ApiResult.
async function call<T>(path: string, init: RequestInit): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, init);
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
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false, reason: "server" };
  }
}

export function checkHousing(
  request: CheckRequest,
  signal: AbortSignal,
): Promise<ApiResult<Report>> {
  return call<Report>("/v1/housing/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });
}

export type RoomQuery = { unit: "jo" | "area_sqm"; value: number };

export function getRoomSize(
  query: RoomQuery,
  lang: string,
  signal: AbortSignal,
): Promise<ApiResult<RoomSize>> {
  const params = new URLSearchParams({
    [query.unit]: String(query.value),
    lang,
  });
  return call<RoomSize>(`/v1/room/size?${params}`, { signal });
}

export function getRoomLayout(
  code: string,
  lang: string,
  signal: AbortSignal,
): Promise<ApiResult<RoomLayout>> {
  const params = new URLSearchParams({ code, lang });
  return call<RoomLayout>(`/v1/room/layout?${params}`, { signal });
}
