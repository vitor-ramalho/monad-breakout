import { Particle } from "./drawParticles";

export function createParticles(x: number, y: number, particlesRef: React.MutableRefObject<Particle[]>) {
  const particles: Particle[] = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      x,
      y,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      life: 50,
    });
  }
  particlesRef.current.push(...particles);
}
