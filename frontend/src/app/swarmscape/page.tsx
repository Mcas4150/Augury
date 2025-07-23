import BoidsComponent from '@/BoidsComponent';

export default function SwarmscapePage() {
  const quote = "3 Rules: Cohesion Separation Alignment";

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
      
      {/* Centering container */}
      <div className="flex justify-center w-full px-4">
        <div className="relative w-[75vh] h-[75vh] border border-gray-700 rounded-full overflow-hidden">
           <BoidsComponent />
        </div>
      </div>

    </main>
  );
}