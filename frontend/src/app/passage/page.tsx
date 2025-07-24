import Link from 'next/link';
import Image from 'next/image';

export default function PassagePage() {
  return (
    <main className="relative w-screen h-screen">
      {/* Background Image */}
      <Image
        src="/media/Passage.png"
        alt="A mysterious passage"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
      />

      {/* This link now points to the Bird Doors page */}
      <Link
        href="/birddoors"
        title="Proceed to Bird Doors"
        className="absolute hover:cursor-pointer"
        style={{
          top: '35%',
          left: '42%',
          width: '16%',
          height: '35%',
        }}
      />
    </main>
  );
}