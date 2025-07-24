import Link from 'next/link';
import Image from 'next/image';

export default function BirdDoorsPage() {
  return (
    <main className="relative w-screen h-screen">
      <Image
        src="/media/BirdDoors.png"
        alt="Three doors with bird carvings"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
      />

      {/* Hotspot for the LEFT door -> /game */}
      <Link
        href="/game"
        title="Go to Game"
        className="absolute hover:cursor-pointer"
        style={{
          top: '25%',
          left: '11%',
          width: '20%',
          height: '60%',
        }}
      />

      {/* Hotspot for the MIDDLE door -> /swarmscape */}
      <Link
        href="/swarmscape"
        title="Go to Swarmscape"
        className="absolute hover:cursor-pointer"
        style={{
          top: '25%',
          left: '40%',
          width: '20%',
          height: '60%',
        }}
      />

      {/* Hotspot for the RIGHT door -> /augury */}
      <Link
        href="/augury"
        title="Go to Augury"
        className="absolute hover:cursor-pointer"
        style={{
          top: '25%',
          left: '69%',
          width: '20%',
          height: '60%',
        }}
      />
    </main>
  );
}