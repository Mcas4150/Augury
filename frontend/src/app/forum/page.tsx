"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWebSocket } from '@/useWebSocket';
import InaugurateButton from '@/InaugurateButton';

export default function ForumPage() {
  const { send } = useWebSocket();
  // Generate a new timestamp each time the component mounts (page loads)
  const [imageKey] = useState(Date.now());

  useEffect(() => {
    send("forum");
  }, [send]);

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
             <div className="absolute top-10 left-1/2 -translate-x-1/2">
    <Link href="/birddoors" className="font-roman text-lg text-white hover:underline">
            Return to Main
      </Link>
      <InaugurateButton/>
</div>
      {/* Game Component Container - Layer 10 */}
     
    </main>
</>
)}
