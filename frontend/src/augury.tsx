"use client";
import React, { useRef, useState } from "react";
import BoidsCanvas from "./boidsCanvas";
import { useWebSocket } from "./useWebSocket";

const wsUrl = "ws://10.0.0.232:9987";

function base64ToBlobUrl(b64: string, mime = "audio/mpeg") {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

export default function AuspicesOverlay({ isGameWon, textProps }) {
  const [proclamation, setProclamation] = useState("");
  const [judgement, setJudgement] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [boidTrigger, setBoidTrigger] = useState(0);
  const [showBoids, setShowBoids] = useState(false);

  // Invisible player — never added to the DOM
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastUrlRef = useRef<string | null>(null);

  const { send } = useWebSocket(wsUrl);

  const stopAndCleanupAudio = () => {
    audioRef.current?.pause();
    if (lastUrlRef.current) {
      URL.revokeObjectURL(lastUrlRef.current);
      lastUrlRef.current = null;
    }
    if (audioRef.current) audioRef.current.src = "";
  };

  const handleTakeAuspices = async () => {
    send("divinate");
    setLoading(true);
    setProclamation("");
    setJudgement(null);
    setShowBoids(false);
    stopAndCleanupAudio();

    try {
      const res = await fetch("http://localhost:8000/proclaim/audio", { method: "POST" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();

      setProclamation(data.proclamation);
      setJudgement(data.judgement);

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
    } finally {
      setShowBoids(true);
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopAndCleanupAudio();
    setProclamation("");
    setJudgement(null);
    setShowBoids(false);
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

      {(judgement || proclamation) && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 space-y-6">
          {judgement && <div className="text-2xl font-roman text-white text-center">Judgement: <strong>{judgement}</strong></div>}
          {/* {proclamation && (
            <div className="bg-gray-900/30 text-white p-6 rounded-lg shadow-lg overflow-auto max-w-4xl max-h-96 text-center backdrop-blur-sm">
              <div className="whitespace-pre-wrap font-mono">{proclamation}</div>
            </div>
          )} */}
          <button onClick={handleClose} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">Return to Forum</button>
        </div>
      )}

      {showBoids && (
        <div className="absolute inset-0 z-40 w-full h-full pointer-events-none">
          <BoidsCanvas trigger={boidTrigger} isConsulting={loading} flyInOnStart />
        </div>
      )}
    </>
  );
}
