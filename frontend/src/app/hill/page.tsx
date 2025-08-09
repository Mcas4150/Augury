"use client";
import { useState } from 'react';
import Image from 'next/image';
import Modal from '@/Modal';
import ScrollComponent from '@/ScrollComponent';

export default function HillPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollText = `From this vantage point, the shape of the world seems clear.`;

  return (
    <>
      <main className="relative w-screen h-screen">
        <Image
          src="/media/hill.png"
          alt="A windswept hill"
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
          <ScrollComponent continueLink="/game3">
            {scrollText}
          </ScrollComponent>
        </div>
      </Modal>
    </>
  );
}