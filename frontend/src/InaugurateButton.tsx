// ── InaugurateButton.tsx ──────────────────────────────────────────────────
"use client";
import React, { useRef, useState } from "react";
// import { useAuspices } from "@/auspices/AuspicesProvider";

function base64ToBlobUrl(b64: string, mime = "audio/mpeg") {
  const bin = atob(b64); const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

export default function InaugurateButton({ auto }: { auto?: boolean }) {
//   const { favor, door } = useAuspices();
const favor = "favourable";
const door = "attunement";
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastUrlRef = useRef<string | null>(null);

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
      const res = await fetch("http://localhost:8000/inaugurate/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favor, door }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      const url = base64ToBlobUrl(data.audio_base64, data.mime || "audio/mpeg");
      lastUrlRef.current = url;
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = url;
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
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
      {loading ? "Inaugurating…" : "Inaugurate"}
    </button>
  );
}
