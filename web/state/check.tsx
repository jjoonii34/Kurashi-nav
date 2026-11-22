"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CostInput, EstimateFields } from "@/estimate/input";
import type { Point } from "@/geo/japan";

// `fields` refills the form when the user comes back; `input` is what the
// API receives.
export type Estimate = { fields: EstimateFields; input: CostInput };

type CheckState = {
  point: Point | null;
  setPoint: (point: Point) => void;
  estimate: Estimate | null;
  setEstimate: (estimate: Estimate | null) => void;
};

const CheckContext = createContext<CheckState | null>(null);

// Everything the user enters lives in memory only: never in the URL,
// localStorage or cookies (ADR-0002). A reload forgets it.
export function CheckProvider({ children }: { children: ReactNode }) {
  const [point, setPoint] = useState<Point | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  return (
    <CheckContext value={{ point, setPoint, estimate, setEstimate }}>
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
