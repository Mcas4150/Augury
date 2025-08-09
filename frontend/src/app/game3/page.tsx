import GameComponent from '@/GameComponent';
import Image from 'next/image';

export default function GamePage3() {
  return (
    <main className="relative w-full h-[85vh] flex items-center justify-center">
      {/* Background Image - Layer 0 */}
      <Image
        src="/media/nightsky3.png"
        alt="A starry night sky"
        layout="fill"
        objectFit="cover"
        quality={100}
      />

      {/* Game Component Container - Layer 10 */}
      <div className="relative z-10 w-[960px] h-[540px]">
        <GameComponent />
      </div>
    </main>
  );
}