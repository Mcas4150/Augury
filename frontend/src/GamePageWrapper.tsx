"use client";

import React, { useState, useEffect, useRef } from "react";
import GameComponent from "@/GameComponent";
import AuspicesOverlay from "@/AuspicesOverlay";
import Image from "next/image";
import { useWebSocket } from "@/useWebSocket";
import BottomAugur from "@/BottomAugur";
import { useRouter } from "next/navigation";

interface GamePageWrapperProps {
  imageSrc: string;
  genEvent: string;
}

export default function GamePageWrapper({ imageSrc, genEvent }: GamePageWrapperProps) {
  const [isGameWon, setIsGameWon] = useState(false);
  const [textProps, setTextProps] = useState({ centerX: 0, centerY: 0, fontSize: 0 });
  const { send } = useWebSocket();
  const effectRan = useRef(false);

  useEffect(() => {
    if (!effectRan.current) {
      send(genEvent);
      return () => {
        effectRan.current = true;
      };
    }
  }, [genEvent, send]);

  interface GameTextProps {
    centerX: number;
    centerY: number;
    fontSize: number;
  }

  const [judgement, setJudgement] = useState<string | null>(null);
  const [proclamation, setProclamation] = useState<string | null>(null);
  const [cleanupFn, setCleanupFn] = useState<() => void>(() => () => {});
  const router = useRouter();

  const handleClose = () => {
    // ensure AuspicesOverlay cleanup (stop audio) runs before navigation
    try {
      cleanupFn();
    } catch (e) {
      // ignore
    }
    setProclamation(null);
    setJudgement(null);
    router.push("/forum");
  };

  const handleGameWon = (gameTextProps: GameTextProps) => {
    setIsGameWon(true);
    // Convert game canvas coordinates to page coordinates
    const gameContainer = document.querySelector(".game-container");
    if (gameContainer) {
      const rect = gameContainer.getBoundingClientRect();
      setTextProps({
        centerX: rect.left + gameTextProps.centerX,
        centerY: rect.top + gameTextProps.centerY,
        fontSize: gameTextProps.fontSize,
      });
    }
  };

  return (
    <main className="relative w-full h-[85vh] flex items-center justify-center">
      {/* Background Image - Layer 0 */}
      <Image src={imageSrc} alt="A starry night sky" layout="fill" objectFit="cover" quality={100} />

      {/* Game Component Container - Layer 10 */}
      <div className="relative z-10 w-[960px] h-[540px] game-container">
        <GameComponent onGameWon={handleGameWon} />
      </div>

      {/* BottomAugur or Judgement/Proclamation (footer-style) */}
      {(judgement || proclamation) ? (
        <div className="fixed bottom-0 left-0 w-full flex justify-center items-end pointer-events-none z-50">
          <div className="pointer-events-auto w-full bg-black py-4">
            {judgement && (
              <div className="font-roman text-white text-center text-2xl md:text-3xl lg:text-4xl tracking-wide drop-shadow-lg">
                Judgement: <strong>{judgement}</strong>
              </div>
            )}
            {/* {proclamation && (
              <div className="mt-2 font-roman text-white text-center text-lg tracking-wide drop-shadow-sm">
                {proclamation}
              </div>
            )} */}
            <div className="flex justify-center mt-3">
              <button onClick={handleClose} className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xl rounded-lg">Return to Forum</button>
            </div>
          </div>
        </div>
      ) : (
        <BottomAugur message='Connect the nodes to mark a quadrilateral templum in the sky'/>
      )}

      {/* Auspices Overlay */}
      <AuspicesOverlay
        isGameWon={isGameWon}
        textProps={textProps}
        onResult={({ judgement, proclamation }) => {
          setJudgement(judgement ?? null);
          setProclamation(proclamation ?? null);
        }}
        setCleanupFn={setCleanupFn}
      />
    </main>
  );
}
