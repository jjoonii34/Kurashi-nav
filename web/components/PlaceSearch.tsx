"use client";

import { useEffect, useState } from "react";
import { loadAtlas, loadTowns } from "@/geo/atlas";
import { searchRegions, type Region } from "@/geo/regions";
import { nameIn, scriptOf } from "@/geo/script";
import { searchTowns, type Town } from "@/geo/towns";
import type { Dictionary } from "@/i18n/dictionary";
import { useCheck } from "@/state/check";

type Props = {
  dict: Dictionary;
};

type Loaded = { code: string; towns: Town[] };

const SHADOW = "shadow-[0_1px_8px_rgba(0,0,0,0.22)]";
const ITEM =
  "flex w-full items-baseline gap-2 px-5 py-3.5 text-left focus-visible:bg-surface focus-visible:outline-none active:bg-surface";

// A name in the script of the search followed by the Japanese one, or the
// Japanese name alone when there is no other.
function Name({ alias, japanese }: { alias?: string; japanese: string }) {
  return (
    <>
      {alias && <span className="font-semibold">{alias}</span>}
      <span lang="ja" className={alias ? "text-sm text-ink-muted" : "font-semibold"}>
        {japanese}
      </span>
    </>
  );
}

// Search for a prefecture, city or municipality, then for a town inside the
// chosen municipality. The choice goes to the shared state; the map reads it.
export function PlaceSearch({ dict }: Props) {
  const { place, setPlace } = useCheck();
  const [query, setQuery] = useState("");
  const [regions, setRegions] = useState<Region[] | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);

  const code = place?.region.code;
  useEffect(() => {
    if (code === undefined) {
      return;
    }
    let cancelled = false;
    loadTowns(code)
      .then((towns) => {
        if (!cancelled) {
          setLoaded({ code, towns });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  function loadRegions() {
    if (regions !== null) {
      return;
    }
    loadAtlas()
      .then((atlas) => {
        setFailed(false);
        setRegions(atlas.regions);
      })
      .catch(() => setFailed(true));
  }

  const towns = loaded !== null && loaded.code === code ? loaded.towns : [];
  const foundTowns = searchTowns(towns, query);
  // With no town by that name, the same words may be another region.
  const foundRegions =
    foundTowns.length > 0 || regions === null
      ? []
      : searchRegions(regions, query);
  const searching = query.trim() !== "" && regions !== null;
  // Korean in, Korean out: results are named in the script that was typed.
  const script = scriptOf(query);

  function chooseRegion(region: Region) {
    setPlace({ region, town: null, script });
    setQuery("");
  }

  function chooseTown(town: Town) {
    if (place !== null) {
      setPlace({ region: place.region, town, script });
      setQuery("");
    }
  }


  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (foundTowns.length > 0) {
          chooseTown(foundTowns[0]);
        } else if (foundRegions.length > 0) {
          chooseRegion(foundRegions[0]);
        }
      }}
      className="relative text-ink"
    >
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={loadRegions}
        placeholder={
          code === undefined ? dict.searchPlaceholder : dict.searchTownPlaceholder
        }
        aria-label={dict.searchLabel}
        autoComplete="off"
        className={`h-13 w-full rounded-2xl bg-white px-5 text-base outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-brand ${SHADOW}`}
      />

      {searching && (
        <ul
          className={`absolute inset-x-0 top-13 z-30 mt-2 max-h-[40dvh] overflow-y-auto rounded-2xl bg-white ${SHADOW}`}
        >
          {foundTowns.map((town) => (
            <li key={`${town.name}-${town.lat}-${town.lon}`}>
              <button type="button" onClick={() => chooseTown(town)} className={ITEM}>
                <Name
                  alias={nameIn(script, town.name, town.alias)}
                  japanese={town.name}
                />
              </button>
            </li>
          ))}
          {foundRegions.map((region) => (
            <li key={region.id}>
              <button
                type="button"
                onClick={() => chooseRegion(region)}
                className={ITEM}
              >
                <Name
                  alias={nameIn(script, region.label, region.alias)}
                  japanese={region.label}
                />
              </button>
            </li>
          ))}
          {foundTowns.length === 0 && foundRegions.length === 0 && (
            <li className="px-5 py-3.5 text-sm text-ink-muted">
              {dict.searchNoResult}
            </li>
          )}
        </ul>
      )}

      {place !== null && (
        <p
          className={`mt-2 flex items-center gap-2 rounded-2xl bg-white py-1 pl-5 pr-1 ${SHADOW}`}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
            <Name
              alias={nameIn(place.script, place.region.label, place.region.alias)}
              japanese={place.region.label}
            />
            {place.town !== null && (
              <Name
                alias={nameIn(place.script, place.town.name, place.town.alias)}
                japanese={place.town.name}
              />
            )}
          </span>
          <button
            type="button"
            onClick={() => setPlace(null)}
            aria-label={dict.searchClear}
            className="flex size-10 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-brand active:bg-surface"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </p>
      )}

      <p
        role="status"
        className={`mt-2 rounded-2xl bg-white px-5 py-3 text-sm empty:hidden ${SHADOW}`}
      >
        {failed ? dict.searchLoadFailed : null}
      </p>
    </form>
  );
}
