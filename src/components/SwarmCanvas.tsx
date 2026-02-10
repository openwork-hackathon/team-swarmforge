"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  tier: number; // 0-4 determines color
  pulse: number;
  pulseSpeed: number;
}

const TIER_COLORS = [
  [255, 215, 0],    // Tier 0: Gold (GENESIS)
  [30, 64, 175],    // Tier 1: Sapphire
  [124, 58, 237],   // Tier 2: Purple
  [5, 150, 105],    // Tier 3: Emerald
  [148, 163, 184],  // Tier 4: Silver
];

export default function SwarmCanvas({ particleCount = 120, active = false }: { particleCount?: number; active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const tier = i === 0 ? 0 : i < 6 ? 1 : i < 30 ? 2 : i < 70 ? 3 : 4;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * (active ? 1.5 : 0.4),
        vy: (Math.random() - 0.5) * (active ? 1.5 : 0.4),
        radius: tier === 0 ? 4 : tier === 1 ? 3 : tier === 2 ? 2.5 : 2,
        tier,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }
    particlesRef.current = particles;
  }, [particleCount, active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particlesRef.current.length === 0) initParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    const connectionDist = 150;

    const animate = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Mouse attraction for tier 0 (GENESIS)
        if (p.tier === 0) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300 && dist > 0) {
            p.vx += (dx / dist) * 0.02;
            p.vy += (dy / dist) * 0.02;
          }
        }

        // Speed limit
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSpeed = active ? 2 : 0.8;
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.15;
            const color = a.tier < b.tier ? TIER_COLORS[a.tier] : TIER_COLORS[b.tier];
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
            ctx.lineWidth = a.tier === 0 || b.tier === 0 ? 1.5 : 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        const color = TIER_COLORS[p.tier];
        const pulseAlpha = 0.6 + Math.sin(p.pulse) * 0.4;

        // Outer glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        gradient.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${pulseAlpha * 0.3})`);
        gradient.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${pulseAlpha})`;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [initParticles, active]);

  return <canvas ref={canvasRef} className="swarm-canvas" />;
}
