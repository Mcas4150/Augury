import ScrollComponent from '@/ScrollComponent';

export default function ContextPage() {
  const contextText = `‘Taking auguries is believing in a world without men; inaugurating is paying homage to the real as such.’ (Serres 19951)

Augury is an ancient practice of taking omens, or auspices, ex caelo (from the sky). At the height of the Roman Empire, this divination system was codified as a state apparatus for the hegemonic order. As an instrument of power, augury became hermeneutics for translating sky watching, including birds and the emergence of flocks, as the will of Gods to justify political expediency. This systematic modelling of natural complexity prefigures computer science concepts, pertinently those foundational to artificial life and self-organizing systems (see: Boids2).

Today, new forms of technological abstraction take hold in which the probabilistic and fallible outputs of generative AI models are rapidly naturalised and accepted as omniscient fact; a higher ‘intelligence’ that conveniently serves the ideological and economic interests of a technocratic, ‘rationalist’ neo-oligarchy.`;

  return (
    <main className="relative w-screen h-screen">
      <ScrollComponent>
        {contextText}
      </ScrollComponent>
    </main>
  );
}