"use client";

import { useRef, useEffect } from "react";

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Sprite + spawn
const BIRD_W = 100;
const BIRD_H = 100;
const SPAWN_MARGIN = BIRD_W + 40;

// Flocking tuning
const NUM_BOIDS = 50;
const BASE_MAX_SPEED = 13.5;  // ↑ cap ⇒ faster flock
const PERCEPTION = 38;       // ↓ radius ⇒ tighter flock
const ALIGN_W = 2.5;         // alignment weight
const COH_W   = 1.0;         // cohesion weight
const SEP_W   = 1.8;         // separation weight
const MAX_FORCE_BASE = 0.12; // per–frame steering clamp (scaled by speed)

interface BoidsCanvasProps {
  trigger?: number;
  isConsulting?: boolean;
  flyInOnStart?: boolean;
  flyInSide?: "left" | "right";
  speed?: number;        // global speed scaler
  consultBoost?: number; // speed multiplier during consulting
}

export default function BoidsCanvas({
  trigger,
  isConsulting = false,
  flyInOnStart = false,
  flyInSide = "left",
  speed = 1,
  consultBoost = 3,
}: BoidsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // state that survives re-renders
  const boidsRef = useRef<Boid[]>([]);
  const rafRef = useRef<number>(0);
  const birdImageRef = useRef<HTMLImageElement | null>(null);
  const flyInCompleteRef = useRef<boolean>(false);

  // latest consulting flag for the loop
  const consultingRef = useRef(isConsulting);
  consultingRef.current = isConsulting;

  const loadBirdImage = () => {
    const birdImage = new Image();
    birdImage.src = `/comfyui/Bird1.png?t=${new Date().getTime()}`;
    birdImage.onload = () => {
      birdImageRef.current = birdImage;
    };
  };

  const initializeBoids = (W: number, H: number, shouldFlyIn: boolean) => {
    const boids: Boid[] = [];

    if (shouldFlyIn) {
      flyInCompleteRef.current = false;

      // Force ALL boids from the same side — fly toward the opposite direction
      const fromLeft = flyInSide === "left";

      for (let i = 0; i < NUM_BOIDS; i++) {
        const startX = fromLeft
          ? -SPAWN_MARGIN - Math.random() * 200
          : W + SPAWN_MARGIN + Math.random() * 200;
        const startY = Math.random() * H;

        // Faster spawn push inward; small vertical variance
        const vx = (fromLeft ? 1 : -1) * (4 + Math.random() * 3) * speed;
        const vy = (Math.random() - 0.5) * 1.0 * speed;

        boids.push({ x: startX, y: startY, vx, vy });
      }
    } else {
      flyInCompleteRef.current = true;
      for (let i = 0; i < NUM_BOIDS; i++) {
        boids.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 2 * speed,
          vy: (Math.random() - 0.5) * 2 * speed,
        });
      }
    }

    return boids;
  };

  useEffect(() => {
    loadBirdImage();

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const parent = canvas.parentElement!;

    let W: number, H: number;

    const resizeCanvas = () => {
      W = canvas.width = parent.clientWidth;
      H = canvas.height = parent.clientHeight;
    };

    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(parent);

    resizeCanvas(); // initial size
    canvas.style.backgroundColor = "transparent";

    // initialize boids
    const boids = initializeBoids(W, H, flyInOnStart);
    boidsRef.current = boids;

    const baseMaxSpeed = BASE_MAX_SPEED;
    const basePerception = PERCEPTION;
    const steerFactorBase = 0.05; // scaled by speed each frame

    function updateBoids() {
      const isConsult = consultingRef.current;
      const globalSpeed = speed * (isConsult ? consultBoost : 1);

      // Check if fly-in is complete — consider sprite size
      if (!flyInCompleteRef.current && flyInOnStart) {
        const allBoidsOnScreen = boids.every(
          (b) => b.x >= BIRD_W * 0.5 && b.x <= W - BIRD_W * 0.5
        );
        if (allBoidsOnScreen) {
          flyInCompleteRef.current = true;
          // normalize/cap after entry
          boids.forEach((b) => {
            const s = Math.hypot(b.vx, b.vy);
            const maxS = baseMaxSpeed * globalSpeed;
            if (s > maxS) {
              b.vx = (b.vx / s) * maxS;
              b.vy = (b.vy / s) * maxS;
            }
          });
        }
      }

      const steerFactor = steerFactorBase * globalSpeed;
      const steerLimit = MAX_FORCE_BASE * globalSpeed;

      boids.forEach((b) => {
        // Only apply flocking behavior after fly-in is complete
        if (flyInCompleteRef.current) {
          let align = { x: 0, y: 0 },
            coh = { x: 0, y: 0 },
            sep = { x: 0, y: 0 };
          let total = 0;

          for (let o of boids) {
            const dx = o.x - b.x;
            const dy = o.y - b.y;
            const d = Math.hypot(dx, dy);
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
            // averages
            align.x /= total;
            align.y /= total;
            coh.x = coh.x / total - b.x;
            coh.y = coh.y / total - b.y;

            // weighted steering — tighter flock via strong cohesion+separation
            const ax = align.x * ALIGN_W + coh.x * COH_W + sep.x * SEP_W;
            const ay = align.y * ALIGN_W + coh.y * COH_W + sep.y * SEP_W;

            // scale by steerFactor then clamp per–frame force
            let addX = ax * steerFactor;
            let addY = ay * steerFactor;
            const addMag = Math.hypot(addX, addY) || 1;
            if (addMag > steerLimit) {
              addX = (addX / addMag) * steerLimit;
              addY = (addY / addMag) * steerLimit;
            }

            b.vx += addX;
            b.vy += addY;
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

            const spiralStrength = 1.5 * globalSpeed;
            const pullStrength = 0.5 * globalSpeed;

            const inwardX = -dx / dist;
            const inwardY = -dy / dist;

            b.vx += perpX * spiralStrength + inwardX * pullStrength;
            b.vy += perpY * spiralStrength + inwardY * pullStrength;
          }
        }

        // limit speed — global cap scales with globalSpeed
        const sNow = Math.hypot(b.vx, b.vy);
        const maxS = baseMaxSpeed * globalSpeed;
        if (sNow > maxS) {
          b.vx = (b.vx / sNow) * maxS;
          b.vy = (b.vy / sNow) * maxS;
        }

        // movement: no wrap during fly-in; wrap after
        if (flyInOnStart && !flyInCompleteRef.current) {
          b.x += b.vx;
          b.y += b.vy;

          // keep them from drifting too far vertically during fly-in
          if (b.y < -SPAWN_MARGIN) b.y = -SPAWN_MARGIN;
          if (b.y > H + SPAWN_MARGIN) b.y = H + SPAWN_MARGIN;
        } else {
          b.x = (b.x + b.vx + W) % W;
          b.y = (b.y + b.vy + H) % H;
        }
      });
    }

    function drawBoids() {
      // Clear with transparent background
      const ctx = canvas.getContext("2d")!;
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);
      ctx.restore();

      const birdImg = birdImageRef.current;

      // consulting glow
      if (consultingRef.current) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#88ddff";
      } else {
        ctx.shadowBlur = 0;
      }

      if (!birdImg) {
        // fallback dots
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
        ctx.rotate(Math.atan2(b.vy, b.vx));
        ctx.drawImage(birdImg, -BIRD_W / 2, -BIRD_H / 2, BIRD_W, BIRD_H);
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
  }, [flyInOnStart, flyInSide, speed, consultBoost]); // re-init when these change

  // optional "jolt" on trigger
  useEffect(() => {
    if (!trigger) return;
    loadBirdImage();

    // randomize velocities — scale by current speed
    boidsRef.current.forEach((b) => {
      b.vx = (Math.random() - 0.5) * 2 * speed;
      b.vy = (Math.random() - 0.5) * 2 * speed;
    });
  }, [trigger, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full bg-transparent"
    />
  );
}
