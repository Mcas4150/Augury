
"use client";

import { useRef, useEffect } from "react";

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface BoidsCanvasProps {
  trigger?: number; // used to “jolt” the system if you ever want
  isConsulting?: boolean; // when true, boids speed ↑ and color changes
}

export default function BoidsCanvas({
  trigger,
  isConsulting = false,
}: BoidsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // we’ll keep our boids and loop handle in refs so they survive re-renders
  const boidsRef = useRef<Boid[]>([]);
  const rafRef = useRef<number>(0);
  const birdImageRef = useRef<HTMLImageElement | null>(null);

  // a ref to hold the latest consulting flag inside our animation loop
  const consultingRef = useRef(isConsulting);
  consultingRef.current = isConsulting;

  const loadBirdImage = () => {
    const birdImage = new Image();
    // Add a cache-busting query parameter
    birdImage.src = `/comfyui/Bird1.png?t=${new Date().getTime()}`;
    birdImage.onload = () => {
      birdImageRef.current = birdImage;
    };
  };

  useEffect(() => {
    loadBirdImage();

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const parent = canvas.parentElement!;
    
    let W: number, H: number;

    const resizeCanvas = () => {
      W = canvas.width = parent.clientWidth;
      H = canvas.height = parent.clientHeight;
    };

    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(parent);
    
    resizeCanvas(); // Initial size

    // initialize boids only once
    const boids: Boid[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    }));
    boidsRef.current = boids;

    const baseMaxSpeed = 2;
    const basePerception = 50;
    const steerFactor = 0.05;

    function updateBoids() {
      const isConsult = consultingRef.current;
      const speedMultiplier = isConsult ? 3 : 1; // double speed when consulting

      boids.forEach((b) => {
        let align = { x: 0, y: 0 },
          coh = { x: 0, y: 0 },
          sep = { x: 0, y: 0 };
        let total = 0;

        for (let o of boids) {
          const dx = o.x - b.x,
            dy = o.y - b.y,
            d = Math.hypot(dx, dy);
          if (o !== b && d < basePerception) {
            align.x += o.vx;
            align.y += o.vy;
            coh.x += o.x;
            coh.y += o.y;
            sep.x += b.x - o.x;
            sep.y += b.y - o.y;
            total++;
          }
        }

        if (total > 0) {
          align.x /= total;
          align.y /= total;
          coh.x = coh.x / total - b.x;
          coh.y = coh.y / total - b.y;

          b.vx +=
            align.x * steerFactor + coh.x * steerFactor + sep.x * steerFactor;
          b.vy +=
            align.y * steerFactor + coh.y * steerFactor + sep.y * steerFactor;
        }

        // limit speed
        const speed = Math.hypot(b.vx, b.vy);
        const maxSpeed = baseMaxSpeed * speedMultiplier;
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed;
          b.vy = (b.vy / speed) * maxSpeed;
        }

                if (isConsult) {
                  // center of canvas
                  const cx = W / 2;
                  const cy = H / 2;
                  // vector from center to boid
                  const dx = b.x - cx;
                  const dy = b.y - cy;
                  const dist = Math.hypot(dx, dy) || 1;
                  // perpendicular (–dy, dx) to create circular motion
                  const perpX = -dy / dist;
                  const perpY = dx / dist;
                  // how strongly they spiral
                  const spiralStrength = 1.5;

                  // **new** radial pull
                  const pullStrength = 0.5; // tweak between 0 = no pull, up to ~1 for very tight pull
                  const inwardX = -dx / dist;
                  const inwardY = -dy / dist;

                  b.vx += perpX * spiralStrength + inwardX * pullStrength;
                  b.vy += perpY * spiralStrength + inwardY * pullStrength;
                  // b.vx += perpX * spiralStrength;
                  // b.vy += perpY * spiralStrength;
                }

        // move & wrap
        b.x = (b.x + b.vx + W) % W;
        b.y = (b.y + b.vy + H) % H;
      });
    }

    function drawBoids() {
      ctx.clearRect(0, 0, W, H);
      const birdImg = birdImageRef.current;

      // if consulting, enable glow
      if (consultingRef.current) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#88ddff";
      } else {
        ctx.shadowBlur = 0;
      }

      if (!birdImg) {
        // Fallback to circles if image is not loaded
        ctx.fillStyle = "#fff";
        for (let b of boidsRef.current) {
          ctx.beginPath();
          ctx.arc(b.x, b.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        return;
      }

      for (let b of boidsRef.current) {
        ctx.save();
        ctx.translate(b.x, b.y);
        // rotate to face direction of movement
        ctx.rotate(Math.atan2(b.vy, b.vx));
        const birdWidth = 100;
        const birdHeight = 100;
        ctx.drawImage(
          birdImg,
          -birdWidth / 2,
          -birdHeight / 2,
          birdWidth,
          birdHeight
        );
        ctx.restore();
      }
      ctx.shadowBlur = 0;
    }

    // main loop
    function loop() {
      updateBoids();
      drawBoids();
      rafRef.current = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, []); // <-- only run on mount

  // if you ever want to “jolt” things on `trigger`, you can react to it here:
  useEffect(() => {
    if (!trigger) return;
    // reload the bird image to get the latest version
    loadBirdImage();

    // e.g. reset velocities randomly
    boidsRef.current.forEach((b) => {
      b.vx = (Math.random() - 0.5) * 2;
      b.vy = (Math.random() - 0.5) * 2;
    });
  }, [trigger]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
