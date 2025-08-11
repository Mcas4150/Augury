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
const BASE_MAX_SPEED = 8.0;   // Reduced for better control
const PERCEPTION = 38;         // ↓ radius ⇒ tighter flock
const ALIGN_W = 1.0;          // alignment weight (reduced)
const COH_W   = 0.5;          // cohesion weight (reduced) 
const SEP_W   = 1.5;          // separation weight
const MAX_FORCE_BASE = 0.8;   // per–frame steering clamp (increased)
const ATTRACT_W = 8.0;        // mouse attraction weight (significantly increased)

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
  const mousePosition = useRef({ x: -1, y: -1 });

  // latest consulting flag for the loop
  const consultingRef = useRef(isConsulting);
  consultingRef.current = isConsulting;

  // Keep speed ref updated
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const loadBirdImage = () => {
    const birdImage = new Image();
    birdImage.src = `/comfyui/Bird1.png?t=${new Date().getTime()}`;
    birdImage.onload = () => {
      birdImageRef.current = birdImage;
    };
  };

  const initializeBoids = (W: number, H: number, shouldFlyIn: boolean) => {
    const boids: Boid[] = [];
    const currentSpeed = speedRef.current;

    if (shouldFlyIn) {
      flyInCompleteRef.current = false;

      // Force ALL boids from the same side — fly toward center initially
      const fromLeft = flyInSide === "left";
      const targetX = W / 2; // Aim for center initially
      const targetY = H / 2;

      for (let i = 0; i < NUM_BOIDS; i++) {
        const startX = fromLeft
          ? -SPAWN_MARGIN - Math.random() * 200
          : W + SPAWN_MARGIN + Math.random() * 200;
        const startY = Math.random() * H;

        // Direct velocity towards target with some randomness
        const dx = targetX - startX;
        const dy = targetY - startY;
        const dist = Math.hypot(dx, dy);
        
        const vx = (dx / dist) * (3 + Math.random() * 2) * currentSpeed;
        const vy = (dy / dist) * (3 + Math.random() * 2) * currentSpeed;

        boids.push({ x: startX, y: startY, vx, vy });
      }
    } else {
      flyInCompleteRef.current = true;
      for (let i = 0; i < NUM_BOIDS; i++) {
        boids.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 2 * currentSpeed,
          vy: (Math.random() - 0.5) * 2 * currentSpeed,
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

    let W: number = 800, H: number = 600, DPR = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const r = parent.getBoundingClientRect();
      W = Math.floor(r.width * DPR);
      H = Math.floor(r.height * DPR);
      canvas.width = W;
      canvas.height = H;
      canvas.style.width = r.width + "px";
      canvas.style.height = r.height + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // draw in CSS pixels
    };

    // Single mouse tracking system
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left);
      const y = (e.clientY - r.top);
      // inside canvas? else disable attraction
      if (x >= 0 && y >= 0 && x <= r.width && y <= r.height) {
        // Scale mouse coords to match canvas coordinate system
        mousePosition.current = { x: x * DPR, y: y * DPR };
        console.log(`Mouse position: CSS(${x.toFixed(0)}, ${y.toFixed(0)}) -> Canvas(${(x * DPR).toFixed(0)}, ${(y * DPR).toFixed(0)})`);
      } else {
        mousePosition.current = { x: -1, y: -1 };
      }
    };

    canvas.addEventListener("mousemove", onMove);
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(parent);

    resizeCanvas(); // initial size
    canvas.style.backgroundColor = "transparent";

    // initialize boids (W and H are now set from resizeCanvas)
    const boids = initializeBoids(W, H, flyInOnStart);
    boidsRef.current = boids;

    const baseMaxSpeed = BASE_MAX_SPEED;
    const basePerception = PERCEPTION;
    const steerFactorBase = 0.05; // scaled by speed each frame

    function updateBoids() {
      const isConsult = consultingRef.current;
      const currentSpeed = speedRef.current;
      const globalSpeed = currentSpeed * (isConsult ? consultBoost : 1);

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

          // Flocking behavior
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

          // Mouse attraction (when not consulting and mouse is in canvas)
          if (!isConsult && mousePosition.current.x >= 0) {
            const { x: mx, y: my } = mousePosition.current;
            const dx = mx - b.x;
            const dy = my - b.y;
            const dist = Math.hypot(dx, dy) || 1;

            // Simple attraction force
            const attractStrength = ATTRACT_W * globalSpeed;
            const attractX = (dx / dist) * attractStrength;
            const attractY = (dy / dist) * attractStrength;

            // Apply steering limits
            let addX = attractX * steerFactor;
            let addY = attractY * steerFactor;
            
            const addMag = Math.hypot(addX, addY) || 1;
            if (addMag > steerLimit * 2) { // Allow stronger mouse attraction
              addX = (addX / addMag) * steerLimit * 2;
              addY = (addY / addMag) * steerLimit * 2;
            }

            b.vx += addX;
            b.vy += addY;
          }

          // Consulting spiral behavior
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
      canvas.removeEventListener("mousemove", onMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [flyInOnStart, flyInSide, speed, consultBoost]); // re-init when these change

  // optional "jolt" on trigger
  useEffect(() => {
    if (!trigger) return;
    loadBirdImage();

    // randomize velocities — scale by current speed
    const currentSpeed = speedRef.current;
    boidsRef.current.forEach((b) => {
      b.vx = (Math.random() - 0.5) * 2 * currentSpeed;
      b.vy = (Math.random() - 0.5) * 2 * currentSpeed;
    });
  }, [trigger, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full bg-transparent"
    />
  );
}
