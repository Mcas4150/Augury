"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWebSocket } from '@/useWebSocket';
import InaugurateButton from '@/InaugurateButton';

export default function ForumPage() {
  const { send } = useWebSocket();
  const effectRan = useRef(false);
  const [imageKey] = useState(Date.now());
  const [isAudioFinished, setIsAudioFinished] = useState(false);

  useEffect(() => {
    if (effectRan.current === false) {
      send("doorwayGen"); // or "shoregen", "forestgen"

      return () => {
        effectRan.current = true;
      };
    }
  }, []);

  return (
<>
    <main className="relative w-full h-[85vh] flex items-center justify-center">
      {/* Background Image - Layer 0 */}
      <Image
        src={`/comfyui/Forum1.png?t=${imageKey}`}
        alt="The Forum"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
        unoptimized
      />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4">
        {isAudioFinished ? (
          <Link href="/" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
            Return to Main
          </Link>
        ) : (
          <InaugurateButton onAudioFinish={() => setIsAudioFinished(true)} />
        )}
      </div>
      {/* Game Component Container - Layer 10 */}
     
    </main>
</>
)}
