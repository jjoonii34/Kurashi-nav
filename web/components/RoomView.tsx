"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  getRoomSize,
  type ApiFailure,
  type Furniture,
  type RoomQuery,
  type RoomSize,
} from "@/api/client";
import type { Dictionary } from "@/i18n/dictionary";
import { toApiLang, type Lang } from "@/i18n/langs";
import { clampToRoom, fits, footprint } from "@/room/placement";

// three.js needs a browser (WebGL), so the scene is never prerendered.
const RoomScene = dynamic(() => import("./RoomScene"), { ssr: false });

type Props = {
  lang: Lang;
  dict: Dictionary;
};

type State =
  | { status: "loading" }
  | { status: "failed"; reason: ApiFailure }
  | { status: "done"; size: RoomSize };

type Placed = {
  key: number;
  furniture: Furniture;
  x: number;
  z: number;
  rotated: boolean;
};

export function RoomView({ lang, dict }: Props) {
  const [unit, setUnit] = useState<RoomQuery["unit"]>("jo");
  const [text, setText] = useState("6");
  const [inputError, setInputError] = useState(false);
  const [query, setQuery] = useState<RoomQuery>({ unit: "jo", value: 6 });
  const [state, setState] = useState<State>({ status: "loading" });
  const [items, setItems] = useState<Placed[]>([]);
  const [selectedKey, setSelectedKey] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const nextKey = useRef(1);

  useEffect(() => {
    const controller = new AbortController();
    getRoomSize(query, toApiLang(lang), controller.signal).then((result) => {
      if (controller.signal.aborted) {
        return;
      }
      setState(
        result.ok
          ? { status: "done", size: result.data }
          : { status: "failed", reason: result.reason },
      );
    });
    return () => controller.abort();
  }, [query, lang]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = Number(text.normalize("NFKC").trim());
    if (!(value > 0)) {
      setInputError(true);
      return;
    }
    setInputError(false);
    setItems([]);
    setSelectedKey(null);
    setNotice(null);
    setState({ status: "loading" });
    setQuery({ unit, value });
  }

  const failureText: Record<ApiFailure, string> = {
    network: dict.resultFailedNetwork,
    invalid: dict.roomInvalid,
    server: dict.resultFailedServer,
  };

  const size = state.status === "done" ? state.size : null;
  const room = size
    ? { width: size.shape.width_m, depth: size.shape.depth_m }
    : null;
  const selected = items.find((item) => item.key === selectedKey);

  function add(furniture: Furniture) {
    if (room === null) {
      return;
    }
    if (!fits(footprint(furniture, false), room)) {
      setNotice(dict.furnitureTooBig.replace("{name}", furniture.name));
      return;
    }
    const key = nextKey.current++;
    setItems([...items, { key, furniture, x: 0, z: 0, rotated: false }]);
    setSelectedKey(key);
    setNotice(null);
  }

  function move(key: number, x: number, z: number) {
    if (room === null) {
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.key === key
          ? {
              ...item,
              ...clampToRoom(x, z, footprint(item.furniture, item.rotated), room),
            }
          : item,
      ),
    );
  }

  function rotateSelected() {
    if (room === null || selected === undefined) {
      return;
    }
    const turned = footprint(selected.furniture, !selected.rotated);
    if (!fits(turned, room)) {
      setNotice(dict.furnitureCannotTurn);
      return;
    }
    setNotice(null);
    setItems(
      items.map((item) =>
        item.key === selected.key
          ? {
              ...item,
              rotated: !item.rotated,
              ...clampToRoom(item.x, item.z, turned, room),
            }
          : item,
      ),
    );
  }

  function removeSelected() {
    setItems(items.filter((item) => item.key !== selectedKey));
    setSelectedKey(null);
    setNotice(null);
  }

  const number = new Intl.NumberFormat(lang, { maximumFractionDigits: 2 });

  return (
    <div className="mt-4">
      <p className="text-sm text-ink-muted">{dict.roomIntro}</p>

      <form onSubmit={submit} noValidate className="mt-4 flex gap-2">
        <div
          className={`flex h-12 min-w-0 flex-1 items-center rounded-lg border px-3 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand ${
            inputError ? "border-pin" : "border-line"
          }`}
        >
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            aria-label={dict.roomSizeLabel}
            aria-invalid={inputError ? true : undefined}
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-right text-base tabular-nums outline-none"
          />
          <select
            aria-label={dict.roomUnitLabel}
            value={unit}
            onChange={(event) =>
              setUnit(event.target.value as RoomQuery["unit"])
            }
            className="ml-2 h-10 bg-transparent text-base outline-none"
          >
            <option value="jo">畳</option>
            <option value="area_sqm">㎡</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-12 shrink-0 rounded-lg bg-brand px-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:bg-brand-pressed"
        >
          {dict.roomShow}
        </button>
      </form>
      {inputError && (
        <p className="mt-1 text-sm text-pin">{dict.roomInvalid}</p>
      )}

      {state.status === "loading" && (
        <p role="status" className="mt-6 text-ink-muted">
          {dict.roomLoading}
        </p>
      )}

      {state.status === "failed" && (
        <p role="alert" className="mt-6 rounded-xl bg-alert-surface p-4">
          {failureText[state.reason]}
        </p>
      )}

      {size !== null && room !== null && (
        <>
          <dl className="mt-5 grid grid-cols-4 divide-x divide-line rounded-xl bg-surface py-3 text-center">
            {[
              { value: size.jo, unit: "畳" },
              { value: size.area_sqm, unit: "㎡" },
              { value: size.pyeong, unit: dict.unitPyeong },
              { value: size.sq_ft, unit: "sq ft" },
            ].map((cell) => (
              <div key={cell.unit} className="flex flex-col-reverse px-1">
                <dt className="text-xs text-ink-muted">{cell.unit}</dt>
                <dd className="font-bold tabular-nums">
                  {number.format(cell.value)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-sm tabular-nums text-ink-muted">
            {dict.roomShape
              .replace("{w}", number.format(size.shape.width_m))
              .replace("{d}", number.format(size.shape.depth_m))}
          </p>

          <div className="mt-3 h-[42dvh] overflow-hidden rounded-2xl bg-surface lg:h-[52dvh]">
            <RoomScene
              room={{ ...room, ceiling: size.shape.ceiling_m }}
              items={items.map((item) => ({
                key: item.key,
                x: item.x,
                z: item.z,
                height: item.furniture.height_cm / 100,
                ...footprint(item.furniture, item.rotated),
              }))}
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
              onMove={move}
              label={dict.roomSceneLabel}
            />
          </div>

          <div className="mt-3 flex min-h-11 items-center gap-2">
            {selected ? (
              <>
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {selected.furniture.name}
                </span>
                <button
                  type="button"
                  onClick={rotateSelected}
                  className="h-11 shrink-0 rounded-lg border border-line px-4 font-semibold text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:bg-surface"
                >
                  {dict.furnitureTurn}
                </button>
                <button
                  type="button"
                  onClick={removeSelected}
                  className="h-11 shrink-0 rounded-lg border border-line px-4 font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:bg-surface"
                >
                  {dict.furnitureRemove}
                </button>
              </>
            ) : (
              <span className="text-sm text-ink-muted">
                {dict.furnitureHint}
              </span>
            )}
          </div>
          <p role="status" className="text-sm text-alert empty:hidden">
            {notice}
          </p>

          <h2 className="mt-5 font-bold">{dict.furnitureTitle}</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {size.reference_furniture.map((furniture) => (
              <li key={furniture.id}>
                <button
                  type="button"
                  onClick={() => add(furniture)}
                  className="rounded-full border border-line px-3.5 py-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:bg-surface"
                >
                  <span className="font-semibold">{furniture.name}</span>
                  <span className="ml-1.5 tabular-nums text-ink-muted">
                    {furniture.width_cm}×{furniture.depth_cm}cm
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-xs leading-relaxed text-ink-muted">
            {size.note}
          </p>
        </>
      )}
    </div>
  );
}
