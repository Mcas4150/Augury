import RelevanceComponent from '@/RelevanceComponent';

export default function RelevancePage() {
  const quote = "Infinite players regard their wins and losses in whatever finite games they play as but moments in continuing play - James Carse";

  return (
    <main className="flex flex-col items-center justify-start">
      <div className="w-full overflow-x-hidden">
        <div className="my-8 text-center">
          <span className="inline-block whitespace-nowrap animate-scroll-left text-2xl italic font-roman">
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
      <div className="w-full max-w-5xl h-[75vh]">
        <RelevanceComponent />
      </div>
    </main>
  );
}