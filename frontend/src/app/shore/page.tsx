"use client";
import Image from 'next/image';
import Link from 'next/link';
import ContentPage from '@/ContentPage';

// Statically import the images
import boidsDiagram from '/public/media/boidsdiagram.gif';
import lineBreak from '/public/media/linebreak.png';

// Define the detailed scroll content
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

    <p className="mb-4 text-xl">
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

    <p className="mb-4 text-xl">
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

    <p className='text-xl'>
      In contrast, AI diffusion models mark a shift from explicit rules to probabilistic learning. When prompted to create a "bird," a diffusion model doesn't follow a program; it navigates a possibility space to synthesize a novel image. This act of interpolation echoes the human interpretations of nature preceding its simulation.
    </p>

    <div className="text-center mt-8 pt-4">
        <Link href="/game2" className="font-roman text-2xl text-black hover:underline font-bold">
          Continue your journey 
        </Link>
    </div>
  </div>
);

export default function ShorePage() {
  return (
    <ContentPage
      imageSrc="Shore1.png"
      altText="A rocky shore"
      scrollContent={scrollContent}
      webSocketMessage="shore"
    />
  );
}
