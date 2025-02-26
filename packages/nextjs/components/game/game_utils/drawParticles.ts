import { MutableRefObject } from "react";

export interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
}

export function drawParticles(ctx: CanvasRenderingContext2D | null, particlesRef: MutableRefObject<Particle[]>) {
  const particles = particlesRef.current;
  if (!ctx) return;
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    if (particle.life > 0) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 215, 0, ${particle.life / 50})`;
      ctx.fill();
      ctx.closePath();
      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.life -= 1;
    } else {
      particles.splice(i, 1);
      i--;
    }
  }
}
