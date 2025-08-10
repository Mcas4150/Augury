 "use client";
import { useState } from 'react';
import Image from 'next/image';
import Modal from '@/Modal';
import ScrollComponent from '@/ScrollComponent';

export default function BirdDoorsPage() {
  const [isLeftModalOpen, setIsLeftModalOpen] = useState(false);
  const [isMiddleModalOpen, setIsMiddleModalOpen] = useState(false);
  const [isRightModalOpen, setIsRightModalOpen] = useState(false);

  // The text is now a JSX element for detailed styling
  const leftScrollContent = (
    <div>
      <p className="text-center font-bold">Path of Attunement</p>
      <br />
      <p className="text-center">
        ‘Come hither, as thou farest, renowned Odysseus, <br />
        great glory of the Achaeans; <br />
        stay thy ship that thou mayest listen to the voice of us two. <br />
        For never yet has any man rowed past this isle in his black ship<br />
        until he has heard the sweet voice from our lips. <br />
        Nay, he has joy of it, and goes his way a wiser man. <br />
        For we know all the toils that in wide Troy the Argives and Trojans endured <br />
        through the will of the gods, <br />
        and we know all things that come to pass upon the fruitful earth.
      </p>
      <br />
      <p className="text-left">
        The Siren’s Call (The Odyssey, 12)
      </p>
    </div>
  );

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

        <button
          onClick={() => setIsLeftModalOpen(true)}
          title="Open Left Scroll"
          className="absolute hover:cursor-pointer"
          style={{ top: '50%', left: '25%', width: '9%', height: '30%' }}
        />
        <button
          onClick={() => setIsMiddleModalOpen(true)}
          title="Open Middle Scroll"
          className="absolute hover:cursor-pointer"
          style={{ top: '50%', left: '44%', width: '9%', height: '30%' }}
        />
        <button
          onClick={() => setIsRightModalOpen(true)}
          title="Open Right Scroll"
          className="absolute hover:cursor-pointer"
          style={{ top: '50%', left: '64%', width: '7%', height: '30%' }}
        />
      </main>

      <Modal isOpen={isLeftModalOpen} onClose={() => setIsLeftModalOpen(false)}>
        <div className="w-full h-[80vh]">
          <ScrollComponent continueLink="/forest">
            {leftScrollContent}
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