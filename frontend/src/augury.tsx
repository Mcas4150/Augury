"use client"
import Image from "next/image";
import BoidsCanvas from "./boidsCanvas";
import { useState } from "react";

export default function AuguryApp() {
  const [species, setSpecies] = useState("");
  const [side, setSide] = useState("");
  const [proclamation, setProclamation] = useState("");
  const [loading, setLoading] = useState(false);
  const [boidTrigger, setBoidTrigger] = useState(0);

  const handleSubmit = async () => {
    setLoading(true);
    setProclamation("");
    try {
      const res = await fetch(`http://localhost:8000/proclaim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ species, side }),
      });
      const data = await res.json();
      setProclamation(data.proclamation);
      setBoidTrigger(Date.now());
    } catch {
      setProclamation("⚠️ Error invoking the augur. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 space-y-6">
      <div className="relative w-[512px] h-[384px]">
        <BoidsCanvas trigger={boidTrigger} />
      </div>
      <div className="relative w-[512px] h-[384px]">
        <Image
          src="/media/augury2.png"
          alt="Augur"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
      <h1 className="text-4xl font-bold tracking-widest">PONTIFEX AUGUR</h1>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Species (e.g., corvus corax)"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          className="px-3 py-2 rounded text-white"
        />
        <input
          type="text"
          placeholder="Side (dexter/sinister)"
          value={side}
          onChange={(e) => setSide(e.target.value)}
          className="px-3 py-2 rounded text-white"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50`}
        >
          {loading ? "Invoking..." : "Consult Augur"}
        </button>
      </div>

      {proclamation && (
        <div className="w-full max-w-3xl bg-white text-black p-6 rounded-lg shadow-lg">
          <pre className="whitespace-pre-wrap">{proclamation}</pre>
        </div>
      )}
    </div>
  );
}
