import { useEffect, useRef, useState } from 'react';
import { SystemMode } from './types';

// Simple 3D projection
type Point3D = { x: number, y: number, z: number };
type Point2D = { x: number, y: number };

function project(p: Point3D, canvasWidth: number, canvasHeight: number, vX: number, vY: number, vZ: number): Point2D | null {
  const fov = 300;
  // Camera is around z=0, looking down +z
  const dz = p.z - vZ;
  if (dz < 1) return null;
  
  const scale = fov / dz;
  const xTemp = (p.x - vX) * scale + canvasWidth / 2;
  const yTemp = (p.y - vY) * scale + canvasHeight / 2;
  return { x: xTemp, y: yTemp };
}

export function RetroGameView({ setMode }: { setMode: (m: SystemMode) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, Space: false };
    const handleDown = (e: KeyboardEvent) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.ArrowLeft = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.ArrowRight = true;
        if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.ArrowUp = true;
        if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.ArrowDown = true;
        if (e.code === 'Space') keys.Space = true;
        if (e.key === 'Escape') setMode(SystemMode.CORE_FLUX);
    };
    const handleUp = (e: KeyboardEvent) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.ArrowLeft = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.ArrowRight = false;
        if (e.code === 'ArrowUp' || e.code === 'KeyW') keys.ArrowUp = false;
        if (e.code === 'ArrowDown' || e.code === 'KeyS') keys.ArrowDown = false;
        if (e.code === 'Space') keys.Space = false;
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);

    let frame = 0;
    
    // Game state
    let cameraZ = 0;
    let shipX = 0;
    let shipY = 0;
    const speed = 15;
    let gameOver = false;
    let shakeIntensity = 0;
    
    let projectiles: {x: number, y: number, z: number, life: number}[] = [];
    let enemyProjectiles: {x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number}[] = [];
    let particles: {x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, type: 'spark' | 'explosion'}[] = [];
    
    type EnemyType = 'pursuer' | 'turret' | 'kamikaze';
    let enemies: {type: EnemyType, x: number, y: number, z: number, size: number, broken: boolean, lastAction: number}[] = [];
    
    type Rock = {x: number, y: number, z: number, size: number, rot: number, vertices: {x: number, y: number, z: number}[]};
    let rocks: Rock[] = [];
    
    type PowerUp = {x: number, y: number, z: number, type: 'rapid' | 'shield' | 'speed', rot: number, size: number, collected: boolean};
    let powerUps: PowerUp[] = [];
    let activePowers = { rapid: 0, shield: 0, speed: 0 };
    
    let lastShootFrame = 0;

    // init rocks
    for(let i=0; i<30; i++) {
        const size = 30 + Math.random() * 50;
        const vertices = [];
        for(let j=0; j<12; j++) {
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const r = size * (0.7 + Math.random() * 0.5);
            vertices.push({
                x: r * Math.sin(theta) * Math.cos(phi),
                y: r * Math.sin(theta) * Math.sin(phi),
                z: r * Math.cos(theta)
            });
        }
        rocks.push({
            x: (Math.random() - 0.5) * 1200, 
            y: 0, 
            z: Math.random() * 10000, 
            size: size,
            rot: Math.random() * Math.PI * 2,
            vertices: vertices
        });
    }

    const hitShip = () => {
        if (activePowers.shield > 0) {
            activePowers.shield = 0;
            shakeIntensity = 20;
            for(let k=0; k<40; k++) {
                particles.push({
                    x: shipX, 
                    y: shipY, 
                    z: cameraZ + 50,
                    vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, vz: (Math.random() - 0.5) * 20,
                    life: 20 + Math.random() * 30, type: 'spark'
                });
            }
            return false;
        }
        gameOver = true;
        shakeIntensity = 40;
        return true;
    };

    const colorGrid = "#00e5ff"; // cyan grid
    const colorShipLine = "#00ffff";
    const colorLaser = "#ff00ff";
    const colorExplosion = "#ff3366";

    // draw ship outline
    const drawShip = (ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) => {
      ctx.strokeStyle = colorShipLine;
      ctx.lineWidth = 2;
      ctx.beginPath();
      // nose
      ctx.moveTo(cx, cy - 20 * scale);
      // right wing
      ctx.lineTo(cx + 30 * scale, cy + 10 * scale);
      // right engines
      ctx.lineTo(cx + 10 * scale, cy + 10 * scale);
      ctx.lineTo(cx + 10 * scale, cy + 20 * scale);
      // left engines
      ctx.lineTo(cx - 10 * scale, cy + 20 * scale);
      ctx.lineTo(cx - 10 * scale, cy + 10 * scale);
      // left wing
      ctx.lineTo(cx - 30 * scale, cy + 10 * scale);
      ctx.closePath();
      ctx.stroke();

      // engine glow
      ctx.fillStyle = "rgba(255, 50, 50, 0.8)";
      ctx.beginPath();
      ctx.arc(cx - 6 * scale, cy + 20 * scale, 3 * scale + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 6 * scale, cy + 20 * scale, 3 * scale + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    let loop = () => {
        frame++;
        if (!gameOver) {
            cameraZ += speed;
        }
        const cw = canvas.width;
        const ch = canvas.height;

        // Decrement active powers
        if (activePowers.rapid > 0) activePowers.rapid--;
        if (activePowers.shield > 0) activePowers.shield--;
        if (activePowers.speed > 0) activePowers.speed--;

        // Player input
        if (!gameOver) {
            const currentSpeed = activePowers.speed > 0 ? 14 : 8;
            if (keys.ArrowLeft) shipX -= currentSpeed;
            if (keys.ArrowRight) shipX += currentSpeed;
            if (keys.ArrowUp) shipY -= currentSpeed;
            if (keys.ArrowDown) shipY += currentSpeed;
            
            const cooldown = activePowers.rapid > 0 ? 4 : 10;
            if (keys.Space && frame - lastShootFrame > cooldown) {
                if (activePowers.rapid > 0) {
                    projectiles.push({x: shipX - 15, y: shipY, z: cameraZ + 50, life: 100});
                    projectiles.push({x: shipX, y: shipY, z: cameraZ + 50, life: 100});
                    projectiles.push({x: shipX + 15, y: shipY, z: cameraZ + 50, life: 100});
                } else {
                    projectiles.push({x: shipX - 10, y: shipY, z: cameraZ + 50, life: 100});
                    projectiles.push({x: shipX + 10, y: shipY, z: cameraZ + 50, life: 100});
                }
                lastShootFrame = frame;
            }

            // restrict ship
            if (shipX < -300) shipX = -300;
            if (shipX > 300) shipX = 300;
            if (shipY < -200) shipY = -200; // Upper limit
            if (shipY > 50) shipY = 50;  // Floor limit
        }

        // Terrain Height Function
        const getTerrainY = (x: number, z: number) => {
            let y = 150; // base ground level
            let absX = Math.abs(x);
            if (absX > 300) {
                // Mountains on the side
                y -= (absX - 300) * 0.8;
                y -= Math.sin(x * 0.005 + z * 0.005) * 150;
                y -= Math.sin(x * 0.01 - z * 0.01) * 80;
            }
            return y;
        };

        // check terrain collision
        if (!gameOver) {
            const shipGroundY = getTerrainY(shipX, cameraZ + 50);
            if (shipY > shipGroundY - 20) { // Ship hit the floor/mountain
                if (hitShip()) {
                    // spawn massive explosion
                    for(let k=0; k<100; k++) {
                        particles.push({
                            x: shipX + (Math.random()-0.5)*50, 
                            y: shipY + (Math.random()-0.5)*50, 
                            z: cameraZ + 50 + (Math.random()-0.5)*50,
                            vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, vz: (Math.random() - 0.5) * 20,
                            life: 30 + Math.random() * 60, type: 'explosion'
                        });
                    }
                } else {
                    shipY = shipGroundY - 40; // bump up
                }
            }
        }

        // update enemy & rock & powerup spawn
        if (!gameOver) {
            if (Math.random() < 0.02) {
                const types: EnemyType[] = ['pursuer', 'turret', 'kamikaze'];
                const etype = types[Math.floor(Math.random() * types.length)];
                enemies.push({type: etype, x: (Math.random() - 0.5) * 600, y: -(Math.random() * 100 + 50), z: cameraZ + 4000, size: etype === 'kamikaze' ? 25 : 40, broken: false, lastAction: frame});
            }
            if (Math.random() < 0.005) {
                const types: ('rapid' | 'shield' | 'speed')[] = ['rapid', 'shield', 'speed'];
                powerUps.push({
                    x: (Math.random() - 0.5) * 400, 
                    y: -(Math.random() * 100 + 40), 
                    z: cameraZ + 4000, 
                    type: types[Math.floor(Math.random() * types.length)],
                    rot: 0,
                    size: 20,
                    collected: false
                });
            }
        }

        // Sky background
        const skyGradient = ctx.createLinearGradient(0, 0, 0, ch/2 + 50);
        skyGradient.addColorStop(0, "#0f051d"); // dark purple
        skyGradient.addColorStop(1, "#3b1342"); // pinkish horizon
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, cw, ch);

        ctx.save();
        if (shakeIntensity > 0.1) {
            const sx = (Math.random() - 0.5) * shakeIntensity;
            const sy = (Math.random() - 0.5) * shakeIntensity;
            ctx.translate(sx, sy);
            shakeIntensity *= 0.9;
        } else {
            shakeIntensity = 0;
        }

        // draw stars
        ctx.fillStyle = "white";
        for(let i=0; i<200; i++) {
           let sx = (i * 137 % cw);
           let sy = (i * 251 % (ch/2 + 50));
           ctx.fillRect(sx, sy, Math.random() * 2, Math.random() * 2);
        }

        // Draw Sun
        ctx.save();
        const sunCy = ch/2 - 20;
        const sunCx = cw/2;
        const sunR = 250;
        const sunGradient = ctx.createLinearGradient(0, sunCy - sunR, 0, sunCy + sunR);
        sunGradient.addColorStop(0, "#ff007f"); // pink top
        sunGradient.addColorStop(1, "#ffcc00"); // yellow bottom
        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(sunCx, sunCy, sunR, 0, Math.PI * 2);
        ctx.fill();

        // Sun stripes
        ctx.globalCompositeOperation = 'destination-out';
        for(let i=0; i<10; i++) {
            const yLine = sunCy + 40 + i * 22;
            const h = 3 + i * 1.5;
            ctx.fillRect(sunCx - sunR, yLine, sunR * 2, h);
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();

        // generate filled grid terrain
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = colorGrid;
        
        ctx.save();
        const gridStep = 200;
        const startZ = cameraZ - (cameraZ % gridStep);
        const endZ = cameraZ + 6000;
        const startX = -3000;
        const endX = 3000;

        for(let z = endZ; z >= startZ + gridStep; z -= gridStep) {
            for(let x = startX; x <= endX - gridStep; x += gridStep) {
                const p1 = project({x: x, y: getTerrainY(x, z), z: z}, cw, ch, 0, -50, cameraZ);
                const p2 = project({x: x + gridStep, y: getTerrainY(x+gridStep, z), z: z}, cw, ch, 0, -50, cameraZ);
                const p3 = project({x: x + gridStep, y: getTerrainY(x+gridStep, z - gridStep), z: z - gridStep}, cw, ch, 0, -50, cameraZ);
                const p4 = project({x: x, y: getTerrainY(x, z - gridStep), z: z - gridStep}, cw, ch, 0, -50, cameraZ);
                
                if (p1 && p2 && p3 && p4) {
                    // color based on distance
                    const distFactor = Math.max(0, 1 - (z - cameraZ) / 6000);
                    ctx.fillStyle = `#050210`; 
                    ctx.strokeStyle = `rgba(0, 229, 255, ${distFactor * 0.8})`;

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.lineTo(p4.x, p4.y);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            }
        }
        ctx.restore();

        // sort drawables back to front
        let drawables: {z: number, draw: () => void}[] = [];

        // powerups
        powerUps = powerUps.filter(p => {
            if (p.collected) return false;
            p.z -= speed * 0.5;
            p.y = getTerrainY(p.x, p.z) - 50;
            p.rot += 0.05;

            if (!gameOver) {
                const dist = Math.sqrt((shipX - p.x)**2 + (shipY - p.y)**2 + ((cameraZ + 50) - p.z)**2);
                if (dist < p.size + 20) {
                    p.collected = true;
                    // Apply powerup (duration = 600 frames = 10s)
                    if (p.type === 'rapid') activePowers.rapid = 600;
                    if (p.type === 'shield') activePowers.shield = 600;
                    if (p.type === 'speed') activePowers.speed = 600;
                    shakeIntensity = 10;
                    for(let k=0; k<20; k++) {
                        particles.push({
                            x: shipX, y: shipY, z: cameraZ + 50,
                            vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, vz: (Math.random() - 0.5) * 10,
                            life: 20 + Math.random() * 20, type: 'spark'
                        });
                    }
                    return false;
                }
            }

            drawables.push({z: p.z, draw: () => {
                const c = project(p, cw, ch, 0, -50, cameraZ);
                const colors = { rapid: '#ffff00', shield: '#00ffff', speed: '#00ff00' };
                if (c) {
                    ctx.save();
                    ctx.translate(c.x, c.y);
                    ctx.rotate(p.rot);
                    ctx.scale(300 / Math.max(1, p.z - cameraZ), 300 / Math.max(1, p.z - cameraZ));
                    
                    ctx.strokeStyle = colors[p.type];
                    ctx.fillStyle = ctx.strokeStyle + '44';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, -p.size);
                    ctx.lineTo(p.size, 0);
                    ctx.lineTo(0, p.size);
                    ctx.lineTo(-p.size, 0);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fill();

                    // Inner shape
                    ctx.beginPath();
                    ctx.moveTo(0, -p.size/2);
                    ctx.lineTo(p.size/2, 0);
                    ctx.lineTo(0, p.size/2);
                    ctx.lineTo(-p.size/2, 0);
                    ctx.closePath();
                    ctx.stroke();

                    ctx.restore();
                }
            }});
            return p.z > cameraZ - 100;
        });

        // rocks
        rocks.forEach(r => {
            if (r.z < cameraZ - 50) r.z += 10000;
            
            // stick to terrain
            r.y = getTerrainY(r.x, r.z) - r.size * 0.5;
            if (!gameOver) r.rot += 0.05;
            
            // collision with ship
            if (!gameOver && r.z > cameraZ && r.z < cameraZ + speed * 2) {
                const dist = Math.sqrt((shipX - r.x)**2 + (shipY - r.y)**2 + ((cameraZ + 50) - r.z)**2);
                if (dist < r.size + 15) {
                    if (hitShip()) {
                        // Game over inside hitShip
                    } else {
                        r.z -= 10000; // break rock
                    }
                }
            }

            drawables.push({z: r.z, draw: () => {
                const projVertices = [];
                for(let v of r.vertices) {
                    const yRot = v.y * Math.cos(r.rot) - v.z * Math.sin(r.rot);
                    const zRot = v.y * Math.sin(r.rot) + v.z * Math.cos(r.rot);
                    const p = project({x: r.x + v.x, y: r.y + yRot, z: r.z + zRot}, cw, ch, 0, -50, cameraZ);
                    if(p) projVertices.push(p);
                }
                
                if (projVertices.length > 2) {
                    const cx = projVertices.reduce((s, p) => s + p.x, 0) / projVertices.length;
                    const cy = projVertices.reduce((s, p) => s + p.y, 0) / projVertices.length;
                    projVertices.sort((a,b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
                    
                    ctx.fillStyle = "#050210";
                    ctx.strokeStyle = "#ff007f"; // neon pink rocks
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(projVertices[0].x, projVertices[0].y);
                    for(let i=1; i<projVertices.length; i++) ctx.lineTo(projVertices[i].x, projVertices[i].y);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            }});
        });

        // update projectils
        projectiles = projectiles.filter(pr => {
            pr.z += 30; // speed
            pr.life--;
            return pr.life > 0;
        });

        // update enemy projectiles
        enemyProjectiles = enemyProjectiles.filter(pr => {
            pr.x += pr.vx;
            pr.y += pr.vy;
            pr.z += pr.vz;
            pr.life--;
            
            if (!gameOver && pr.z > cameraZ && pr.z < cameraZ + 200) {
                const dist = Math.sqrt((shipX - pr.x)**2 + (shipY - pr.y)**2 + ((cameraZ + 50) - pr.z)**2);
                if (dist < 20) {
                    hitShip(); // Hit player with enemy projectile
                    return false;
                }
            }

            return pr.life > 0;
        });

        // update enemies
        enemies = enemies.filter(e => {
            if (e.broken) return false;
            
            if (!gameOver) {
                if (e.type === 'pursuer') {
                    // Pursuit logic
                    const dx = shipX - e.x;
                    const dy = shipY - e.y;
                    const distToShip = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distToShip > 0) {
                        e.x += (dx / distToShip) * 3;
                        e.y += (dy / distToShip) * 3;
                    }
                    
                    // Rudimentary evasion: if a projectile is close, move away
                    let evading = false;
                    for (const pr of projectiles) {
                        if (pr.life > 0 && Math.abs(pr.z - e.z) < 800 && e.z < pr.z) {
                            const pdx = e.x - pr.x;
                            const pdy = e.y - pr.y;
                            const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
                            if (pDist < 150 && pDist > 0) {
                                e.x += (pdx / pDist) * 8;
                                e.y += (pdy / pDist) * 8;
                                evading = true;
                            }
                        }
                    }
                    
                    if (!evading) {
                        e.x += Math.sin(frame * 0.03 + e.z * 0.01) * 4;
                        e.y += Math.cos(frame * 0.04 + e.z * 0.01) * 4;
                    }
                    
                    e.z -= speed * 0.5; // moving towards camera
                } else if (e.type === 'kamikaze') {
                    // Fast, tries to ram the player
                    const dx = shipX - e.x;
                    const dy = shipY - e.y;
                    const dz = (cameraZ + 50) - e.z;
                    const distToShip = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    
                    if (distToShip > 0) {
                        e.x += (dx / distToShip) * 12;
                        e.y += (dy / distToShip) * 12;
                        e.z += (dz / distToShip) * 12;
                    } else {
                        e.z -= speed * 1.5;
                    }
                } else if (e.type === 'turret') {
                    // Slowly floats, shoots projectiles
                    e.x += Math.sin(frame * 0.02 + e.z) * 2;
                    e.z -= speed * 0.2; 
                    
                    if (frame - e.lastAction > 60 && e.z > cameraZ + 500 && e.z < cameraZ + 3000) {
                        // Shoot at player
                        const dx = shipX - e.x;
                        const dy = shipY - e.y;
                        const dz = (cameraZ + 50) - e.z;
                        const distToShip = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        if (distToShip > 0) {
                            enemyProjectiles.push({
                                x: e.x, y: e.y, z: e.z,
                                vx: (dx / distToShip) * 15,
                                vy: (dy / distToShip) * 15,
                                vz: (dz / distToShip) * 15,
                                life: 200
                            });
                        }
                        e.lastAction = frame;
                    }
                }
            }
            
            // collision with ship
            if (!gameOver && e.z > cameraZ && e.z < cameraZ + speed * 2) {
                const dist = Math.sqrt((shipX - e.x)**2 + (shipY - e.y)**2 + ((cameraZ + 50) - e.z)**2);
                if (dist < e.size + 15) {
                    if (hitShip()) {
                        // handled inside
                    } else {
                        e.broken = true;
                    }
                }
            }
            
            return e.z > cameraZ - 100;
        });

        // check collisions
        projectiles.forEach(pr => {
            if (pr.life <= 0) return;
            enemies.forEach(e => {
                if (!e.broken) {
                    const dist = Math.sqrt((pr.x - e.x)**2 + (pr.y - e.y)**2 + (pr.z - e.z)**2);
                    if (dist < e.size + 10) {
                        e.broken = true;
                        pr.life = 0; // destroy bullet
                        shakeIntensity = Math.max(shakeIntensity, 8); // Medium shake on enemy kill
                        // spawn explosion
                        for(let k=0; k<40; k++) {
                            particles.push({
                                x: e.x + (Math.random()-0.5)*e.size, 
                                y: e.y + (Math.random()-0.5)*e.size, 
                                z: e.z + (Math.random()-0.5)*e.size,
                                vx: (Math.random() - 0.5) * 15,
                                vy: (Math.random() - 0.5) * 15,
                                vz: (Math.random() - 0.5) * 15,
                                life: 20 + Math.random() * 40,
                                type: 'explosion'
                            });
                        }
                    }
                }
            });

            rocks.forEach(r => {
                const dist = Math.sqrt((pr.x - r.x)**2 + (pr.y - r.y)**2 + (pr.z - r.z)**2);
                if (dist < r.size + 10) {
                    pr.life = 0; // Destroy projectile hitting rock
                    shakeIntensity = Math.max(shakeIntensity, 4); // Small shake on impact
                    for(let k=0; k<10; k++) {
                        particles.push({
                            x: pr.x, y: pr.y, z: pr.z,
                            vx: (Math.random() - 0.5) * 8,
                            vy: (Math.random() - 0.5) * 8,
                            vz: (Math.random() - 0.5) * 8,
                            life: 10 + Math.random() * 15,
                            type: 'spark'
                        });
                    }
                }
            });
        });

        // projectiles
        projectiles.forEach(pr => {
            drawables.push({z: pr.z, draw: () => {
                const s1 = project({x: pr.x, y: pr.y, z: pr.z}, cw, ch, 0, -50, cameraZ);
                const s2 = project({x: pr.x, y: pr.y, z: pr.z-100}, cw, ch, 0, -50, cameraZ);
                if (s1 && s2) {
                    ctx.strokeStyle = colorLaser;
                    ctx.lineWidth = 3;
                    ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.stroke();
                }
            }});
        });

        // enemies
        enemies.forEach(e => {
            drawables.push({z: e.z, draw: () => {
                const center = project({x: e.x, y: e.y, z: e.z}, cw, ch, 0, -50, cameraZ);
                if (center) {
                    if (e.type === 'kamikaze') {
                        ctx.strokeStyle = "#ffaa00";
                        ctx.fillStyle = "rgba(255, 100, 0, 0.5)";
                    } else if (e.type === 'turret') {
                        ctx.strokeStyle = "#ff00ff";
                        ctx.fillStyle = "rgba(255, 0, 255, 0.3)";
                    } else {
                        ctx.strokeStyle = "#ff3333";
                        ctx.fillStyle = "rgba(255, 50, 50, 0.2)";
                    }

                    const scale = 300 / Math.max(1, e.z - cameraZ);
                    const size2d = e.size * scale;
                    
                    ctx.lineWidth = 2 * scale;
                    
                    if (e.type === 'kamikaze') {
                        ctx.beginPath();
                        ctx.moveTo(center.x, center.y - size2d);
                        ctx.lineTo(center.x + size2d, center.y + size2d);
                        ctx.lineTo(center.x - size2d, center.y + size2d);
                        ctx.closePath();
                        ctx.stroke();
                        ctx.fill();
                    } else if (e.type === 'turret') {
                        ctx.beginPath();
                        ctx.rect(center.x - size2d, center.y - size2d, size2d * 2, size2d * 2);
                        ctx.stroke();
                        ctx.fill();
                        
                        // draw cannon facing player
                        const dx = shipX - e.x;
                        const dy = shipY - e.y;
                        const distToShip = Math.sqrt(dx * dx + dy * dy);
                        ctx.beginPath();
                        ctx.moveTo(center.x, center.y);
                        if (distToShip > 0) {
                           ctx.lineTo(center.x + (dx/distToShip) * size2d * 1.5, center.y + (dy/distToShip) * size2d * 1.5);
                        }
                        ctx.stroke();
                    } else {
                        ctx.beginPath();
                        if(size2d > 0) {
                            ctx.arc(center.x, center.y, size2d, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.stroke();
                            // cube inside
                            ctx.strokeRect(center.x - size2d*0.7, center.y - size2d*0.7, size2d*1.4, size2d*1.4);
                        }
                    }
                }
            }});
        });

        // enemy projectiles
        enemyProjectiles.forEach(pr => {
            drawables.push({z: pr.z, draw: () => {
                const s1 = project({x: pr.x, y: pr.y, z: pr.z}, cw, ch, 0, -50, cameraZ);
                const s2 = project({x: pr.x - pr.vx*5, y: pr.y - pr.vy*5, z: pr.z - pr.vz*5}, cw, ch, 0, -50, cameraZ);
                if (s1 && s2) {
                    ctx.strokeStyle = "#ff0000";
                    ctx.lineWidth = 4 * (300 / Math.max(1, pr.z - cameraZ));
                    ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.stroke();
                }
            }});
        });

        // particles
        particles = particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.z += p.vz;
            p.life--;
            return p.life > 0;
        });

        particles.forEach(p => {
            drawables.push({z: p.z, draw: () => {
                const scr = project({x: p.x, y: p.y, z: p.z}, cw, ch, 0, -50, cameraZ);
                const scrOld = project({x: p.x - p.vx*2, y: p.y - p.vy*2, z: p.z - p.vz*2}, cw, ch, 0, -50, cameraZ);
                
                if (scr && scrOld) {
                    const scaleFactor = (300 / (Math.max(1, p.z - cameraZ)));
                    ctx.beginPath();
                    ctx.moveTo(scrOld.x, scrOld.y);
                    ctx.lineTo(scr.x, scr.y);
                    
                    if (p.type === 'explosion') {
                        ctx.strokeStyle = `rgba(255, ${Math.floor(Math.random()*150 + 50)}, 0, ${Math.min(1, p.life/30)})`;
                        ctx.lineWidth = Math.max(1, 3 * scaleFactor);
                    } else {
                        ctx.strokeStyle = `rgba(0, 255, 255, ${Math.min(1, p.life/15)})`;
                        ctx.lineWidth = Math.max(1, 2 * scaleFactor);
                    }
                    ctx.stroke();
                }
            }});
        });

        drawables.sort((a,b) => b.z - a.z);
        drawables.forEach(d => d.draw());

        // draw ship (always on top)
        if (!gameOver) {
            const shipCy = ch/2 + shipY + 50;
            const shipCx = cw/2 + shipX;
            drawShip(ctx, shipCx, shipCy, 1.5);

            if (activePowers.shield > 0) {
                ctx.beginPath();
                ctx.arc(shipCx, shipCy, 50, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 255, 255, ${0.1 + Math.sin(frame * 0.1) * 0.05})`;
                ctx.fill();
                ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + Math.sin(frame * 0.1) * 0.2})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        ctx.restore(); // Restore after shaking everything

        // draw score / UI
        ctx.fillStyle = colorShipLine;
        ctx.font = "20px monospace";
        ctx.fillText(`PRESS ESC TO EXIT`, 20, 40);
        ctx.fillText(`USE ARROWS/WASD & SPACEBAR`, 20, 70);

        // Draw active powerups
        let powerY = 110;
        ctx.font = "16px monospace";
        if (activePowers.rapid > 0) {
            ctx.fillStyle = "#ffff00";
            ctx.fillText(`RAPID FIRE: ${Math.ceil(activePowers.rapid / 60)}s`, 20, powerY);
            powerY += 25;
        }
        if (activePowers.shield > 0) {
            ctx.fillStyle = "#00ffff";
            ctx.fillText(`SHIELD: ${Math.ceil(activePowers.shield / 60)}s`, 20, powerY);
            powerY += 25;
        }
        if (activePowers.speed > 0) {
            ctx.fillStyle = "#00ff00";
            ctx.fillText(`SPEED BOOST: ${Math.ceil(activePowers.speed / 60)}s`, 20, powerY);
            powerY += 25;
        }

        if (gameOver) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, cw, ch);
            ctx.fillStyle = "#ff0000";
            ctx.font = "bold 60px monospace";
            ctx.textAlign = "center";
            ctx.fillText("CRITICAL FAILURE", cw/2, ch/2);
            ctx.font = "20px monospace";
            ctx.fillText("PRESS ESC TO REBOOT_SYSTEM", cw/2, ch/2 + 50);
            ctx.textAlign = "left";
        }

        animationId = requestAnimationFrame(loop);
    };

    let animationId = requestAnimationFrame(loop);
    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resize);
        window.removeEventListener('keydown', handleDown);
        window.removeEventListener('keyup', handleUp);
    }
  }, [setMode]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
