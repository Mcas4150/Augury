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

  // New: control showing the button after a delay without shifting layout (fade-in)
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (effectRan.current === false) {
      send(webSocketMessage);

      return () => {
        effectRan.current = true;
      };
    }
  }, [webSocketMessage, send]);

  useEffect(() => {
    // Start the 8s timer on mount. It will restart each time the component mounts.
    setShowButton(false);
    const t = setTimeout(() => setShowButton(true), 8000);
    return () => clearTimeout(t);
  }, []);

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
          <button
            onClick={() => setIsModalOpen(true)}
            className={`px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-2xl rounded-lg transition-opacity duration-500 transform ${
              showButton ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
            aria-hidden={!showButton}
          >
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
