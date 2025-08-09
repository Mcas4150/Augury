"use client";
import { useState } from 'react';
import Image from 'next/image';
import Modal from '@/Modal';
import ScrollComponent from '@/ScrollComponent';

export default function ShorePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollText = `Waves crash upon the shore, echoing forgotten words.`;

  return (
    <>
      <main className="relative w-screen h-screen">
        <Image
          src="/media/shore.png"
          alt="A rocky shore"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
        <div className="absolute top-10 left-1/2 -translate-x-1/2">
          <button onClick={() => setIsModalOpen(true)} className="font-roman text-lg border-2 border-white px-4 py-3 hover:bg-white/10">
            look up at the sky
          </button>
        </div>
      </main>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-full h-[80vh]">
          <ScrollComponent continueLink="/game2">
            {scrollText}
          </ScrollComponent>
        </div>
      </Modal>
    </>
  );
}