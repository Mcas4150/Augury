import React, { useRef, useEffect, useCallback, useState } from 'react';

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
}

interface BoidsCanvas3Props {
  onDirectionDetermined: (direction: "left" | "right") => void;
  showControls?: boolean; // when true the on-screen sliders are shown
}

const BoidsCanvas3: React.FC<BoidsCanvas3Props> = ({ onDirectionDetermined, showControls = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const birdImgRef = useRef<HTMLImageElement | null>(null);
  const boids = useRef<Boid[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const numBoids = 30;
  const [visualRange, setVisualRange] = useState(75); // How far boids can see
  const [protectedRange, setProtectedRange] = useState(22); // Personal space
  const [centeringFactor, setCenteringFactor] = useState(0.0005); // Adjust velocity to move towards center of mass
  const [avoidFactor, setAvoidFactor] = useState(0.12); // Adjust velocity to avoid collisions
  const [matchingFactor, setMatchingFactor] = useState(0.05); // Adjust velocity to match nearby boids
  const turnFactor = 0.05; // How sharply boids turn to stay on screen
  const maxSpeed = 2;
  const minSpeed = 1;
  const [flockTightness, setFlockTightness] = useState(1.5); // Lower value means tighter flock

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  // Refs for live-updating parameter values so the running animation reads the latest values
  const visualRangeRef = useRef(75);
  const protectedRangeRef = useRef(80);
  const centeringFactorRef = useRef(0.0005);
  const avoidFactorRef = useRef(0.5);
  const matchingFactorRef = useRef(0.05);
  const flockTightnessRef = useRef(0.5);

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
    // read live values from refs
    const vr = visualRangeRef.current;
    const cf = centeringFactorRef.current;
    const ft = flockTightnessRef.current;

    let centerX = 0;
    let centerY = 0;
    let numNeighbors = 0;

    for (let otherBoid of boids.current) {
      if (boid !== otherBoid) {
        const dx = boid.x - otherBoid.x;
        const dy = boid.y - otherBoid.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < vr) {
          centerX += otherBoid.x;
          centerY += otherBoid.y;
          numNeighbors++;
        }
      }
    }

    if (numNeighbors > 0) {
      centerX = centerX / numNeighbors;
      centerY = centerY / numNeighbors;

      boid.vx += (centerX - boid.x) * cf * ft;
      boid.vy += (centerY - boid.y) * cf * ft;
    }
  }, []); // uses refs for live values

  const avoidOthers = useCallback((boid: Boid) => {
    const pr = protectedRangeRef.current;
    const af = avoidFactorRef.current;

    let moveX = 0;
    let moveY = 0;
    let count = 0;

    for (let otherBoid of boids.current) {
      if (boid === otherBoid) continue;
      const dx = boid.x - otherBoid.x;
      const dy = boid.y - otherBoid.y;
      const dist = Math.hypot(dx, dy) || 0.0001;

      if (dist < pr) {
        // normalized direction away from the neighbor
        const nx = dx / dist;
        const ny = dy / dist;

        // strength ranges 0..1 (0 at protectedRange, 1 at overlap)
        const strength = (pr - dist) / pr;

        // non-linear falloff so very-close boids are pushed away more strongly
        const falloff = strength * strength;

        moveX += nx * falloff;
        moveY += ny * falloff;
        count++;
      }
    }

    if (count > 0) {
      // average the contributions and apply scaled avoidance
      boid.vx += (moveX / count) * af;
      boid.vy += (moveY / count) * af;
    }
  }, []); // uses refs for live values

  const matchVelocity = useCallback((boid: Boid) => {
    const vr = visualRangeRef.current;
    const mf = matchingFactorRef.current;

    let avgVX = 0;
    let avgVY = 0;
    let numNeighbors = 0;

    for (let otherBoid of boids.current) {
      if (boid !== otherBoid) {
        const dx = boid.x - otherBoid.x;
        const dy = boid.y - otherBoid.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < vr) {
          avgVX += otherBoid.vx;
          avgVY += otherBoid.vy;
          numNeighbors++;
        }
      }
    }

    if (numNeighbors > 0) {
      avgVX = avgVX / numNeighbors;
      avgVY = avgVY / numNeighbors;

      boid.vx += (avgVX - boid.vx) * mf;
      boid.vy += (avgVY - boid.vy) * mf;
    }
  }, []); // uses refs for live values

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
    <>
      {showControls && (
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 30,
        background: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 8,
        color: '#fff',
        fontSize: 12,
        pointerEvents: 'auto',
        width: 220,
      }}>
        <div style={{ marginBottom: 8 }}>
          <div>Protected Range: {protectedRange}px</div>
          <input
            type="range"
            min={5}
            max={80}
            value={protectedRange}
            onChange={(e) => {
              const v = Number(e.target.value);
              setProtectedRange(v);
              protectedRangeRef.current = v;
            }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <div>Avoid Factor: {avoidFactor.toFixed(3)}</div>
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.005}
            value={avoidFactor}
            onChange={(e) => {
              const v = Number(e.target.value);
              setAvoidFactor(v);
              avoidFactorRef.current = v;
            }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <div>Visual Range: {visualRange}px</div>
          <input
            type="range"
            min={10}
            max={300}
            value={visualRange}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVisualRange(v);
              visualRangeRef.current = v;
            }}
          />
        </div>
        <div>
          <div>Flock Tightness: {flockTightness.toFixed(2)}</div>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.05}
            value={flockTightness}
            onChange={(e) => {
              const v = Number(e.target.value);
              setFlockTightness(v);
              flockTightnessRef.current = v;
            }}
          />
        </div>
      </div>
      )}

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
    </>
  );
};

export default BoidsCanvas3;
