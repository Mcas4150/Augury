"use client";
import { useState } from 'react';
import Image from 'next/image';
import Modal from '@/Modal';
import ScrollComponent from '@/ScrollComponent';

export default function PassagePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // You can create new, unique text for this scroll
  const scrollText = `The passage continues, leading to new choices.`;

  return (
    <>
      <main className="relative w-screen h-screen">
        {/* Background Image */}
        <Image
          src="/media/Passage.png"
          alt="A mysterious passage"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />

        {/* The invisible hotspot now opens the modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          title="Inspect the passage"
          className="absolute hover:cursor-pointer"
          style={{
            top: '35%',
            left: '42%',
            width: '16%',
            height: '35%',
          }}
        />
      </main>

      {/* The Modal and its content */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-full h-[80vh]">
          <ScrollComponent continueLink="/birddoors">
            {scrollText}
          </ScrollComponent>
        </div>
      </Modal>
    </>
  );
}