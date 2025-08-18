import React, { useRef, useEffect, useCallback } from 'react';

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
}

interface BoidsCanvas3Props {
  onDirectionDetermined: (direction: "left" | "right") => void;
}

const BoidsCanvas3: React.FC<BoidsCanvas3Props> = ({ onDirectionDetermined }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const birdImgRef = useRef<HTMLImageElement | null>(null);
  const boids = useRef<Boid[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const numBoids = 30;
  const visualRange = 75; // How far boids can see
  const protectedRange = 22; // How close boids try to stay from each other (slightly increased)
  const centeringFactor = 0.0005; // Adjust velocity to move towards center of mass
  const avoidFactor = 0.12; // Adjust velocity to avoid collisions (slightly stronger)
  const matchingFactor = 0.05; // Adjust velocity to match nearby boids
  const turnFactor = 0.05; // How sharply boids turn to stay on screen
  const maxSpeed = 2;
  const minSpeed = 1;
  const flockTightness = 1.5; // Lower value means tighter flock

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  const initBoids = useCallback(() => {
    boids.current = [];
    const entrySide = Math.random() < 0.5 ? 'left' : 'right'; // Randomly choose entry side
    onDirectionDetermined(entrySide);

    for (let i = 0; i < numBoids; i++) {
      let x, y, vx, vy;

      if (entrySide === 'left') {
        x = Math.random() * 100 - 200; // Start off-screen left
        y = Math.random() * canvasHeight;
        vx = Math.random() * (maxSpeed - minSpeed) + minSpeed; // Initial velocity towards right
        vy = Math.random() * (maxSpeed - minSpeed) - (maxSpeed - minSpeed) / 2;
      } else {
        x = Math.random() * 100 + canvasWidth + 100; // Start off-screen right
        y = Math.random() * canvasHeight;
        vx = -(Math.random() * (maxSpeed - minSpeed) + minSpeed); // Initial velocity towards left
        vy = Math.random() * (maxSpeed - minSpeed) - (maxSpeed - minSpeed) / 2;
      }

      boids.current.push({ x, y, vx, vy, angle: Math.atan2(vy, vx) + Math.PI / 2 });
    }
  }, [canvasHeight, canvasWidth, maxSpeed, minSpeed, numBoids, onDirectionDetermined]);

  useEffect(() => {
    const img = new Image();
    img.src = '/comfyui/Bird1.png'; // Assuming this is the bird image
    img.onload = () => {
      birdImgRef.current = img;
      initBoids();
      if (canvasRef.current) {
        animate();
      }
    };
    img.onerror = () => {
      console.error("Failed to load bird image.");
      initBoids(); // Initialize boids even if image fails to load
      if (canvasRef.current) {
        animate();
      }
    };

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [initBoids]);

  const keepWithinBounds = useCallback((boid: Boid) => {
    const margin = 200; // Margin from edges to start turning
    const turnSpeed = 0.05; // How sharply boids turn

    if (boid.x < margin) boid.vx += turnSpeed;
    if (boid.x > canvasWidth - margin) boid.vx -= turnSpeed;
    if (boid.y < margin) boid.vy += turnSpeed;
    if (boid.y > canvasHeight - margin) boid.vy -= turnSpeed;
  }, [canvasWidth, canvasHeight]);

  const flyTowardsCenter = useCallback((boid: Boid) => {
    let centerX = 0;
    let centerY = 0;
    let numNeighbors = 0;

    for (let otherBoid of boids.current) {
      if (boid !== otherBoid) {
        const dx = boid.x - otherBoid.x;
        const dy = boid.y - otherBoid.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < visualRange) {
          centerX += otherBoid.x;
          centerY += otherBoid.y;
          numNeighbors++;
        }
      }
    }

    if (numNeighbors > 0) {
      centerX = centerX / numNeighbors;
      centerY = centerY / numNeighbors;

      boid.vx += (centerX - boid.x) * centeringFactor * flockTightness;
      boid.vy += (centerY - boid.y) * centeringFactor * flockTightness;
    }
  }, [centeringFactor, visualRange, flockTightness]);

  const avoidOthers = useCallback((boid: Boid) => {
    let moveX = 0;
    let moveY = 0;
    let count = 0;

    for (let otherBoid of boids.current) {
      if (boid === otherBoid) continue;
      const dx = boid.x - otherBoid.x;
      const dy = boid.y - otherBoid.y;
      const dist = Math.hypot(dx, dy) || 0.0001;

      if (dist < protectedRange) {
        // normalized direction away from the neighbor
        const nx = dx / dist;
        const ny = dy / dist;

        // strength ranges 0..1 (0 at protectedRange, 1 at overlap)
        const strength = (protectedRange - dist) / protectedRange;

        // non-linear falloff so very-close boids are pushed away more strongly
        const falloff = strength * strength;

        moveX += nx * falloff;
        moveY += ny * falloff;
        count++;
      }
    }

    if (count > 0) {
      // average the contributions and apply scaled avoidance
      boid.vx += (moveX / count) * avoidFactor;
      boid.vy += (moveY / count) * avoidFactor;
    }
  }, [avoidFactor, protectedRange]);

  const matchVelocity = useCallback((boid: Boid) => {
    let avgVX = 0;
    let avgVY = 0;
    let numNeighbors = 0;

    for (let otherBoid of boids.current) {
      if (boid !== otherBoid) {
        const dx = boid.x - otherBoid.x;
        const dy = boid.y - otherBoid.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < visualRange) {
          avgVX += otherBoid.vx;
          avgVY += otherBoid.vy;
          numNeighbors++;
        }
      }
    }

    if (numNeighbors > 0) {
      avgVX = avgVX / numNeighbors;
      avgVY = avgVY / numNeighbors;

      boid.vx += (avgVX - boid.vx) * matchingFactor;
      boid.vy += (avgVY - boid.vy) * matchingFactor;
    }
  }, [matchingFactor, visualRange]);

  const limitSpeed = useCallback((boid: Boid) => {
    const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
    if (speed > maxSpeed) {
      boid.vx = (boid.vx / speed) * maxSpeed;
      boid.vy = (boid.vy / speed) * maxSpeed;
    }
    if (speed < minSpeed) {
      boid.vx = (boid.vx / speed) * minSpeed;
      boid.vy = (boid.vy / speed) * minSpeed;
    }
  }, [maxSpeed, minSpeed]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let boid of boids.current) {
      flyTowardsCenter(boid);
      avoidOthers(boid);
      matchVelocity(boid);
      keepWithinBounds(boid); // Keep boids within bounds
      limitSpeed(boid);

      boid.x += boid.vx;
      boid.y += boid.vy;

      // If boid goes off screen, reinitialize it to come from the other side
      if (boid.x < -200 || boid.x > canvas.width + 200 || boid.y < -200 || boid.y > canvas.height + 200) {
        const entrySide = Math.random() < 0.5 ? 'left' : 'right';
        if (entrySide === 'left') {
          boid.x = Math.random() * 100 - 200;
          boid.y = Math.random() * canvas.height;
          boid.vx = Math.random() * (maxSpeed - minSpeed) + minSpeed;
          boid.vy = Math.random() * (maxSpeed - minSpeed) - (maxSpeed - minSpeed) / 2;
        } else {
          boid.x = Math.random() * 100 + canvas.width + 100;
          boid.y = Math.random() * canvas.height;
          boid.vx = -(Math.random() * (maxSpeed - minSpeed) + minSpeed);
          boid.vy = Math.random() * (maxSpeed - minSpeed) - (maxSpeed - minSpeed) / 2;
        }
        boid.angle = Math.atan2(boid.vy, boid.vx) + Math.PI / 2;
      }

      if (birdImgRef.current) {
        const targetAngle = Math.atan2(boid.vy, boid.vx) + Math.PI / 2;
        let delta = targetAngle - boid.angle;

        // Normalize the delta to be between -PI and PI
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;

        // Apply smoothing
        boid.angle += delta * 0.1;

        ctx.save();
        const imgWidth = birdImgRef.current.width / 3;
        const imgHeight = birdImgRef.current.height / 3;
        ctx.translate(boid.x, boid.y);
        ctx.rotate(boid.angle);
        ctx.drawImage(birdImgRef.current, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
        ctx.restore();
      } else {
        // Fallback for drawing boid if image not loaded
        ctx.beginPath();
        ctx.arc(boid.x, boid.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
      }
    }

    animationFrameId.current = requestAnimationFrame(animate);
  }, [flyTowardsCenter, avoidOthers, matchVelocity, keepWithinBounds, limitSpeed, maxSpeed, minSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }
  }, [canvasWidth, canvasHeight]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'transparent',
        zIndex: 10, // Ensure it's above other elements if needed
        pointerEvents: 'none', // Allow clicks to pass through
      }}
    />
  );
};

export default BoidsCanvas3;
