"use client";

import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  JAPAN_BOUNDS,
  TOKYO_STATION,
  isInJapan,
  type Point,
} from "@/geo/japan";
import type { Dictionary } from "@/i18n/dictionary";
import type { Lang } from "@/i18n/langs";
import { useLocation } from "@/state/location";

const GSI_PALE_TILES = "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png";
const GSI_CREDIT =
  '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>';

type Props = {
  lang: Lang;
  dict: Dictionary;
};

export function LocationPicker({ lang, dict }: Props) {
  const router = useRouter();
  const { point: saved, setPoint: save } = useLocation();
  const [point, setPoint] = useState<Point>(saved ?? TOKYO_STATION);
  const [moving, setMoving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const start = useRef(point);

  useEffect(() => {
    let cancelled = false;

    // Leaflet reads `window` when it loads, so it cannot be imported while
    // the page is prerendered at build time.
    import("leaflet").then(({ default: L }) => {
      if (cancelled || container.current === null) {
        return;
      }
      const created = L.map(container.current, {
        center: [start.current.lat, start.current.lon],
        zoom: 16,
        minZoom: 5,
        maxZoom: 18,
        maxBounds: [
          [JAPAN_BOUNDS.minLat, JAPAN_BOUNDS.minLon],
          [JAPAN_BOUNDS.maxLat, JAPAN_BOUNDS.maxLon],
        ],
        maxBoundsViscosity: 1,
        zoomControl: false,
      });
      created.attributionControl.setPosition("bottomleft");
      L.tileLayer(GSI_PALE_TILES, { attribution: GSI_CREDIT }).addTo(created);

      created.on("movestart", () => setMoving(true));
      created.on("moveend", () => {
        const center = created.getCenter();
        setPoint({ lat: center.lat, lon: center.lng });
        setMoving(false);
      });
      map.current = created;
    });

    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  function moveToCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setNotice(dict.locateFailed);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const here = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        if (!isInJapan(here)) {
          setNotice(dict.locateOutside);
          return;
        }
        setNotice(null);
        map.current?.setView([here.lat, here.lon], 17);
      },
      () => setNotice(dict.locateFailed),
    );
  }

  function confirm() {
    save(point);
    router.push(`/${lang}/estimate`);
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="relative h-[50dvh] shrink-0">
        <div
          ref={container}
          role="application"
          aria-label={dict.mapLabel}
          className="absolute inset-0 z-0 bg-surface"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-10"
        >
          <span
            className={`absolute left-0 top-0 block h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/25 transition-all duration-150 motion-reduce:transition-none ${
              moving ? "w-2" : "w-3.5"
            }`}
          />
          <svg
            width="36"
            height="46"
            viewBox="0 0 36 46"
            className={`absolute left-0 top-0 -translate-x-1/2 transition-transform duration-150 motion-reduce:transition-none ${
              moving ? "-translate-y-[calc(100%+10px)]" : "-translate-y-full"
            }`}
          >
            <path
              d="M18 45C18 45 34 28.6 34 17A16 16 0 0 0 2 17C2 28.6 18 45 18 45Z"
              className="fill-pin stroke-white"
              strokeWidth="2"
            />
            <circle cx="18" cy="17" r="5.5" className="fill-white" />
          </svg>
        </div>

        <button
          type="button"
          onClick={moveToCurrentLocation}
          aria-label={dict.locate}
          className="absolute bottom-8 right-4 z-10 flex size-11 items-center justify-center rounded-full bg-white text-ink shadow-[0_1px_6px_rgba(0,0,0,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:bg-surface"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="6.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" />
          </svg>
        </button>
      </div>

      <section className="relative z-10 -mt-4 flex-1 rounded-t-2xl bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <h1 className="text-balance break-keep text-lg font-bold leading-snug">{dict.pickerTitle}</h1>
        <p className="mt-1 text-sm tabular-nums text-ink-muted">
          {point.lat.toFixed(5)}, {point.lon.toFixed(5)}
        </p>
        <p role="status" className="mt-2 text-sm text-ink empty:hidden">
          {notice}
        </p>
        <button
          type="button"
          onClick={confirm}
          className="mt-4 h-13 w-full rounded-xl bg-brand text-base font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:bg-brand-pressed"
        >
          {dict.confirmLocation}
        </button>
      </section>
    </main>
  );
}
