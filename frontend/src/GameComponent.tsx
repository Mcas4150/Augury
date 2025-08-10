
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const GameComponent = ({onGameWon}) => {
  const canvasRef = useRef(null);
  const [isGameWon, setIsGameWon] = useState(false);
  const [textProps, setTextProps] = useState({ x: 0, y: 0, fontSize: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId;
    let nodes = [];
    let links = [];
    let nextNodeId = 0;
    let isDrawingLink = false;
    let startNode = null;
    let mouse = { x: 0, y: 0 };
    const NODE_RADIUS = 16;
    const MOVEMENT_SPEED = 0.2;
    const SEPARATION_DISTANCE = 80;
    const SEPARATION_FORCE = 0.01;
    const EDGE_MARGIN = 50;
    const EDGE_TURN_FORCE = 0.05;
    const connectSounds = [new Audio('/media/GONG 1.wav'), new Audio('/media/GONG 2.wav')];
    let nextSoundIndex = 0;

    function createDitherPattern(density) {
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = 4;
        patternCanvas.height = 4;
        const pCtx = patternCanvas.getContext('2d');
        pCtx.fillStyle = '#000000';
        pCtx.fillRect(0, 0, 4, 4);
        pCtx.fillStyle = '#FFFFFF';
        const pattern = [[10, 2, 13, 5],[3, 11, 6, 14],[15, 7, 9, 1],[8, 0, 4, 12]];
        const threshold = Math.floor(density * 16);
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (pattern[y][x] < threshold) {
                    pCtx.fillRect(x, y, 1, 1);
                }
            }
        }
        return ctx.createPattern(patternCanvas, 'repeat');
    }
    const ditherPatterns = [createDitherPattern(0.25), createDitherPattern(0.50), createDitherPattern(0.75), createDitherPattern(1.00)];

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        return true;
      }
      return false;
    };

    class Node {
      constructor(x, y) {
        this.id = nextNodeId++; this.x = x; this.y = y; this.radius = NODE_RADIUS; this.linkCount = 0; this.vx = (Math.random() - 0.5) * MOVEMENT_SPEED; this.vy = (Math.random() - 0.5) * MOVEMENT_SPEED;
      }
      draw() {
        ctx.fillStyle = ditherPatterns[2]; 
        ctx.beginPath(); 
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); 
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      }
    }

    function spawnNode() {
        if (nodes.length >= 4) return;
        const quadrantWidth = canvas.width / 2;
        const quadrantHeight = canvas.height / 2;
        const padding = 50;
        let x, y;
        switch (nodes.length) {
            case 0: x = Math.random()*(quadrantWidth-padding*2)+padding; y = Math.random()*(quadrantHeight-padding*2)+padding; break;
            case 1: x = quadrantWidth + Math.random()*(quadrantWidth-padding*2); y = Math.random()*(quadrantHeight-padding*2)+padding; break;
            case 2: x = quadrantWidth + Math.random()*(quadrantWidth-padding*2); y = quadrantHeight + Math.random()*(quadrantHeight-padding*2); break;
            case 3: x = Math.random()*(quadrantWidth-padding*2)+padding; y = quadrantHeight + Math.random()*(quadrantHeight-padding*2); break;
        }
        nodes.push(new Node(x, y));
    }
    
    function linesIntersect(p1, q1, p2, q2) {
        function onSegment(p, q, r) { return q.x<=Math.max(p.x,r.x)&&q.x>=Math.min(p.x,r.x)&&q.y<=Math.max(p.y,r.y)&&q.y>=Math.min(p.y,r.y); }
        function orientation(p, q, r) { const val = (q.y-p.y)*(r.x-q.x)-(q.x-p.x)*(r.y-q.y); if (val === 0) return 0; return (val > 0) ? 1 : 2; }
        const o1 = orientation(p1, q1, p2); const o2 = orientation(p1, q1, q2); const o3 = orientation(p2, q2, p1); const o4 = orientation(p2, q2, q1);
        if (o1!==o2&&o3!==o4) { if ((p1.x===p2.x&&p1.y===p2.y)||(p1.x===q2.x&&p1.y===q2.y)||(q1.x===p2.x&&q1.y===p2.y)||(q1.x===q2.x&&q1.y===q2.y)) return false; return true; }
        return false;
    }

    function getNodeAt(screenX, screenY) {
        const rect = canvas.getBoundingClientRect();
        const x = screenX - rect.left;
        const y = screenY - rect.top;
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            const distance = Math.hypot(x - node.x, y - node.y);
            if (distance < node.radius) return node;
        }
        return null;
    }
    
    function getFittingFontSize(text, nodes) {
        let sumX = 0, sumY = 0;
        let minX = Infinity, maxX = -Infinity;
        nodes.forEach(node => {
            sumX += node.x; sumY += node.y;
            if (node.x < minX) minX = node.x;
            if (node.x > maxX) maxX = node.x;
        });
        const centerX = sumX / nodes.length;
        const centerY = sumY / nodes.length;
        const availableWidth = (maxX - minX) * 0.8;
        let fontSize = 50;
        ctx.font = `bold ${fontSize}px "Cinzel"`;
        while (ctx.measureText(text).width > availableWidth && fontSize > 8) {
            fontSize--;
            ctx.font = `bold ${fontSize}px "Cinzel"`;
        }
        return { centerX, centerY, fontSize };
    }
    
    function updateNodePositions(){
        nodes.forEach(node => {
            let force = { x: 0, y: 0 };
            nodes.forEach(otherNode => {
                if (node === otherNode) return;
                const dx = otherNode.x - node.x;
                const dy = otherNode.y - node.y;
                const distance = Math.hypot(dx, dy);
                if (distance < SEPARATION_DISTANCE) {
                    force.x -= dx / distance * SEPARATION_FORCE;
                    force.y -= dy / distance * SEPARATION_FORCE;
                }
            });
            if (node.x < EDGE_MARGIN) force.x += EDGE_TURN_FORCE;
            if (node.x > canvas.width - EDGE_MARGIN) force.x -= EDGE_TURN_FORCE;
            if (node.y < EDGE_MARGIN) force.y += EDGE_TURN_FORCE;
            if (node.y > canvas.height - EDGE_MARGIN) force.y -= EDGE_TURN_FORCE;
            node.vx += force.x;
            node.vy += force.y;
            const speed = Math.hypot(node.vx, node.vy);
            if (speed > MOVEMENT_SPEED) {
                node.vx = (node.vx / speed) * MOVEMENT_SPEED;
                node.vy = (node.vy / speed) * MOVEMENT_SPEED;
            }
            node.x += node.vx;
            node.y += node.vy;
        });
    }

    function drawLinks() {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        links.forEach(link => {
            ctx.beginPath();
            ctx.moveTo(link.nodeA.x, link.nodeA.y);
            ctx.lineTo(link.nodeB.x, link.nodeB.y);
            ctx.stroke();
        });
        if (isDrawingLink && startNode) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = mouse.x - rect.left;
            const mouseY = mouse.y - rect.top;
            ctx.beginPath();
            ctx.moveTo(startNode.x, startNode.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
        }
    }

    function drawNodes() {
        nodes.forEach(node => node.draw());
    }
    
    let localGameWon = false;
    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!localGameWon) updateNodePositions();

      if (localGameWon) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        const orderedNodes = nodes.sort((a, b) => a.id - b.id);
        ctx.moveTo(orderedNodes[0].x, orderedNodes[0].y);
        for (let i = 1; i < orderedNodes.length; i++) ctx.lineTo(orderedNodes[i].x, orderedNodes[i].y);
        ctx.closePath();
        ctx.fill();
      }

      drawLinks(); 
      drawNodes();
      animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    const mousedownHandler = (e) => { const clickedNode = getNodeAt(e.clientX, e.clientY); if (clickedNode) { isDrawingLink = true; startNode = clickedNode; } };
    const mousemoveHandler = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    
    const mouseupHandler = (e) => {
        if (isDrawingLink && startNode) {
            const endNode = getNodeAt(e.clientX, e.clientY);
            if (endNode && startNode.id !== endNode.id) {
                const alreadyExists = links.some(link => (link.nodeA.id === startNode.id && link.nodeB.id === endNode.id) || (link.nodeA.id === endNode.id && link.nodeB.id === startNode.id));
                const canConnect = startNode.linkCount < 2 && endNode.linkCount < 2;
                let isCrossing = false;
                for (const link of links) {
                    if (linesIntersect(startNode, endNode, link.nodeA, link.nodeB)) {
                        isCrossing = true;
                        break;
                    }
                }
                if (!alreadyExists && canConnect && !isCrossing) {
                    links.push({ nodeA: startNode, nodeB: endNode });
                    startNode.linkCount++;
                    endNode.linkCount++;
                    connectSounds[nextSoundIndex].play();
                    nextSoundIndex = (nextSoundIndex + 1) % connectSounds.length;
                    
                    if (nodes.length < 4) {
                        spawnNode();
                    } else if (nodes.length === 4) {
                        const allNodesConnected = nodes.every(node => node.linkCount >= 2);
                        if (allNodesConnected) {
                            localGameWon = true;
                            setIsGameWon(true);
                            const props = getFittingFontSize("Take The Auspices", nodes);
                            setTextProps(props);
                            nodes.forEach(node => { node.vx = 0; node.vy = 0; });
                                                        if (onGameWon) {
                              onGameWon(props);
                            }
                        }
                    }
                }
            }
        }
        isDrawingLink = false;
        startNode = null;
    };

    if (resizeCanvas()) {
        spawnNode(); 
        spawnNode(); 
        gameLoop();
        canvas.addEventListener('mousedown', mousedownHandler);
        window.addEventListener('mousemove', mousemoveHandler);
        window.addEventListener('mouseup', mouseupHandler);
    }
    
    return () => {
        cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousedown', mousedownHandler);
        window.removeEventListener('mousemove', mousemoveHandler);
        window.removeEventListener('mouseup', mouseupHandler);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas id="gameCanvas" ref={canvasRef} className="w-full h-full"></canvas>
      {/* {isGameWon && (
        // <div
          
        //   className="absolute font-roman text-white hover:text-gray-300"
        //   style={{
        //     left: `${textProps.centerX}px`,
        //     top: `${textProps.centerY}px`,
        //     fontSize: `${textProps.fontSize}px`,
        //     transform: 'translate(-50%, -50%)',
        //     textAlign: 'center'
        //   }}
        // >
        //   Take The Auspices
        // </div>
      )} */}
    </div>
  );
};

export default GameComponent;