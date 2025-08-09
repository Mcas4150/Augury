"use client";
import React, { useRef, useEffect } from 'react';

const RelevanceComponent = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId;

    // --- Correctly initialized state variables ---
    let seeker, goal, departure;
    const distractors = [];
    const completedPaths = [];
    const TENTACLE_COUNT = 10;
    
    const setup = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
      
      distractors.length = 0; // Now works because distractors is an array
      completedPaths.length = 0;

      for (let i = 0; i < 150; i++) {
          distractors.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
          });
      }
      createNewSeekerAndGoal();
    };

    const createNewSeekerAndGoal = () => {
      const padding = 50;
      const startY = Math.random() * (canvas.height - padding * 2) + padding;
      
      seeker = { 
        x: padding, 
        y: startY,
        speed: 1.5 
      };
      departure = {
        x: padding,
        y: startY,
        radius: 10
      };
      goal = { 
        x: canvas.width - padding, 
        y: Math.random() * (canvas.height - padding * 2) + padding, 
        radius: 10,
        reached: false,
      };
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      distractors.forEach(d => {
        ctx.fillStyle = `rgba(255, 255, 255, 0.5)`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1, 0, Math.PI * 2);
        ctx.fill();
      });

      completedPaths.forEach(path => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(path.startX, path.startY);
        ctx.lineTo(path.endX, path.endY);
        ctx.stroke();
      });
      ctx.lineWidth = 1;

      if (!goal.reached) {
        const dx = goal.x - seeker.x;
        const dy = goal.y - seeker.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance > seeker.speed) {
            seeker.x += (dx / distance) * seeker.speed;
            seeker.y += (dy / distance) * seeker.speed;
        } else {
            goal.reached = true;
            completedPaths.push({ startX: departure.x, startY: departure.y, endX: goal.x, endY: goal.y });
            createNewSeekerAndGoal(); 
        }
      }
      
      // Draw Departure Node
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(departure.x, departure.y, departure.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Goal Node
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(goal.x, goal.y, goal.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw current seeker
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(seeker.x, seeker.y, 4, 0, Math.PI * 2);
      ctx.fill();

      if (!goal.reached) {
        let closeDistractors = [...distractors].sort((a,b) => 
            Math.hypot(a.x-seeker.x, a.y-seeker.y) - Math.hypot(b.x-seeker.x, b.y-seeker.y)
        ).slice(0, TENTACLE_COUNT);

        closeDistractors.forEach((d, i) => {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + (Math.sin(Date.now() * 0.005 + i) * 0.05)})`;
            ctx.beginPath();
            ctx.moveTo(seeker.x, seeker.y);
            ctx.lineTo(d.x, d.y);
            ctx.stroke();
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    setup();
    animate();

    const handleResize = () => setup();
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
};

export default RelevanceComponent;