"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Import the Link component
import Modal from '@/Modal';
import ScrollComponent from '@/ScrollComponent';
import { useWebSocket } from '@/useWebSocket';

// Statically import the images
import boidsDiagram from '/public/media/boidsdiagram.gif';
import lineBreak from '/public/media/linebreak.png';

// Define the detailed scroll content, now including the "Continue" link at the bottom
const scrollContent = (
  <div>
    <div className="flex justify-center mb-4">
      <Image
        src={boidsDiagram}
        alt="A diagram illustrating the Boids algorithm"
        width={400}
        height={300}
        className="rounded-md"
        priority
      />
    </div>

    <p className="mb-4">
      Early artificial life, from ethological algorithms to fractal art, emerged from simplified interpretations of natural systems. This abstraction sought to model and simulate life by isolating the core rules governing its behavior, translating complexity into logic.
    </p>
    
    <div className="flex justify-center my-4">
      <Image
        src={lineBreak}
        alt="decorative line break"
        width={300}
        height={50}
        className="rounded-md"
      />
    </div>

    <p className="mb-4">
      Craig Reynolds' Boids (1986) is a key example of this rule-based approach. By programming agents with just three simple instructions—<strong>separation, alignment, and cohesion</strong>—complex, flocking behavior emerged. The output was deterministic yet surprising.
    </p>

    <div className="flex justify-center my-4">
      <Image
        src={lineBreak}
        alt="decorative line break"
        width={300}
        height={50}
        className="rounded-md"
      />
    </div>

    <p>
      In contrast, AI diffusion models mark a shift from explicit rules to probabilistic learning. When prompted to create a "bird," a diffusion model doesn't follow a program; it navigates a possibility space to synthesize a novel image. This act of interpolation echoes the human interpretations of nature preceding its simulation.
    </p>

    {/* Manually add the "Continue" link, matching the ForestPage example */}
    <div className="text-center mt-8 pt-4">
        <Link href="/game2" className="font-roman text-xl text-black hover:underline font-bold">
          Continue your journey >
        </Link>
    </div>
  </div>
);

export default function ShorePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { send } = useWebSocket();

  useEffect(() => {
    send("shore");
  }, [send]);

  const scrollText = `Waves crash upon the shore, echoing forgotten words.`;

  return (
    <>
      <main className="relative w-screen h-screen">
        <Image
          src="/media/shore.png"
          alt="A rocky shore"
          fill
          style={{ objectFit: 'cover' }}
          quality={100}
          priority
        />
        <div className="absolute top-10 left-1/2 -translate-x-1/2">
          <button onClick={() => setIsModalOpen(true)} className="font-roman text-lg border-2 border-white px-4 py-3 hover:bg-white/10">
            look up at the sky
          </button>
        </div>
      </main>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-full h-[80vh]">
          {/* The continueLink prop is removed, as the link is now inside scrollContent */}
          <ScrollComponent>
            {scrollContent}
          </ScrollComponent>
        </div>
      </Modal>
    </>
  );
}
