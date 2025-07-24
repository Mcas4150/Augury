import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
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

      {/* This link now points to the Passage page */}
      <Link
        href="/passage"
        title="Enter the Passage"
        className="absolute hover:cursor-pointer rounded-sm"
        style={{
          top: '52%',
          left: '43%',
          width: '14%',
          height: '38%',
        }}
      />
    </main>
  );
}