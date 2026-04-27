import { useEffect, useRef, MutableRefObject } from 'react';
import { SystemMode } from './types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseVx: number;
  baseVy: number;
}

export function DynamicBackground({ 
  isMeltdown, 
  mode,
  gravityForce = 0.5,
  isGravityNullified = false,
  vortexRef
}: { 
  isMeltdown: boolean; 
  mode: SystemMode;
  gravityForce?: number;
  isGravityNullified?: boolean;
  vortexRef?: MutableRefObject<{x: number, y: number, isDragging: boolean}>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  const meltdownRef = useRef(isMeltdown);
  const gravityForceRef = useRef(gravityForce);
  const gravityNullifiedRef = useRef(isGravityNullified);
  const transitionRef = useRef(0);
  const transitionTriggerRef = useRef(false);

  useEffect(() => {
    transitionRef.current = 1;
    transitionTriggerRef.current = true;
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => { meltdownRef.current = isMeltdown; }, [isMeltdown]);
  useEffect(() => { gravityForceRef.current = gravityForce; }, [gravityForce]);
  useEffect(() => { gravityNullifiedRef.current = isGravityNullified; }, [isGravityNullified]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 12000);
      for (let i = 0; i < numParticles; i++) {
        const vx = (Math.random() - 0.5) * 1.5;
        const vy = (Math.random() - 0.5) * 1.5;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx,
          vy,
          baseVx: vx,
          baseVy: vy,
          size: Math.random() * 2 + 1,
        });
      }
    };

    let mouseX = -1000;
    let mouseY = -1000;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    resize();

    const draw = () => {
      ctx.save();
      // Apply glitch translations if transitioning
      if (transitionRef.current > 0.5 && Math.random() > 0.6) {
        ctx.translate((Math.random() - 0.5) * 40 * transitionRef.current, (Math.random() - 0.5) * 10 * transitionRef.current);
      }
      
      ctx.clearRect(-50, -50, canvas.width + 100, canvas.height + 100);
      
      if (transitionRef.current > 0) {
        transitionRef.current -= 0.02;
        if (transitionRef.current < 0) transitionRef.current = 0;
      }
      
      const currentMeltdown = meltdownRef.current;
      const currentMode = modeRef.current;
      const currentGravityForce = gravityForceRef.current;
      const currentGravityNullified = gravityNullifiedRef.current;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Handle Particle Burst on transition
      if (transitionTriggerRef.current) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            // Explode outwards
            p.vx += (dx / dist) * (Math.random() * 25 + 10);
            p.vy += (dy / dist) * (Math.random() * 25 + 10);
          } else {
            p.vx += (Math.random() - 0.5) * 30;
            p.vy += (Math.random() - 0.5) * 30;
          }
        }
        transitionTriggerRef.current = false;
      }

      const baseSpeedMultiplier = currentMeltdown ? 4 : 1;
      const speedMultiplier = baseSpeedMultiplier + transitionRef.current * 10;
      
      const primaryColor = currentMeltdown ? '#ffb4ab' : '#00ff41'; // Error color or Default Neon Green
      const transitionColor = `rgba(255, 255, 255, ${transitionRef.current})`;
      const maxDistance = 150 + transitionRef.current * 100;
      
      let vX = centerX;
      let vY = centerY;
      let vortexForce = 1;
      
      if (currentMode === SystemMode.VORTEX_MGR && vortexRef && vortexRef.current) {
          if (vortexRef.current.isDragging) {
              vortexForce = 15;
          } else {
              vortexForce = 4;
          }
          if (vortexRef.current.x !== 0 || vortexRef.current.y !== 0) {
              vX = vortexRef.current.x;
              vY = vortexRef.current.y;
          }
      }

      ctx.strokeStyle = primaryColor;
      
      // Use standard composite operation, or lighter if transitioning
      ctx.globalCompositeOperation = transitionRef.current > 0 ? "screen" : "source-over";

      // Draw explicit vortex core particles if VORTEX_MGR mode
      if (currentMode === SystemMode.VORTEX_MGR) {
          ctx.fillStyle = primaryColor;
          const time = Date.now() / 1000;
          const numParticles = 800;
          for (let i = 0; i < numParticles; i++) {
              const normalizedI = i / numParticles; 
              const armOffset = (i % 4) * (Math.PI / 2);
              
              // Radius varies, some jitter added
              const r = Math.pow(normalizedI, 1.2) * 350 * (vortexForce > 4 ? 1.5 : 1) + (Math.sin(time * 2 + i) * 5);
              
              // Angle creates the spiral
              const speed = vortexForce > 4 ? 4 : 2;
              const angle = armOffset + (time * speed) - (r * 0.015); 
              
              const px = vX + Math.cos(angle) * r;
              const py = vY + Math.sin(angle) * r;
              
              const pSize = (Math.sin(i * 123.456) * 0.5 + 0.5) * 2 + 0.5;
              
              ctx.beginPath();
              ctx.arc(px, py, pSize, 0, Math.PI * 2);
              ctx.globalAlpha = Math.max(0, 0.8 - (r / 400));
              ctx.fill();
          }
          ctx.globalAlpha = 1.0;
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        ctx.fillStyle = transitionRef.current > 0.5 ? '#ffffff' : primaryColor;
        
        if (currentMode === SystemMode.GRAVITY_NULL) {
          if (!currentGravityNullified) {
            p.vy += currentGravityForce * 0.1; // Simulated pull
          } else {
            p.vx *= 0.99;
            p.vy *= 0.99; // Drift slowly around
          }
        } else if (currentMode === SystemMode.VORTEX_MGR) {
          // Spiral towards center
          const dx = vX - p.x;
          const dy = vY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 15) {
            const tangentX = -dy / dist;
            const tangentY = dx / dist;
            const pullX = dx / dist;
            const pullY = dy / dist;
            
            // combine tangent (spiral around) and pull (towards center)
            const spiralForceX = tangentX * 0.8 + pullX * 0.4;
            const spiralForceY = tangentY * 0.8 + pullY * 0.4;
            
            p.vx += spiralForceX * vortexForce * 0.15;
            p.vy += spiralForceY * vortexForce * 0.15;
            
            // Speed limit
            const speedLimit = 12 * (vortexForce > 4 ? 1.5 : 1);
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > speedLimit) {
              p.vx = (p.vx / speed) * speedLimit;
              p.vy = (p.vy / speed) * speedLimit;
            }
          } else {
              p.vx *= 0.5;
              p.vy *= 0.5;
          }
        } else {
          // Normal mode: return to base velocities slowly
          p.vx = p.vx * 0.95 + p.baseVx * 0.05;
          p.vy = p.vy * 0.95 + p.baseVy * 0.05;
        }

        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;
        
        if (currentMeltdown) {
          p.x += (Math.random() - 0.5) * 5;
          p.y += (Math.random() - 0.5) * 5;
        }

        // Screen wrap or bounce depending on mode
        if (currentMode === SystemMode.GRAVITY_NULL) {
           if (p.y > canvas.height + 10) {
             p.y = -10;
             p.vy = (Math.random() - 0.5) * 2; // Reset velocity
             p.x = Math.random() * canvas.width;
           } else if (p.y < -10) {
             p.y = canvas.height + 10;
             p.vy = (Math.random() - 0.5) * 2;
             p.x = Math.random() * canvas.width;
           }
           if (p.x < 0) { p.x = canvas.width; }
           if (p.x > canvas.width) { p.x = 0; }
        } else if (currentMode === SystemMode.VORTEX_MGR) {
           const dx = vX - p.x;
           const dy = vY - p.y;
           if (Math.sqrt(dx * dx + dy * dy) < 20) {
              // Reset particles that get sucked in
              p.x = Math.random() > 0.5 ? 0 : canvas.width;
              p.y = Math.random() * canvas.height;
           }
        } else {
          if (p.x < 0) { p.x = canvas.width; }
          if (p.x > canvas.width) { p.x = 0; }
          if (p.y < 0) { p.y = canvas.height; }
          if (p.y > canvas.height) { p.y = 0; }
        }

        ctx.beginPath();
        // bump size during transition
        ctx.arc(p.x, p.y, p.size * (1 + transitionRef.current * 2), 0, Math.PI * 2);
        ctx.fill();

        // Mouse connection
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.globalAlpha = Math.max(0, 1 - dist / maxDistance) * (1 - transitionRef.current);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
            
            // Slight repulsion from mouse in normal modes
            if (!currentMeltdown && currentMode !== SystemMode.VORTEX_MGR && currentMode !== SystemMode.GRAVITY_NULL) {
                p.vx -= (dx / dist) * 0.5;
                p.vy -= (dy / dist) * 0.5;
            }
        }

        // Particle connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p2.x - p.x;
          const dy2 = p2.y - p.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          
          if (dist2 < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            // Flash connecting lines brighter during transition
            if (transitionRef.current > 0) {
              ctx.strokeStyle = '#ffffff';
              ctx.globalAlpha = 0.5 * (1 - dist2 / maxDistance) * transitionRef.current;
              ctx.stroke();
              ctx.strokeStyle = primaryColor;
            } else {
              ctx.globalAlpha = 0.3 * (1 - dist2 / maxDistance);
              ctx.stroke();
            }
            ctx.globalAlpha = 1.0;
          }
        }
      }
      
      // Flash screen color during transition
      if (transitionRef.current > 0) {
         ctx.fillStyle = `rgba(0, 255, 65, ${transitionRef.current * 0.1})`;
         ctx.fillRect(-50, -50, canvas.width + 100, canvas.height + 100);
         
         // Random text glitch
         if (Math.random() > 0.8) {
           ctx.fillStyle = primaryColor;
           ctx.font = '20px monospace';
           ctx.globalAlpha = transitionRef.current;
           ctx.fillText('SYS_OVERRIDE', Math.random() * canvas.width, Math.random() * canvas.height);
           ctx.globalAlpha = 1.0;
         }
      }
      
      ctx.restore();
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [vortexRef]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
    />
  );
}
