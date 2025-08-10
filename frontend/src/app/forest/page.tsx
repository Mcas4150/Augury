"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Import Link
import Modal from '@/Modal';
import ScrollComponent from '@/ScrollComponent';
import { useWebSocket } from '@/useWebSocket';

export default function ForestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { send } = useWebSocket();

  useEffect(() => {
    send("forest");
  }, [send]);

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
        The Acoustic Niche Hypothesis (Krause, 1993), proposes an autopoetic soundscape where species evolve to emit and perceive sonic signals in unique spectral niches. Human hearing is also described by this model, suggesting the tandem evolution of the biological structures for both hearing and vocal production.
      </p>
      
      <div className="flex justify-center my-4">
        <Image
          src="/media/linebreak.png"
          alt="decorative line break"
          width={300}
          height={50}
          className="rounded-md"
        />
      </div>

      <p className="mb-4">
        Decoding these complex communication networks has so far relied on a synthesis of ear training and technical expertises; situated listening, field recording, visual analysis of spectrograms, audio processing... Critically, the computer's role was one of translation not interpretation.
      </p>

      <div className="flex justify-center my-4">
        <Image
          src="/media/linebreak.png"
          alt="decorative line break"
          width={300}
          height={50}
          className="rounded-md"
        />
      </div>

      <p>
        The emergence of machine listening via neural networks like BirdNET marks a fundamental shift, automating the interpretive act itself, yielding probabilistic divinations in place of human experts.
      </p>

      {/* New "Continue" Link */}
      <div className="text-center mt-6">
          <Link href="/game" className="font-roman text-xl text-black hover:underline font-bold">
            Continue your journey >
          </Link>
      </div>
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
          <ScrollComponent>
            {scrollContent}
          </ScrollComponent>
        </div>
      </Modal>
    </>
  );
}
