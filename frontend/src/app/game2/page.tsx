"use client";

import React, { useState } from 'react';
import GameComponent from '@/GameComponent';
import AuspicesOverlay from '@/AuspicesOverlay';
import Image from 'next/image';

export default function GamePage2() {
  const [isGameWon, setIsGameWon] = useState(false);
  const [textProps, setTextProps] = useState({ centerX: 0, centerY: 0, fontSize: 0 });

  const handleGameWon = (gameTextProps) => {
    setIsGameWon(true);
    // Convert game canvas coordinates to page coordinates
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      const rect = gameContainer.getBoundingClientRect();
      setTextProps({
        centerX: rect.left + gameTextProps.centerX,
        centerY: rect.top + gameTextProps.centerY,
        fontSize: gameTextProps.fontSize
      });
    }
  };

  return (
    <main className="relative w-full h-[85vh] flex items-center justify-center">
      {/* Background Image - Layer 0 */}
      <Image
        src="/media/nightsky2.png"
        alt="A starry night sky"
        layout="fill"
        objectFit="cover"
        quality={100}
      />

      {/* Game Component Container - Layer 10 */}
      <div className="relative z-10 w-[960px] h-[540px] game-container">
        <GameComponent onGameWon={handleGameWon} />
      </div>

      {/* Auspices Overlay - Optional, remove if you don't want auspices on this page */}
      <AuspicesOverlay isGameWon={isGameWon} textProps={textProps} />
    </main>
  );
}