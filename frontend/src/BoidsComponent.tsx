"use client";

import React, { useRef, useEffect } from 'react';

const BoidsComponent = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    const buffer = document.createElement('canvas');
    buffer.width = width / 4;
    buffer.height = height / 4;
    const bufferCtx = buffer.getContext('2d');

    const boids = [];
    const PREDATOR_COUNT = 8;
    const PREY_COUNT = 32;

    class Boid {
      constructor(x, y, isPredator = false) {
        this.position = { x, y };
        this.velocity = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.isPredator = isPredator;
      }
      update(flock) {
        if (this.isPredator) this.hunt(flock);
        else this.flock(flock);
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.edges();
      }
      flock(flock) {
        let separation = { x: 0, y: 0 }, alignment = { x: 0, y: 0 }, cohesion = { x: 0, y: 0 }, flee = { x: 0, y: 0 };
        let total = 0, predatorCount = 0;
        for (let other of flock) {
          let d = Math.sqrt((this.position.x - other.position.x) ** 2 + (this.position.y - other.position.y) ** 2);
          if (other !== this && d < 50) {
            if (other.isPredator) {
              flee.x += this.position.x - other.position.x;
              flee.y += this.position.y - other.position.y;
              predatorCount++;
            } else {
              separation.x += (this.position.x - other.position.x) / d;
              separation.y += (this.position.y - other.position.y) / d;
              alignment.x += other.velocity.x;
              alignment.y += other.velocity.y;
              cohesion.x += other.position.x;
              cohesion.y += other.position.y;
              total++;
            }
          }
        }
        if (predatorCount > 0) {
          this.velocity.x += flee.x * 0.05;
          this.velocity.y += flee.y * 0.05;
        } else if (total > 0) {
          cohesion.x = (cohesion.x / total - this.position.x) * 0.001;
          cohesion.y = (cohesion.y / total - this.position.y) * 0.001;
          alignment.x = (alignment.x / total - this.velocity.x) * 0.01;
          alignment.y = (alignment.y / total - this.velocity.y) * 0.01;
          this.velocity.x += separation.x * 0.02 + alignment.x + cohesion.x;
          this.velocity.y += separation.y * 0.02 + alignment.y + cohesion.y;
        }
      }
      hunt(flock) {
        let cohesion = { x: 0, y: 0 }, separation = { x: 0, y: 0 };
        let nearestPrey = null, minDistance = Infinity;
        for(let other of flock) {
            let d = Math.sqrt((this.position.x - other.position.x) ** 2 + (this.position.y - other.position.y) ** 2);
            if (other.isPredator && other !== this && d < 50) {
                separation.x += (this.position.x - other.position.x) / d;
                separation.y += (this.position.y - other.position.y) / d;
            } else if (!other.isPredator && d < minDistance) {
                minDistance = d;
                nearestPrey = other;
            }
        }
        if (nearestPrey) {
            cohesion.x = (nearestPrey.position.x - this.position.x) * 0.002;
            cohesion.y = (nearestPrey.position.y - this.position.y) * 0.002;
        }
         this.velocity.x += cohesion.x + separation.x * 0.02;
         this.velocity.y += cohesion.y + separation.y * 0.02;
      }
      edges() {
        if (this.position.x > buffer.width) this.position.x = 0;
        else if (this.position.x < 0) this.position.x = buffer.width;
        if (this.position.y > buffer.height) this.position.y = 0;
        else if (this.position.y < 0) this.position.y = buffer.height;
      }
      draw() {
        bufferCtx.fillStyle = this.isPredator ? '#FFFFFF' : '#888888';
        bufferCtx.fillRect(this.position.x, this.position.y, 2, 2);
      }
    }

    for (let i = 0; i < PREY_COUNT; i++) boids.push(new Boid(Math.random() * buffer.width, Math.random() * buffer.height));
    for (let i = 0; i < PREDATOR_COUNT; i++) boids.push(new Boid(Math.random() * buffer.width, Math.random() * buffer.height, true));

    let animationFrameId;
    const animate = () => {
      bufferCtx.fillStyle = '#000000';
      bufferCtx.fillRect(0, 0, buffer.width, buffer.height);
      for (let boid of boids) {
        boid.update(boids);
        boid.draw();
      }
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [width, height]);

  return <canvas ref={canvasRef} />;
};

export default BoidsComponent;