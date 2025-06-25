
"use client";

import { useRef, useEffect } from "react";

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
}
interface CloudParticle {
  dx: number;
  dy: number;
  radius: number;
  alpha: number;
}

/**
 * BoidsCanvas.tsx
 * Standard boids flocking with fluffy, visible cloud clusters at the top.
 * Resizes to its parent container via absolute positioning.
 */
export default function BoidsCanvas({ trigger }: { trigger?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    const width = parent?.clientWidth ?? 400;
    const height = parent?.clientHeight ?? 400;
    canvas.width = width;
    canvas.height = height;

    // BOIDS SETUP
    const boids: Boid[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    }));
    const maxSpeed = 2;
    const perception = 50;
    const steerFactor = 0.05;

    // CLOUD SETUP — each cloud is 5–8 overlapping puffs
    const clouds: {
      x: number;
      y: number;
      speed: number;
      particles: CloudParticle[];
    }[] = Array.from({ length: 48 }, () => {
      const baseR = 5 + Math.random() * 25;
      const particles: CloudParticle[] = Array.from(
        { length: 5 + Math.floor(Math.random() * 4) },
        () => ({
          dx: (Math.random() - 0.5) * baseR * 1.2,
          dy: (Math.random() - 0.5) * baseR * 0.5,
          radius: baseR * (0.6 + Math.random() * 0.4),
          alpha: 0.1 + Math.random() * 0.2,
        })
      );
      return {
        x: Math.random() * width,
        y: Math.random() * (height * 0.15) + 350,
        speed: 0.1 + Math.random() * 0.3,
        particles,
      };
    });

    function updateBoids() {
      boids.forEach((b) => {
        let align = { x: 0, y: 0 },
          coh = { x: 0, y: 0 },
          sep = { x: 0, y: 0 };
        let total = 0;
        boids.forEach((o) => {
          const dx = o.x - b.x;
          const dy = o.y - b.y;
          const d = Math.hypot(dx, dy);
          if (o !== b && d < perception) {
            align.x += o.vx;
            align.y += o.vy;
            coh.x += o.x;
            coh.y += o.y;
            sep.x += b.x - o.x;
            sep.y += b.y - o.y;
            total++;
          }
        });
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
        const speed = Math.hypot(b.vx, b.vy);
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed;
          b.vy = (b.vy / speed) * maxSpeed;
        }
        b.x = (b.x + b.vx + width) % width;
        b.y = (b.y + b.vy + height) % height;
      });
    }

    function updateClouds() {
      clouds.forEach((c) => {
        c.x += c.speed;
        if (c.x - 100 > width) c.x = -100;
      });
    }

    function drawClouds() {
      clouds.forEach((c) => {
        c.particles.forEach((p) => {
          ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
          ctx.beginPath();
          ctx.arc(c.x + p.dx, c.y + p.dy, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    }

    function drawBoids() {
      ctx.fillStyle = "#fff";
      boids.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 1.25, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    let raf: number;
    const loop = () => {
      // updateClouds();
      updateBoids();
      ctx.clearRect(0, 0, width, height);
      // drawClouds();
      drawBoids();
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => cancelAnimationFrame(raf);
  }, [trigger]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
