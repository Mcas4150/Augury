"use client";
import { useState, useEffect, useRef, ReactNode } from 'react';
import Image from 'next/image';
import Modal from '@/Modal';
import ScrollComponent from '@/ScrollComponent';
import { useWebSocket } from '@/useWebSocket';

interface ContentPageProps {
  imageSrc: string;
  altText: string;
  scrollContent: ReactNode;
  webSocketMessage: string;
}

export default function ContentPage({ imageSrc, altText, scrollContent, webSocketMessage }: ContentPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { send } = useWebSocket();
  const effectRan = useRef(false);
  const [imageKey] = useState(Date.now());

  useEffect(() => {
    if (effectRan.current === false) {
      send(webSocketMessage);

      return () => {
        effectRan.current = true;
      };
    }
  }, [webSocketMessage, send]);

  return (
    <>
      <main className="relative w-screen h-screen">
        <Image
          src={`/comfyui/${imageSrc}?t=${imageKey}`}
          alt={altText}
          fill
          style={{ objectFit: 'cover' }}
          quality={100}
          priority
        />
        <div className="absolute top-10 left-1/2 -translate-x-1/2">
          <button onClick={() => setIsModalOpen(true)} className="font-roman text-lg border-2 border-white px-4 py-3 hover:bg-white/10">
            look up at the sky
          </button>
        </div>
      </main>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-full h-[80vh]">
          <ScrollComponent>
            {scrollContent}
          </ScrollComponent>
        </div>
      </Modal>
    </>
  );
}
