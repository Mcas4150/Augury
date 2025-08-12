// ── app/auspices/AuspicesProvider.tsx ─────────────────────────────────────
"use client";
import React, { createContext, useContext, useState } from "react";

type Favor = string | null;  // "favourable" | "unfavourable" | "faustum" | ...
type Door  = "attunement" | "imitation" | "akasha" | null;

type Ctx = {
  favor: Favor;
  door: Door;
  setFavor: (f: Favor) => void;
  setDoor:  (d: Door)  => void;
};

const AuspicesCtx = createContext<Ctx | null>(null);

export function AuspicesProvider({ children }: { children: React.ReactNode }) {
  const [favor, setFavor] = useState<Favor>(null);
  const [door,  setDoor]  = useState<Door>(null);
  return (
    <AuspicesCtx.Provider value={{ favor, door, setFavor, setDoor }}>
      {children}
    </AuspicesCtx.Provider>
  );
}

export function useAuspices() {
  const ctx = useContext(AuspicesCtx);
  if (!ctx) throw new Error("useAuspices must be used within AuspicesProvider");
  return ctx;
}
