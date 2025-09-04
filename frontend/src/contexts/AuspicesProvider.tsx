// ── app/auspices/AuspicesProvider.tsx ─────────────────────────────────────
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Favor = string | null;  // "favourable" | "unfavourable" | "faustum" | ...
type Door  = "attunement" | "imitation" | "akasha" | null;

type Ctx = {
  favor: Favor;
  door: Door;
  judgement: string | null;
  setFavor: (f: Favor) => void;
  setDoor:  (d: Door)  => void;
  setJudgement: (j: string | null) => void;
};

const AuspicesCtx = createContext<Ctx | null>(null);

export function AuspicesProvider({ children }: { children: React.ReactNode }) {
  const [favor, setFavor] = useState<Favor>(null);
  const [door,  setDoor]  = useState<Door>(null);
  const [judgement, setJudgement] = useState<string | null>(null);

  // Debug: log changes for troubleshooting
  useEffect(() => {
    console.log("[AuspicesProvider] favor set:", favor);
  }, [favor]);

  useEffect(() => {
    console.log("[AuspicesProvider] door set:", door);
  }, [door]);

  useEffect(() => {
    console.log("[AuspicesProvider] judgement set:", judgement);
  }, [judgement]);

  return (
    <AuspicesCtx.Provider value={{ favor, door, judgement, setFavor, setDoor, setJudgement }}>
      {children}
    </AuspicesCtx.Provider>
  );
}

export function useAuspices() {
  const ctx = useContext(AuspicesCtx);
  if (!ctx) throw new Error("useAuspices must be used within AuspicesProvider");
  return ctx;
}
