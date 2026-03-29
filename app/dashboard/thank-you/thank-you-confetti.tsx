"use client";

import { useEffect, useState } from "react";

type ConfettiParticle = {
  particleKey: number;
  leftPercent: number;
  durationSeconds: number;
  delaySeconds: number;
  driftPixels: number;
  rotationDegrees: number;
  widthPixels: number;
  heightPixels: number;
  borderRadius: string;
  color: string;
};

const CONFETTI_COLORS = [
  "#818cf8",
  "#38bdf8",
  "#fbbf24",
  "#a78bfa",
  "#f472b6",
  "#34d399",
  "#fb923c",
  "#e2e8f0",
];

const PARTICLE_COUNT = 96;

export function ThankYouConfetti() {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const nextParticles: ConfettiParticle[] = [];
    for (let particleIndex = 0; particleIndex < PARTICLE_COUNT; particleIndex++) {
      const baseSize = 5 + Math.random() * 7;
      const isStrip = Math.random() > 0.55;
      const widthPixels = isStrip ? baseSize * (0.35 + Math.random() * 0.35) : baseSize;
      const heightPixels = isStrip ? baseSize * (1.8 + Math.random() * 1.2) : baseSize;
      const borderRadius = isStrip ? "2px" : "9999px";
      nextParticles.push({
        particleKey: particleIndex,
        leftPercent: 4 + Math.random() * 92,
        durationSeconds: 2.35 + Math.random() * 1.75,
        delaySeconds: Math.random() * 2.25,
        driftPixels: (Math.random() - 0.5) * 140,
        rotationDegrees: Math.random() * 540 - 270,
        widthPixels,
        heightPixels,
        borderRadius,
        color:
          CONFETTI_COLORS[particleIndex % CONFETTI_COLORS.length] ?? "#e2e8f0",
      });
    }
    setParticles(nextParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
      aria-hidden
    >
      {particles.map((particle) => (
        <span
          key={particle.particleKey}
          className="absolute will-change-transform"
          style={{
            left: `${particle.leftPercent}%`,
            top: "-6%",
            width: particle.widthPixels,
            height: particle.heightPixels,
            borderRadius: particle.borderRadius,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${Math.min(10, particle.widthPixels + 2)}px color-mix(in oklch, ${particle.color} 55%, transparent)`,
            opacity: 0,
            ["--thank-you-drift" as string]: `${particle.driftPixels}px`,
            ["--thank-you-rot" as string]: `${particle.rotationDegrees}deg`,
            animation: `thank-you-confetti-fall ${particle.durationSeconds}s cubic-bezier(0.22, 0.61, 0.36, 1) ${particle.delaySeconds}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
