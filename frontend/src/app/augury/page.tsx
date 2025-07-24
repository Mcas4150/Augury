import AuguryApp from "@/augury";

export default function AuguryPage() {
  const quote = "There is meaning in space before the meaning that signifies. Taking auguries is believing in a world without men; inaugurating is paying homage to the real as such - Michel Serres";

  return (
    <main className="flex flex-col justify-start">
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
      <AuguryApp />
    </main>
  );
}