import AuguryApp from "@/augury";

export default function AuguryPage() {
  return (
    <main className="flex flex-col justify-start">
      <p className="text-lg italic my-8 font-roman text-center max-w-4xl mx-auto">
        There is meaning in space before the meaning that signifies. Taking auguries is believing in a world without men; inaugurating is paying homage to the real as such. - Michel Serres
      </p>
      <AuguryApp />
    </main>
  );
}