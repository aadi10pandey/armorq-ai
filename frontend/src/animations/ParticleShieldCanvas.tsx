import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  pulsePhase: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  speed: number;
}

interface ParticleShieldCanvasProps {
  className?: string;
}

export const ParticleShieldCanvas: React.FC<ParticleShieldCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const shockwavesRef = useRef<Shockwave[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color palette for cryptographic nodes
    const colors = [
      'rgba(0, 240, 255, ',   // Cyber cyan
      'rgba(139, 92, 246, ',  // Cyber purple
      'rgba(16, 185, 129, ',  // Emerald
      'rgba(56, 189, 248, ',  // Sky blue
    ];

    // Responsive particle count
    const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseRadius = Math.random() * 1.8 + 0.8;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: baseRadius,
        baseRadius,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    // Custom window shockwave dispatcher for high-impact actions
    const handleShockwaveEvent = (e: CustomEvent<{ x?: number; y?: number; color?: string; type?: 'verified' | 'danger' | 'default' }>) => {
      const detail = e.detail || {};
      const x = detail.x ?? width / 2;
      const y = detail.y ?? height / 3;
      const color = detail.type === 'danger' ? 'rgba(255, 42, 95,' : detail.type === 'verified' ? 'rgba(16, 185, 129,' : 'rgba(0, 240, 255,';
      shockwavesRef.current.push({
        x,
        y,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.6,
        color,
        alpha: 0.8,
        speed: 6.5,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('sentinel:shockwave' as any, handleShockwaveEvent as any);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update & render shockwaves
      for (let s = shockwavesRef.current.length - 1; s >= 0; s--) {
        const sw = shockwavesRef.current[s];
        sw.radius += sw.speed;
        sw.alpha *= 0.965;

        if (sw.alpha < 0.01 || sw.radius > sw.maxRadius) {
          shockwavesRef.current.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${sw.color} ${sw.alpha})`;
        ctx.lineWidth = Math.max(1, 4 * sw.alpha);
        ctx.shadowColor = `${sw.color} 0.8)`;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();
      }

      // Update & render particles
      const mouse = mouseRef.current;
      const maxDistance = 140;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Pulsing breathing effect
        p.pulsePhase += 0.02;
        p.radius = p.baseRadius + Math.sin(p.pulsePhase) * 0.4;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on edges with soft wrap
        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        else if (p.y > height + 20) p.y = -20;

        // Mouse attraction/repulsion physics
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160 && dist > 5) {
            const force = (160 - dist) / 160;
            p.x += (dx / dist) * force * 0.6;
            p.y += (dy / dist) * force * 0.6;
          }
        }

        // Render particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // Connect nearby particles with subtle cryptographic lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.16;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('sentinel:shockwave' as any, handleShockwaveEvent as any);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.75 }}
    />
  );
};

/**
 * Utility helper to trigger global shockwave animations from anywhere in the application
 */
export const triggerShockwave = (type: 'verified' | 'danger' | 'default' = 'default', x?: number, y?: number) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('sentinel:shockwave', {
      detail: { type, x, y }
    });
    window.dispatchEvent(event);
  }
};
