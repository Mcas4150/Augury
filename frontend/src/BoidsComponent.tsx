"use client";

import React, { useRef, useEffect } from 'react';

const BoidsComponent = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId;
    const mouse = { x: -1000, y: -1000, active: false };

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    const flock = [];
    const SPECIES_A_COUNT = 512;
    const SPECIES_B_COUNT = 128;
    const SPECIES_C_COUNT = 48;

    const Species = { PREY: 0, PREDATOR: 1, ALPHA_PREDATOR: 2 };

    class Boid {
      constructor(x, y, speciesType) {
        this.position = { x, y };
        this.velocity = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };
        this.acceleration = { x: 0, y: 0 };
        this.species = speciesType;
        
        switch (this.species) {
            case Species.ALPHA_PREDATOR:
                this.maxSpeed = 2.0;
                this.maxForce = 0.1;
                break;
            case Species.PREDATOR:
                this.maxSpeed = 2.5;
                this.maxForce = 0.1;
                break;
            case Species.PREY:
            default:
                this.maxSpeed = 2.2;
                this.maxForce = 0.08;
                break;
        }
      }

      applyForce(force) {
        this.acceleration.x += force.x;
        this.acceleration.y += force.y;
      }
      
      applySteer(steer) {
        let mag = Math.hypot(steer.x, steer.y);
        if (mag > this.maxForce) {
            steer.x = (steer.x / mag) * this.maxForce;
            steer.y = (steer.y / mag) * this.maxForce;
        }
        return steer;
      }
      
      seek(target) {
        let desired = { x: target.x - this.position.x, y: target.y - this.position.y };
        let mag = Math.hypot(desired.x, desired.y);
        if (mag > 0) {
            desired.x = (desired.x / mag) * this.maxSpeed;
            desired.y = (desired.y / mag) * this.maxSpeed;
        }
        let steer = { x: desired.x - this.velocity.x, y: desired.y - this.velocity.y };
        return this.applySteer(steer);
      }

      flee(target) {
        let desired = { x: target.x - this.position.x, y: target.y - this.position.y };
        let d = Math.hypot(desired.x, desired.y);
        if (d < 100) {
          let steer = this.seek(target);
          return { x: -steer.x, y: -steer.y };
        }
        return {x: 0, y: 0};
      }
      
      separate(boids) {
        let steer = { x: 0, y: 0 };
        let count = 0;
        const desiredSeparation = 25;

        for (let other of boids) {
          let d = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
          if ((d > 0) && (d < desiredSeparation)) {
            let diff = { x: this.position.x - other.position.x, y: this.position.y - other.position.y };
            diff.x /= d * d;
            diff.y /= d * d;
            steer.x += diff.x;
            steer.y += diff.y;
            count++;
          }
        }
        if (count > 0) {
          steer.x /= count;
          steer.y /= count;
        }
        return this.applySteer(steer);
      }

      align(boids) {
        let steer = { x: 0, y: 0 };
        let count = 0;
        for (let other of boids) {
            steer.x += other.velocity.x;
            steer.y += other.velocity.y;
            count++;
        }
        if (count > 0) {
          steer.x /= count;
          steer.y /= count;
          let mag = Math.hypot(steer.x, steer.y);
          if (mag > 0) {
            steer.x = (steer.x / mag) * this.maxSpeed;
            steer.y = (steer.y / mag) * this.maxSpeed;
          }
          steer.x -= this.velocity.x;
          steer.y -= this.velocity.y;
        }
        return this.applySteer(steer);
      }
      
      cohesion(boids) {
        let steer = { x: 0, y: 0 };
        let count = 0;
        for (let other of boids) {
            steer.x += other.position.x;
            steer.y += other.position.y;
            count++;
        }
        if (count > 0) {
          steer.x /= count;
          steer.y /= count;
          return this.seek({x: steer.x, y: steer.y});
        }
        return steer;
      }

      getNeighbors(boids, radius) {
        const neighbors = [];
        for (let other of boids) {
            if (other !== this) {
                const d = Math.hypot(this.position.x - other.position.x, this.position.y - other.position.y);
                if (d < radius) {
                    neighbors.push(other);
                }
            }
        }
        return neighbors;
      }

      performBehaviors(boids) {
        const neighbors = this.getNeighbors(boids, 75);
        let force;

        if (mouse.active) {
    force = this.seek(mouse); // Boids now follow
    force.x *= 2; // A lower multiplier feels more natural for seeking
    force.y *= 2;
    this.applyForce(force);
}

        switch (this.species) {
            case Species.PREY:
                const predators = neighbors.filter(b => b.species === Species.PREDATOR);
                if (predators.length > 0) {
                    // Priority 1: Flee Predators
                    force = this.flee(predators[0].position);
                    force.x *= 5; force.y *= 5;
                    this.applyForce(force);
                } else {
                    // Priority 2: Hunt Alpha Predators
                    const alphaPredators = neighbors.filter(b => b.species === Species.ALPHA_PREDATOR);
                    if (alphaPredators.length > 0) {
                        force = this.seek(alphaPredators[0].position);
                        force.x *= 2; force.y *= 2;
                        this.applyForce(force);
                    }
                    // Priority 3: Standard Flocking with other Prey
                    const preyNeighbors = neighbors.filter(b => b.species === Species.PREY);
                    if (preyNeighbors.length > 0) {
                        let separateForce = this.separate(preyNeighbors);
                        let alignForce = this.align(preyNeighbors);
                        let cohesionForce = this.cohesion(preyNeighbors);
                        separateForce.x *= 2.0; separateForce.y *= 2.0;
                        this.applyForce(separateForce);
                        this.applyForce(alignForce);
                        this.applyForce(cohesionForce);
                    }
                }
                break;

            case Species.PREDATOR:
                const prey = neighbors.filter(b => b.species === Species.PREY);
                const alphaPredatorsForPredator = neighbors.filter(b => b.species === Species.ALPHA_PREDATOR);
                 if (alphaPredatorsForPredator.length > 0) {
                    force = this.flee(alphaPredatorsForPredator[0].position);
                    force.x *= 5; force.y *= 5;
                    this.applyForce(force);
                } else if (prey.length > 0) {
                    force = this.seek(prey[0].position);
                    force.x *= 2; force.y *= 2;
                    this.applyForce(force);
                }
                break;
            
            case Species.ALPHA_PREDATOR:
                 const predatorsToHunt = neighbors.filter(b => b.species === Species.PREDATOR);
                 if (predatorsToHunt.length > 0) {
                    force = this.seek(predatorsToHunt[0].position);
                    force.x *= 2; force.y *= 2;
                    this.applyForce(force);
                 }
                break;
        }
      }

      update() {
        this.edges();
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        let mag = Math.hypot(this.velocity.x, this.velocity.y);
        if (mag > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / mag) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / mag) * this.maxSpeed;
        }
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.acceleration.x = 0;
        this.acceleration.y = 0;
      }

      edges() {
        const radius = canvas.width / 2;
        const center = { x: radius, y: radius };
        const d = Math.hypot(this.position.x - center.x, this.position.y - center.y);
        const edgeMargin = 50;
        
        if (d > radius - edgeMargin) {
            const steer = {
                x: center.x - this.position.x,
                y: center.y - this.position.y
            };
            const strength = (d - (radius - edgeMargin)) / edgeMargin;
            steer.x *= strength * this.maxForce * 2;
            steer.y *= strength * this.maxForce * 2;
            this.applyForce(steer);
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
        switch (this.species) {
            case Species.ALPHA_PREDATOR:
                ctx.fillStyle = 'white';
                ctx.fillRect(-4, -4, 8, 8);
                break;
            case Species.PREDATOR:
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.moveTo(5, 0);
                ctx.lineTo(-3, -3);
                ctx.lineTo(-3, 3);
                ctx.closePath();
                ctx.fill();
                break;
            case Species.PREY:
            default:
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        ctx.restore();
      }
    }

    const init = () => {
      resizeCanvas();
      flock.length = 0;
      for (let i = 0; i < SPECIES_A_COUNT; i++) flock.push(new Boid(Math.random() * canvas.width, Math.random() * canvas.height, Species.PREY));
      for (let i = 0; i < SPECIES_B_COUNT; i++) flock.push(new Boid(Math.random() * canvas.width, Math.random() * canvas.height, Species.PREDATOR));
      for (let i = 0; i < SPECIES_C_COUNT; i++) flock.push(new Boid(Math.random() * canvas.width, Math.random() * canvas.height, Species.ALPHA_PREDATOR));
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let boid of flock) {
        boid.performBehaviors(flock);
        boid.update();
        boid.draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const mouseMoveHandler = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };
    const mouseEnterHandler = () => { mouse.active = true; };
    const mouseLeaveHandler = () => { mouse.active = false; mouse.x = -1000; mouse.y = -1000; };

    init();
    animate();

    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('mouseenter', mouseEnterHandler);
    canvas.addEventListener('mouseleave', mouseLeaveHandler);
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', mouseMoveHandler);
      canvas.removeEventListener('mouseenter', mouseEnterHandler);
      canvas.removeEventListener('mouseleave', mouseLeaveHandler);
      window.addEventListener('resize', init);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full bg-black" />;
};

export default BoidsComponent;