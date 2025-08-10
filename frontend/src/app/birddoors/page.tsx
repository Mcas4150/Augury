"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Modal from '@/Modal';
import ScrollComponent from '@/ScrollComponent';
import { useWebSocket } from '@/useWebSocket';

const wsUrl = "ws://10.0.0.232:9987";

export default function BirdDoorsPage() {
  const [isLeftModalOpen, setIsLeftModalOpen] = useState(false);
  const [isMiddleModalOpen, setIsMiddleModalOpen] = useState(false);
  const [isRightModalOpen, setIsRightModalOpen] = useState(false);
  const { send } = useWebSocket(wsUrl);

  const handleModalClick = (message: string) => {
    send(message);
  };

  const leftScrollContent = (
    <div>
      <p>Towards Attunement</p>
      <div className="flex justify-center my-4">
        <Image src="/media/swarm1.png" alt="Swarm 1" width={300} height={200} />
      </div>
      <div className="text-center mt-6">
        <Link href="/forest" className="font-roman text-xl text-black hover:underline font-bold">
          Continue your journey >
        </Link>
      </div>
    </div>
  );

  const middleScrollContent = (
    <div>
      <p>Towards Imitation of Life</p>
      <div className="flex justify-center my-4">
        <Image src="/media/swarm2.png" alt="Swarm 2" width={300} height={200} />
      </div>
      <div className="text-center mt-6">
        <Link href="/shore" className="font-roman text-xl text-black hover:underline font-bold">
          Continue your journey >
        </Link>
      </div>
    </div>
  );

  const rightScrollContent = (
    <div>
      <p>Towards Akasha</p>
      <div className="flex justify-center my-4">
        <Image src="/media/swarm3.png" alt="Swarm 3" width={300} height={200} />
      </div>
      <div className="text-center mt-6">
        <Link href="/hill" className="font-roman text-xl text-black hover:underline font-bold">
          Continue your journey >
        </Link>
      </div>
    </div>
  );

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
          onClick={() => {
            setIsLeftModalOpen(true);
            handleModalClick("forest");
          }}
          title="Open Left Scroll"
          className="absolute hover:cursor-pointer"
          style={{ top: '50%', left: '25%', width: '9%', height: '30%' }}
        />
        <button
          onClick={() => {
            setIsMiddleModalOpen(true);
            handleModalClick("shore");
          }}
          title="Open Middle Scroll"
          className="absolute hover:cursor-pointer"
          style={{ top: '50%', left: '44%', width: '9%', height: '30%' }}
        />
        <button
          onClick={() => {
            setIsRightModalOpen(true);
            handleModalClick("hill");
          }}
          title="Open Right Scroll"
          className="absolute hover:cursor-pointer"
          style={{ top: '50%', left: '64%', width: '7%', height: '30%' }}
        />
      </main>

      <Modal isOpen={isLeftModalOpen} onClose={() => setIsLeftModalOpen(false)}>
        <div className="w-full h-[80vh]">
          <ScrollComponent>
            {leftScrollContent}
          </ScrollComponent>
        </div>
      </Modal>
      <Modal isOpen={isMiddleModalOpen} onClose={() => setIsMiddleModalOpen(false)}>
        <div className="w-full h-[80vh]">
          <ScrollComponent>
            {middleScrollContent}
          </ScrollComponent>
        </div>
      </Modal>
      <Modal isOpen={isRightModalOpen} onClose={() => setIsRightModalOpen(false)}>
        <div className="w-full h-[80vh]">
          <ScrollComponent>
            {rightScrollContent}
          </ScrollComponent>
        </div>
      </Modal>
    </>
  );
}
