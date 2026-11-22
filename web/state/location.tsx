"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Point } from "@/geo/japan";

type LocationState = {
  point: Point | null;
  setPoint: (point: Point) => void;
};

const LocationContext = createContext<LocationState | null>(null);

// The chosen location lives in memory only: never in the URL, localStorage
// or cookies (ADR-0002). A reload forgets it and the user picks again.
export function LocationProvider({ children }: { children: ReactNode }) {
  const [point, setPoint] = useState<Point | null>(null);
  return (
    <LocationContext value={{ point, setPoint }}>{children}</LocationContext>
  );
}

export function useLocation(): LocationState {
  const state = useContext(LocationContext);
  if (state === null) {
    throw new Error("useLocation must be used inside LocationProvider");
  }
  return state;
}
