import AuguryApp from "@/augury";

export default function AuguryPage() {
  const quote = "There is meaning in space before the meaning that signifies. Taking auguries is believing in a world without men; inaugurating is paying homage to the real as such. - Michel Serres";

  return (
    <main className="flex flex-col justify-start">
      <div className="w-full overflow-x-hidden">
        <div className="whitespace-nowrap animate-scroll-left text-xl italic my-8 font-roman text-center">
          {quote.split('').map((char, index) => {
            // Check if the character is a space
            if (char === ' ') {
              return <span key={index}> </span>; // Render a space
            }
            // Otherwise, render the wavy letter
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
        </div>
      </div>
      <AuguryApp />
    </main>
  );
}