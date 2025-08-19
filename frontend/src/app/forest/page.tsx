"use client";
import Image from 'next/image';
import Link from 'next/link';
import ContentPage from '@/ContentPage';

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

    <div className="text-center mt-6">
        <Link href="/game" className="font-roman text-xl text-black hover:underline font-bold">
          Continue your journey 
        </Link>
    </div>
  </div>
);

export default function ForestPage() {
  return (
    <ContentPage
      imageSrc="Forest1.png"
      altText="A dense forest"
      scrollContent={scrollContent}
      webSocketMessage="forest"
    />
  );
}
