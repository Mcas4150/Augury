"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWebSocket } from '@/useWebSocket';

export default function ForumPage() {
  const { send } = useWebSocket();

  useEffect(() => {
    send("forum");
  }, [send]);

  return (
<>
    <main className="relative w-full h-[85vh] flex items-center justify-center">
      {/* Background Image - Layer 0 */}
      <Image
        src="/comfyui/Forum1.png"
        alt="The Forum"
        layout="fill"
        objectFit="cover"
        quality={100}
      />
             <div className="absolute top-10 left-1/2 -translate-x-1/2">
    <Link href="/birddoors" className="font-roman text-lg text-white hover:underline">
            Return to Main
      </Link>
</div>
      {/* Game Component Container - Layer 10 */}
     
    </main>
</>
)}