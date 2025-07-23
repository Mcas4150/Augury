"use client";

import React, { useEffect, useRef } from 'react';

const GameComponent = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    const PIXEL_RESOLUTION_X = 480;
    const PIXEL_RESOLUTION_Y = 270;
    const buffer = document.createElement('canvas');
    buffer.width = PIXEL_RESOLUTION_X;
    buffer.height = PIXEL_RESOLUTION_Y;
    const bufferCtx = buffer.getContext('2d');
    
    const NODE_RADIUS = 8;
    const MAX_LINKS_PER_NODE = 4;
    const PRESSURE_INCREASE_RATE = 0.5;
    const LINK_BALANCE_FACTOR = 0.01;
    const MOVEMENT_SPEED = 0.2;
    const SEPARATION_DISTANCE = 40;
    const SEPARATION_FORCE = 0.01;
    const EDGE_MARGIN = 50;
    const EDGE_TURN_FORCE = 0.05;
    let nodes = [];
    let links = [];
    let nextNodeId = 0;
    let isDrawingLink = false;
    let startNode = null;
    let mouse = { x: 0, y: 0 };
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
        return bufferCtx.createPattern(patternCanvas, 'repeat');
    }

    const ditherPatterns = [createDitherPattern(0.25), createDitherPattern(0.50), createDitherPattern(0.75), createDitherPattern(1.00)];
    
    class Node {
        constructor(x, y) {
            this.id = nextNodeId++; this.x = x; this.y = y; this.radius = NODE_RADIUS; this.pressure = 0; this.isInverted = false; this.linkCount = 0; this.vx = (Math.random() - 0.5) * MOVEMENT_SPEED; this.vy = (Math.random() - 0.5) * MOVEMENT_SPEED;
        }
        draw() {
            if (this.isInverted) { bufferCtx.fillStyle = ditherPatterns[1]; } else if (this.pressure > 75) { bufferCtx.fillStyle = ditherPatterns[3]; } else if (this.pressure > 50) { bufferCtx.fillStyle = ditherPatterns[2]; } else if (this.pressure > 25) { bufferCtx.fillStyle = ditherPatterns[1]; } else { bufferCtx.fillStyle = ditherPatterns[0]; }
            bufferCtx.beginPath(); bufferCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); bufferCtx.fill(); bufferCtx.strokeStyle = '#FFFFFF'; bufferCtx.stroke();
        }
    }

    let animationFrameId;
    function gameLoop(currentTime) {
        bufferCtx.fillStyle = '#000000'; bufferCtx.fillRect(0, 0, buffer.width, buffer.height);
        updatePressure(); updateNodePositions(); drawLinks(); drawNodes();
        ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    function updatePressure(){
        nodes.forEach(node=>{if(!node.isInverted){node.pressure+=PRESSURE_INCREASE_RATE/60;if(node.pressure>=100){node.pressure=100;node.isInverted=true;}}});
        links.forEach(link=>{const nodeA=link.nodeA;const nodeB=link.nodeB;const pressureDifference=nodeA.pressure-nodeB.pressure;const amountToTransfer=pressureDifference*LINK_BALANCE_FACTOR;nodeA.pressure-=amountToTransfer;nodeB.pressure+=amountToTransfer;if(nodeA.isInverted&&!nodeB.isInverted)nodeB.pressure-=0.1;if(nodeB.isInverted&&!nodeA.isInverted)nodeA.pressure-=0.1;
        nodes.forEach(n=>{if(n.pressure<0)n.pressure=0;if(n.pressure>100)n.pressure=100;});});
    }
    
    function updateNodePositions(){
        nodes.forEach(node=>{let force={x:0,y:0};nodes.forEach(otherNode=>{if(node===otherNode)return;const dx=otherNode.x-node.x;const dy=otherNode.y-node.y;const distance=Math.sqrt(dx*dx+dy*dy);if(distance<SEPARATION_DISTANCE){force.x-=dx/distance*SEPARATION_FORCE;force.y-=dy/distance*SEPARATION_FORCE;}});
        if(node.x<EDGE_MARGIN)force.x+=EDGE_TURN_FORCE;if(node.x>buffer.width-EDGE_MARGIN)force.x-=EDGE_TURN_FORCE;if(node.y<EDGE_MARGIN)force.y+=EDGE_TURN_FORCE;if(node.y>buffer.height-EDGE_MARGIN)force.y-=EDGE_TURN_FORCE;
        node.vx+=force.x;node.vy+=force.y;const speed=Math.sqrt(node.vx*node.vx+node.vy*node.vy);if(speed>MOVEMENT_SPEED){node.vx=(node.vx/speed)*MOVEMENT_SPEED;node.vy=(node.vy/speed)*MOVEMENT_SPEED;}
        node.x+=node.vx;node.y+=node.vy;});
    }

    function drawLinks() {
        bufferCtx.strokeStyle = '#FFFFFF'; bufferCtx.lineWidth = 1;
        links.forEach(link => { bufferCtx.beginPath(); bufferCtx.moveTo(link.nodeA.x, link.nodeA.y); bufferCtx.lineTo(link.nodeB.x, link.nodeB.y); bufferCtx.stroke(); });
        if (isDrawingLink && startNode) {
            const canvasRect = canvas.getBoundingClientRect();
            const relativeX = mouse.x - canvasRect.left;
            const relativeY = mouse.y - canvasRect.top;
            const bufferMouseX = relativeX * (buffer.width / canvas.width);
            const bufferMouseY = relativeY * (buffer.height / canvas.height);
            bufferCtx.strokeStyle = '#FFFFFF'; bufferCtx.lineWidth = 1; bufferCtx.beginPath(); bufferCtx.moveTo(startNode.x, startNode.y); bufferCtx.lineTo(bufferMouseX, bufferMouseY); bufferCtx.stroke();
        }
    }
    
    function drawNodes() { nodes.forEach(node => node.draw()); }
    
    function spawnNode() { const margin = 20; const x = Math.random() * (buffer.width - margin * 2) + margin; const y = Math.random() * (buffer.height - margin * 2) + margin; nodes.push(new Node(x, y)); }
    
    // --- THIS FUNCTION IS THE FIX ---
    function getNodeAt(screenX, screenY) {
        const canvasRect = canvas.getBoundingClientRect();
        const relativeX = screenX - canvasRect.left;
        const relativeY = screenY - canvasRect.top;
        const bufferX = relativeX * (buffer.width / canvas.width);
        const bufferY = relativeY * (buffer.height / canvas.height);
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            const distance = Math.sqrt((bufferX - node.x) ** 2 + (bufferY - node.y) ** 2);
            if (distance < node.radius) { return node; }
        }
        return null;
    }

    const mousedownHandler = (e) => { const clickedNode = getNodeAt(e.clientX, e.clientY); if (clickedNode && clickedNode.linkCount < MAX_LINKS_PER_NODE) { isDrawingLink = true; startNode = clickedNode; } };
    const mousemoveHandler = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const mouseupHandler = (e) => {
        if (isDrawingLink && startNode) { const endNode = getNodeAt(e.clientX, e.clientY); if (endNode && startNode.id !== endNode.id && endNode.linkCount < MAX_LINKS_PER_NODE) { const alreadyExists = links.some(link => (link.nodeA.id === startNode.id && link.nodeB.id === endNode.id) || (link.nodeA.id === endNode.id && link.nodeB.id === startNode.id)); if (!alreadyExists) { links.push({ nodeA: startNode, nodeB: endNode }); startNode.linkCount++; endNode.linkCount++; connectSounds[nextSoundIndex].play(); nextSoundIndex = (nextSoundIndex + 1) % connectSounds.length; spawnNode(); } } }
        isDrawingLink = false; startNode = null;
    };

    canvas.addEventListener('mousedown', mousedownHandler);
    window.addEventListener('mousemove', mousemoveHandler); // Listen on window for mousemove
    window.addEventListener('mouseup', mouseupHandler);     // Listen on window for mouseup
    
    spawnNode(); spawnNode();
    animationFrameId = requestAnimationFrame(gameLoop);
    
    return () => {
        canvas.removeEventListener('mousedown', mousedownHandler);
        window.removeEventListener('mousemove', mousemoveHandler);
        window.removeEventListener('mouseup', mouseupHandler);
        cancelAnimationFrame(animationFrameId);
    };
  }, [width, height]);

  return <canvas id="gameCanvas" ref={canvasRef} width={width} height={height}></canvas>;
};

export default GameComponent;