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
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

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
      <div className="fixed bottom-0 left-0 w-full flex justify-center items-end pointer-events-none z-50">
        <div className="pointer-events-auto w-full bg-black py-4 flex justify-center">
          {isAudioFinished ? (
            <Link href="/" className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-2xl rounded-lg">
              Return to Main
            </Link>
          ) : isAudioPlaying ? null : (
            <InaugurateButton
              onAudioStart={() => setIsAudioPlaying(true)}
              onAudioFinish={() => { setIsAudioFinished(true); setIsAudioPlaying(false); }}
            />
          )}
        </div>
      </div>
      {/* Game Component Container - Layer 10 */}
      
    </main>
</>
)}
