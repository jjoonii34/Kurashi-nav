"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CostInput, EstimateFields } from "@/estimate/input";
import type { Point } from "@/geo/japan";
import type { Region } from "@/geo/regions";
import type { Script } from "@/geo/script";
import type { Town } from "@/geo/towns";

// `fields` refills the form when the user comes back; `input` is what the
// API receives.
export type Estimate = { fields: EstimateFields; input: CostInput };

// Where the search box points the map: a region, and optionally a town in
// it. `script` is the writing system of the search, used to show the names.
// `tapped` marks a region chosen by tapping the map, which must not move it.
export type Place = {
  region: Region;
  town: Town | null;
  script: Script;
  tapped?: true;
};

type CheckState = {
  point: Point | null;
  setPoint: (point: Point) => void;
  estimate: Estimate | null;
  setEstimate: (estimate: Estimate | null) => void;
  place: Place | null;
  setPlace: (place: Place | null) => void;
  // How long the user plans to live there; null when they did not say.
  stayMonths: number | null;
  setStayMonths: (months: number | null) => void;
};

const CheckContext = createContext<CheckState | null>(null);

// Everything the user enters lives in memory only: never in the URL,
// localStorage or cookies (ADR-0002). A reload forgets it.
export function CheckProvider({ children }: { children: ReactNode }) {
  const [point, setPoint] = useState<Point | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [stayMonths, setStayMonths] = useState<number | null>(null);
  return (
    <CheckContext
      value={{
        point,
        setPoint,
        estimate,
        setEstimate,
        place,
        setPlace,
        stayMonths,
        setStayMonths,
      }}
    >
      {children}
    </CheckContext>
  );
}

export function useCheck(): CheckState {
  const state = useContext(CheckContext);
  if (state === null) {
    throw new Error("useCheck must be used inside CheckProvider");
  }
  return state;
}
