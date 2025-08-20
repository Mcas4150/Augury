"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWebSocket } from '@/useWebSocket';
import InaugurateButton from '@/InaugurateButton';
import { useAuspices } from '@/contexts/AuspicesProvider';

export default function ForumPage() {
  const { send } = useWebSocket();
  const effectRan = useRef(false);
  const [imageKey] = useState(Date.now());
  const [isAudioFinished, setIsAudioFinished] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [inaugLabel, setInaugLabel] = useState<string | null>(null);

  // Read global auspices for troubleshooting and log when forum mounts / when values change
  const { favor, door, judgement } = useAuspices();

  useEffect(() => {
    console.log("[ForumPage] mounted — auspices:", { favor, door, judgement });
  }, []); // log on mount (when we get to the forum page)

  useEffect(() => {
    console.log("[ForumPage] auspices changed:", { favor, door, judgement });
  }, [favor, door, judgement]);

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
            ) : isAudioPlaying ? (
              <div className="px-6 py-4 text-white text-2xl italic">{inaugLabel ?? ""}</div>
            ) : (
              <InaugurateButton
                onAudioStart={() => { setIsAudioPlaying(true); setInaugLabel(null); }}
                onAudioFinish={() => { setIsAudioFinished(true); setIsAudioPlaying(false); setInaugLabel(null); }}
                onResponse={(data) => {
                  const LABEL_MAP: Record<string, Record<string, string>> = {
                    attunement:  { favorable: "Deep Listening",   unfavorable: "Surveillance" },
                    imitation:   { favorable: "Generative Ecology", unfavorable: "Synthetic Deception" },
                    akasha:      { favorable: "Rhizome",           unfavorable: "Arborescence" },
                  };
                  try {
                    const door = data?.door;
                    const judgement = data?.judgement; // "favorable" | "unfavorable"
                    const lbl = (door && judgement && LABEL_MAP[door]?.[judgement]) ? LABEL_MAP[door][judgement] : null;
                    setInaugLabel(lbl);
                  } catch (e) {
                    setInaugLabel(null);
                  }
                }}
              />
            )}
        </div>
      </div>
      {/* Game Component Container - Layer 10 */}
      
    </main>
</>
)}
