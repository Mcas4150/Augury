// useEffect in a React component
import { useEffect, useState } from "react";

export default function Birdnet() {
  const [last, setLast] = useState<any>(null);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch("https://birdnet.gamebirdy.xyz/latest");
        if (r.status === 200) {
          const json = await r.json();
          setLast(json);                 // render or console.log it
          console.log("latest", json);
        }
      } catch (err) {
        console.error("poll failed", err);
      }
    }, 500);                            // ← 5 000 ms
    return () => clearInterval(id);      // cleanup on unmount
  }, []);

  if (!last) return <p>Waiting for detections…</p>;
  return (
    <pre style={{ whiteSpace: "pre-wrap" }}>
      {JSON.stringify(last, null, 2)}
    </pre>
  );
}
