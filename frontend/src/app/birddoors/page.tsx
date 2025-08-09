"use client";
import { useState } from 'react';
import Image from 'next/image';
import Modal from '@/Modal';
import ScrollComponent from '@/ScrollComponent';

export default function BirdDoorsPage() {
  // Create a separate state for each door's modal
  const [isLeftModalOpen, setIsLeftModalOpen] = useState(false);
  const [isMiddleModalOpen, setIsMiddleModalOpen] = useState(false);
  const [isRightModalOpen, setIsRightModalOpen] = useState(false);

  // Define the unique text for each scroll
  const leftScrollText = `This is the scroll for the left door. It contains unique text.`;
  const middleScrollText = `This is the scroll for the middle door, with its own message.`;
  const rightScrollText = `This is the scroll for the right door, revealing a different secret.`;

  return (
    <>
      <main className="relative w-screen h-screen">
        <Image
          src="/media/throneroom.png"
          alt="An empty throne room"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />

        {/* Hotspot for the LEFT door -> opens left modal */}
        <button
          onClick={() => setIsLeftModalOpen(true)}
          title="Open Left Scroll"
          className="absolute hover:cursor-pointer"
          style={{ top: '50%', left: '25%', width: '9%', height: '30%' }}
        />

        {/* Hotspot for the MIDDLE door -> opens middle modal */}
        <button
          onClick={() => setIsMiddleModalOpen(true)}
          title="Open Middle Scroll"
          className="absolute hover:cursor-pointer"
          style={{ top: '50%', left: '44%', width: '9%', height: '30%' }}
        />

        {/* Hotspot for the RIGHT door -> opens right modal */}
        <button
          onClick={() => setIsRightModalOpen(true)}
          title="Open Right Scroll"
          className="absolute hover:cursor-pointer"
          style={{ top: '50%', left: '64%', width: '7%', height: '30%' }}
        />
      </main>

      {/* --- Modals --- */}
      <Modal isOpen={isLeftModalOpen} onClose={() => setIsLeftModalOpen(false)}>
        <div className="w-full h-[80vh]">
          <ScrollComponent continueLink="/forest">
            {leftScrollText}
          </ScrollComponent>
        </div>
      </Modal>

      <Modal isOpen={isMiddleModalOpen} onClose={() => setIsMiddleModalOpen(false)}>
        <div className="w-full h-[80vh]">
          <ScrollComponent continueLink="/shore">
            {middleScrollText}
          </ScrollComponent>
        </div>
      </Modal>

      <Modal isOpen={isRightModalOpen} onClose={() => setIsRightModalOpen(false)}>
        <div className="w-full h-[80vh]">
          <ScrollComponent continueLink="/hill">
            {rightScrollText}
          </ScrollComponent>
        </div>
      </Modal>
    </>
  );
}