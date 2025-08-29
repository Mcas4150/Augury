// ── InaugurateButton.tsx ──────────────────────────────────────────────────
"use client";
import React, { useRef, useState } from "react";
import { useAuspices } from "@/contexts/AuspicesProvider";

function base64ToBlobUrl(b64: string, mime = "audio/mpeg") {
  const bin = atob(b64); const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

export default function InaugurateButton({ auto, onAudioFinish, onAudioStart, onResponse }: { auto?: boolean; onAudioFinish?: () => void; onAudioStart?: () => void; onResponse?: (res: any) => void }) {
  const { favor, door } = useAuspices();
  // Normalize favor into backend-expected values ("good" | "bad").
  const normalizeFavor = (f: string | null | undefined): string | null => {
    if (!f) return null;
    const s = String(f).toLowerCase();
    if (s === "favourable" || s === "unfavourable") return s;
    if (s.includes("fav") || s.includes("good") || s.includes("faus") || s.includes("favour") || s.includes("favorable") || s.includes("favourable")) return "favourable";
    if (s.includes("unfav") || s.includes("bad") || s.includes("unfavour") || s.includes("unfavorable") || s.includes("unfavourable")) return "unfavourable";
    return null;
  };
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastUrlRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const clean = () => {
    audioRef.current?.pause();
    if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);
    lastUrlRef.current = null;
    if (audioRef.current) audioRef.current.src = "";
  };

  const run = async () => {
    if (!favor || !door) return;
    setLoading(true); clean();
    try {
      const normalizedFavor = normalizeFavor(favor);
      const res = await fetch("http://localhost:8000/inaugurate/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favor: normalizedFavor, door }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      const url = base64ToBlobUrl(data.audio_base64, data.mime || "audio/mpeg");
      lastUrlRef.current = url;

      // Emit raw API response to parent so the forum page can compute/display the label in the footer.
      try {
        if (typeof onResponse === "function") onResponse(data);
      } catch (e) {
        // Non-fatal: if the parent handler fails, don't block audio playback.
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;

      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous";
        if (onAudioFinish) {
          audioRef.current.onended = onAudioFinish;
        }
      }

      if (!sourceRef.current) {
        sourceRef.current = audioContext.createMediaElementSource(audioRef.current);
        const convolver = audioContext.createConvolver();

        // Fetch and decode the impulse response
        const response = await fetch("/media/PS1_HALL.wav");
        const arrayBuffer = await response.arrayBuffer();
        const impulseBuffer = await audioContext.decodeAudioData(arrayBuffer);
        convolver.buffer = impulseBuffer;

        sourceRef.current.connect(convolver);
        convolver.connect(audioContext.destination);
      }

      audioRef.current.src = url;
      // notify parent that playback is starting so it can hide the button
      onAudioStart?.();
      await audioRef.current.play();
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (auto) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, favor, door]);

  return (
    <button disabled={loading || !favor || !door} onClick={run}
      className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-2xl rounded-lg">
      {loading ? "Inaugurating…" : "Inaugurate"}
    </button>
  );
}
