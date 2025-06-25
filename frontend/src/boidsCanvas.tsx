"use client"

import { useRef, useEffect } from "react";

interface BoidsCanvasProps {
  /**
   * When this value changes, boid parameters will be re-randomized.
   */
  trigger?: number;
}

/**
 * BoidsCanvas.tsx
 * A simple Boids (flocking) simulation that reshapes its behavior on `trigger`.
 * Fills its parent container size via absolute positioning.
 */
export default function BoidsCanvas({ trigger }: BoidsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas resolution to parent
    const parent = canvas.parentElement;
    const width = parent?.clientWidth ?? 400;
    const height = parent?.clientHeight ?? 400;
    canvas.width = width;
    canvas.height = height;

    // Randomize params on each trigger
    const maxSpeed = 1 + Math.random() * 3;
    const perception = 30 + Math.random() * 70;
    const steerFactor = 0.03 + Math.random() * 0.07;
    const numBoids = 50;

    const boids = Array.from({ length: numBoids }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * maxSpeed,
      vy: (Math.random() - 0.5) * maxSpeed,
    }));

    function updateBoids() {
      boids.forEach(boid => {
        let align = { x: 0, y: 0 };
        let coh = { x: 0, y: 0 };
        let sep = { x: 0, y: 0 };
        let total = 0;

        boids.forEach(other => {
          const dx = other.x - boid.x;
          const dy = other.y - boid.y;
          const dist = Math.hypot(dx, dy);
          if (other !== boid && dist < perception) {
            align.x += other.vx;
            align.y += other.vy;
            coh.x += other.x;
            coh.y += other.y;
            sep.x += boid.x - other.x;
            sep.y += boid.y - other.y;
            total++;
          }
        });

        if (total > 0) {
          align.x /= total;
          align.y /= total;
          coh.x = coh.x / total - boid.x;
          coh.y = coh.y / total - boid.y;

          boid.vx += align.x * steerFactor + coh.x * steerFactor + sep.x * steerFactor;
          boid.vy += align.y * steerFactor + coh.y * steerFactor + sep.y * steerFactor;
        }

        const speed = Math.hypot(boid.vx, boid.vy);
        if (speed > maxSpeed) {
          boid.vx = (boid.vx / speed) * maxSpeed;
          boid.vy = (boid.vy / speed) * maxSpeed;
        }

        boid.x += boid.vx;
        boid.y += boid.vy;

        // wrap around
        if (boid.x < 0) boid.x = width;
        if (boid.x > width) boid.x = 0;
        if (boid.y < 0) boid.y = height;
        if (boid.y > height) boid.y = 0;
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#fff";
      boids.forEach(boid => {
        ctx.beginPath();
        ctx.arc(boid.x, boid.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    let raf: number;
    const animate = () => {
      updateBoids();
      draw();
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(raf);
  // re-run effect on trigger change
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
