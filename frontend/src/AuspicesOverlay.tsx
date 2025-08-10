"use client";

import React, { useState } from 'react';
import BoidsCanvas from './boidsCanvas';
import { useWebSocket } from './useWebSocket';

const wsUrl = "ws://10.0.0.232:9987";

export default function AuspicesOverlay({ isGameWon, textProps }) {
  // Augury states
  const [proclamation, setProclamation] = useState("");
  const [judgement, setJudgement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [boidTrigger, setBoidTrigger] = useState(0);
  const [showBoids, setShowBoids] = useState(false);
  
  const { send } = useWebSocket(wsUrl);

  const handleTakeAuspices = async () => {
    console.log("Starting augury...");
    send("divinate");
    setLoading(true);
    setProclamation("");
    setJudgement(null);
    setShowBoids(false);

    try {
      const res = await fetch(`http://localhost:8000/proclaim`, {
        method: "POST",
      });
      const data = await res.json();
      console.log("API response:", data);

      setProclamation(data.proclamation);
      setJudgement(data.judgement);
      setBoidTrigger(Date.now());
    } catch (error) {
      console.error("API error:", error);
      setProclamation("⚠️ Error invoking the augur. Check server connection.");
    } finally {
      console.log("Setting showBoids to true");
      setShowBoids(true); // Always show boids after the request completes
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProclamation("");
    setJudgement(null);
    setShowBoids(false);
  };

  return (
    <>
      {/* Take Auspices Button - Layer 20 */}
      {isGameWon && !proclamation && !loading && textProps && (
        <button
          onClick={handleTakeAuspices}
          disabled={loading}
          className="absolute z-20 font-roman text-white hover:text-gray-300 cursor-pointer bg-transparent border-none p-0"
          style={{
            left: `${textProps.centerX}px`,
            top: `${textProps.centerY}px`,
            fontSize: `${textProps.fontSize}px`,
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}
        >
          {loading ? "Invoking..." : "Take The Auspices"}
        </button>
      )}
      
      {/* Results Overlay - Layer 30 */}
      {(judgement || proclamation) && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 space-y-6">
          {judgement && (
            <div className="text-2xl font-roman text-white text-center">
              Judgement: <strong>{judgement}</strong>
            </div>
          )}
          
          {proclamation && (
            <div className="bg-gray-900 bg-opacity-30 text-white p-6 rounded-lg shadow-lg overflow-auto max-w-4xl max-h-96 text-center backdrop-blur-sm">
              <div className="whitespace-pre-wrap font-mono">
                {proclamation}
              </div>
            </div>
          )}
          
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      )}

      {/* Boids Overlay - Layer 40 (highest) */}
      {showBoids && (
        <div className="absolute inset-0 z-40 w-full h-full pointer-events-none">
          <BoidsCanvas trigger={boidTrigger} isConsulting={loading} flyInOnStart={true} />
        </div>
      )}
    </>
  );
}