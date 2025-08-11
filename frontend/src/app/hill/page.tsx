"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Modal from '@/Modal';
import ScrollComponent from '@/ScrollComponent';
import { useWebSocket } from '@/useWebSocket';

// Statically import the images
import labyrinthosDiagram from '/public/media/labyrinthos.jpg';
import lineBreak from '/public/media/linebreak.png';

// Define the detailed scroll content
const scrollContent = (
  <div>
    <div className="flex justify-center mb-4">
      <Image
        src={labyrinthosDiagram}
        alt="A classical labyrinth diagram"
        width={400}
        height={300}
        className="rounded-md"
        priority
      />
    </div>

    <p className="mb-4">
      Categorisation imposes order on the world, assigning labels and creating relationships between disparate pieces of information to structure complexity. This process is revealing of human bias, in the inclusion and structuring of archives.
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
      Early computational intelligence relied on <strong>Expert Systems</strong> to structure knowledge as arborescent structures, navigated by following <code>IF-THEN</code> rulesets. These categories were brittle and manually encoded, relying on their programmers to decide what would be included, where, and how.
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
      By contrast, Large Language Models propose emergent taxonomies. Instead of a predefined decision tree, concepts rely on the <strong>statistical proximity</strong> of objects in their training data. Categories are probabilistic clusters of relative meaning, highlighting the inherent biases of that data.
    </p>

    {/* Manually add the "Continue" link */}
    <div className="text-center mt-8 pt-4">
        <Link href="/game3" className="font-roman text-xl text-black hover:underline font-bold">
          Continue your journey >
        </Link>
    </div>
  </div>
);

export default function HillPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { send } = useWebSocket();

  useEffect(() => {
    send("hill");
  }, [send]);

  const scrollText = `From this vantage point, the shape of the world seems clear.`;

  return (
    <>
      <main className="relative w-screen h-screen">
        <Image
          src="/media/hill.png"
          alt="A windswept hill"
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
          <ScrollComponent>
            {scrollContent}
          </ScrollComponent>
        </div>
      </Modal>
    </>
  );
}
