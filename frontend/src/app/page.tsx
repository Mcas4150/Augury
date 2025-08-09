"use client";
import { useState } from 'react';
import Image from 'next/image';
import Modal from '@/Modal';
import ScrollComponent from '@/ScrollComponent';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollContent = (
    <div>
      <p className="mb-4">
        ‘Taking auguries is believing in a world without men; inaugurating is paying homage to the real as such.’ (Serres 1995)
      </p>
      
      <div className="flex justify-center my-4">
        <Image
          src="/media/RomulusAugury.jpeg"
          alt="Remus and Romulus observing the flight of birds for an omen"
          width={400}
          height={300}
          className="rounded-md"
        />
      </div>

      <p className="mb-4">
        Augury is an ancient practice of taking omens, or auspices, ex caelo (from the sky). At the height of the Roman Empire, this divination system was codified as a state apparatus for the hegemonic order. As an instrument of power, augury became hermeneutics for translating sky watching, including birds and the emergence of flocks, as the will of Gods to justify political expediency. This systematic modelling of natural complexity prefigures computer science concepts, pertinently those foundational to artificial life and self-organizing systems (see: Boids2).
      </p>
      <p>
        Today, new forms of technological abstraction take hold in which the probabilistic and fallible outputs of generative AI models are rapidly naturalised and accepted as omniscient fact; a higher ‘intelligence’ that conveniently serves the ideological and economic interests of a technocratic, ‘rationalist’ neo-oligarchy.
      </p>
    </div>
  );

  return (
    <>
      <main className="relative w-screen h-screen">
        {/* Background Image */}
        <Image
          src="/media/Gate2.png"
          alt="A mystical temple at night"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />

        {/* The invisible door hotspot now opens the modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          title="Enter the Templum"
          className="absolute hover:cursor-pointer rounded-sm"
          style={{
            top: '52%',
            left: '43%',
            width: '14%',
            height: '38%',
          }}
        />
      </main>

      {/* The Modal and its content */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-full h-[80vh]">
          <ScrollComponent continueLink="/passage">
            {scrollContent}
          </ScrollComponent>
        </div>
      </Modal>
    </>
  );
}