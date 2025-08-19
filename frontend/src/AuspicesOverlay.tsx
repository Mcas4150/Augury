"use client";
import React, { useRef, useState, useEffect } from "react";
import BoidsCanvas3 from "./BoidsCanvas3";
import { useWebSocket } from "./useWebSocket";

function base64ToBlobUrl(b64: string, mime = "audio/mpeg") {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

interface AuspicesOverlayProps {
  isGameWon: boolean;
  textProps: {
    centerX: number;
    centerY: number;
    fontSize: number;
  };
  onResult?: (res: { judgement?: string | null; proclamation?: string | null }) => void;
  setCleanupFn?: (fn: () => void) => void;
}

export default function AuspicesOverlay({
  isGameWon,
  textProps,
  onResult,
  setCleanupFn,
}: AuspicesOverlayProps) {
  const [proclamation, setProclamation] = useState("");
  const [judgement, setJudgement] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [boidTrigger, setBoidTrigger] = useState(0);
  const [showBoids, setShowBoids] = useState(false);
  const [flyInDirection, setFlyInDirection] = useState<"left" | "right">("left");

  // Invisible player — never added to the DOM
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastUrlRef = useRef<string | null>(null);
  const { send } = useWebSocket();

  const stopAndCleanupAudio = () => {
    audioRef.current?.pause();
    if (lastUrlRef.current) {
      URL.revokeObjectURL(lastUrlRef.current);
      lastUrlRef.current = null;
    }
    if (audioRef.current) audioRef.current.src = "";
  };

  // expose cleanup fn to parent so parent can call it before navigation/unmount
  useEffect(() => {
    setCleanupFn?.(stopAndCleanupAudio);
    return () => {
      setCleanupFn?.(() => {});
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTakeAuspices = async () => {
    send("divinate");

    setLoading(true);
    setProclamation("");
    setJudgement(null);
    setShowBoids(false);
    stopAndCleanupAudio();

    try {
      const res = await fetch("http://localhost:8000/proclaim/audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flyInDirection }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();

      setProclamation(data.proclamation);
      setJudgement(data.judgement);

      // notify parent of results
      onResult?.({ judgement: data.judgement, proclamation: data.proclamation });

      const mime = data.mime || "audio/mpeg";
      const url = base64ToBlobUrl(data.audio_base64, mime);
      lastUrlRef.current = url;

      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.preload = "auto";
      }

      audioRef.current.onended = () => {
        if (lastUrlRef.current) {
          URL.revokeObjectURL(lastUrlRef.current);
          lastUrlRef.current = null;
        }
      };

      audioRef.current.src = url;
      await audioRef.current.play(); // user-gesture safe — inside button handler
      setBoidTrigger(Date.now());
    } catch (err) {
      console.error(err);
      setProclamation("⚠️ Error invoking the augur.");
      onResult?.({ judgement: null, proclamation: "⚠️ Error invoking the augur." });
    } finally {
      setShowBoids(true);
      setLoading(false);
    }
  };

  return (
    <>
      {isGameWon && !proclamation && !loading && textProps && (
        <button
          onClick={handleTakeAuspices}
          disabled={loading}
          className="absolute z-20 font-roman text-white hover:text-gray-300 bg-transparent border-none p-0"
          style={{ left: `${textProps.centerX}px`, top: `${textProps.centerY}px`, fontSize: `${textProps.fontSize}px`, transform: "translate(-50%, -50%)" }}
        >
          {loading ? "Invoking..." : "Take The Auspices"}
        </button>
      )}
      {loading && (
        <div
          className="absolute z-20 font-roman text-white text-3xl hover:text-gray-300 bg-transparent border-none p-0"
        >
          "Augurating"
        </div>
      )}

      {showBoids && (
        <div className="absolute inset-0 z-40 w-full h-full pointer-events-none">
          <BoidsCanvas3 onDirectionDetermined={setFlyInDirection} />
        </div>
      )}
    </>
  );
}
