"use client";
import { useState } from 'react';
import Image from 'next/image';
import Modal from '@/Modal';
import ScrollComponent from '@/ScrollComponent';

export default function ForestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // The content is now a JSX element
  const scrollContent = (
    <div>
      <div className="flex justify-center mb-4">
        <Image
          src="/media/niche.jpg"
          alt="A visual representation of the Acoustic Niche Hypothesis"
          width={400}
          height={300}
          className="rounded-md"
        />
      </div>

      <p className="mb-4">
        The Acoustic Niche Hypothesis (Krause, 1993), proposes an autopoetic soundscape where species evolve to emit and perceive sonic signals in unique spectral niches. Human hearing is also described by this model, suggesting the tandem evolution of the biological structures for both hearing and vocal production for belonging in the biophony. For researchers, decoding these complex communication networks has so far relied on a synthesis of ear training and technical expertises; situated listening, field recording, visual analysis of spectrograms, audio processing, and so forth. Critically, the computer's role was one of translation not interpretation. But the emergence of machine listening via neural networks like BirdNET marks a fundamental shift, automating the interpretive act itself, yielding probabilistic divinations in place of human experts.
      </p>
    </div>
  );

  return (
    <>
      <main className="relative w-screen h-screen">
        <Image
          src="/media/forest.png"
          alt="A dense forest"
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
          <ScrollComponent continueLink="/game">
            {scrollContent}
          </ScrollComponent>
        </div>
      </Modal>
    </>
  );
}