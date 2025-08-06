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

      const audio = new Audio(`data:audio/mpeg;base64,${data.audio_base64}`);
      audio.play();
    } catch {
      setProclamation("⚠️ Error invoking the augur. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white md:flex">
      {/* left panel */}
      <div className="md:w-1/2 flex flex-col items-center p-6 space-y-6">
        <div className="relative w-full h-[384px]">
          <BoidsCanvas trigger={boidTrigger} isConsulting={loading} />
        </div>
        <div className="relative w-full h-[384px]">
          <Image
            src="/media/augury2.png"
            alt="Augur"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>

      {/* right panel */}
      <div className="md:w-1/2 flex flex-col justify-start p-6 space-y-6">
        <h1 className="text-4xl font-roman font-bold tracking-widest">
          Consult the Augur
        </h1>
        {/* •–– input nested at top ––• */}
        <div className="flex space-x-2">

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Invoking..." : "Consult Augur"}
          </button>
        </div>

        {judgement && (
          <div className="text-xl">
            Judgement: <strong>{judgement}</strong>
          </div>
        )}

        {proclamation && (
          <div className="bg-white text-black p-6 rounded-lg shadow-lg overflow-auto">
            <div className="whitespace-pre-wrap font-roman">{proclamation}</div>
          </div>
        )}
      </div>
    </div>
  );
}
