"use client";

import Image from "next/image";
import BoidsCanvas from "./boidsCanvas";
import { useState } from "react";
import { useWebSocket } from "./useWebSocket";

const wsUrl = "ws://10.0.0.232:9987"; // To

export default function AuguryApp() {
  const [species, setSpecies] = useState("");
  const [side, setSide] = useState("");
  const [proclamation, setProclamation] = useState("");
  const [judgement, setJudgement] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [boidTrigger, setBoidTrigger] = useState(0);

  const { send } = useWebSocket(wsUrl);

  const handleSubmit = async () => {
    send("divinate");
    setLoading(true);
    setProclamation("");
    setJudgement(null);

    try {
      const res = await fetch(`http://localhost:8000/proclaim`, {
        method: "POST",
      });
      const data = await res.json();

      setProclamation(data.proclamation);
      setJudgement(data.judgement);
      setBoidTrigger(Date.now());
    } catch {
      setProclamation("⚠️ Error invoking the augur. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col">
      {/* Boids canvas takes up top half */}
      <div className="relative w-full h-[50vh]">
        <BoidsCanvas trigger={boidTrigger} isConsulting={loading} />
      </div>

      {/* Content centered in the bottom half */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 space-y-6">
        <div className="flex flex-col items-center space-y-4 w-full max-w-2xl">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-lg font-bold"
          >
            {loading ? "Invoking..." : "Consult Augur"}
          </button>

          {judgement && (
            <div className="text-2xl font-roman">
              Judgement: <strong>{judgement}</strong>
            </div>
          )}

          {proclamation && (
            <div className="bg-gray-900 bg-opacity-75 text-white p-6 rounded-lg shadow-lg overflow-auto w-full text-center">
              <div className="whitespace-pre-wrap font-mono">
                {proclamation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
