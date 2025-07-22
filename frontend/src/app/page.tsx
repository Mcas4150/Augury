import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main>
      <Link href="/augury" className="block w-screen h-screen relative">
        <Image
          src="/media/Gate2.png" // CHANGE to your image name
          alt="Enter the Templum"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />
      </Link>
    </main>
  );
}