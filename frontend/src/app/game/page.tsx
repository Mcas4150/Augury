import GameComponent from '@/GameComponent';

export default function GamePage() {
  const quote = "Finite games can be played within an infinite game, but an infinite game cannot be played within a finite game. Infinite players regard their wins and losses in whatever finite games they play as but moments in continuing play - James Carse";

  return (
    <main className="flex flex-col items-center justify-start">
      <div className="w-full overflow-x-hidden">
        <div className="my-8 text-center">
          <span className="inline-block whitespace-nowrap animate-scroll-left text-4xl italic font-roman">
            {quote.split('').map((char, index) => {
              if (char === ' ') {
                return <span key={index}> </span>;
              }
              return (
                <span
                  key={index}
                  className="wavy-letter"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        </div>
      </div>
      <GameComponent width={960} height={540} />
    </main>
  );
}