export default function DocumentationPage() {
  const diagramText = `
┌──────── Camera / Mic ───────┐
│ RTSP / GStreamer video      │
│ USB mic / BirdNET stream    │
└────────────┬────────────────┘
             ▼
[Bird Vision Node]  ← YOLOv8-bird detector + BSD-Net classifier   ──▶ species, pos, heading
             ▼
[Bird Audio Node]   ← BirdNET-Pi or BirdNET-Analyzer 2.0        ──▶ species, call type
             ▼
[Feature Bus]       ← Redis stream / MQTT                         (time-stamped events)
             ▼
[Augury Rule Engine]
   • YAML/JSON knowledge base of auspices  
   • Prolog / Drools / custom Python rule set  
   • Outputs: omen polarity + rationale
             ▼
[Oracle LLM]        ← Llama-3-8B-Instruct (GGUF, llama.cpp)       
   • Prompt template embeds rule-engine output  
   • Style prompt: archaic diction, second-person address  
             ▼
[Voice Synth]       ← Coqui XTTS-v2 (voice cloning, multilingual)   
             ▼
[UI Layer]          ← Streamlit or Gradio dashboard  
   • Live video with bounding boxes  
   • Transcript + audio playback  
   • Log of recent auspices
`;

  return (
    <main className="flex flex-col items-center justify-start">
      <h1 className="text-4xl font-bold my-8 font-roman">
        System Architecture
      </h1>
      <div className="bg-gray-900 p-6 rounded-lg overflow-x-auto">
        <pre className="font-mono text-sm text-gray-300">
          {diagramText}
        </pre>
      </div>
    </main>
  );
}