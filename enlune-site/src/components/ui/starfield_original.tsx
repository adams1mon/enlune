"use client";

import { useEffect, useRef } from "react";

type DensityZone = {
  x: number;
  y: number;
  radius: number;
  weight: number;
};

type StarfieldProps = {
  background?: string;
  baseSpawnRate?: number;
  className?: string;
  densityZones?: readonly DensityZone[];
  warpOnScroll?: boolean;
  warpStrength?: number;
};

type Star = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  maxOpacity: number;
  glow: number;
  life: number;
  age: number;
  driftX: number;
  driftY: number;
  twinkleOffset: number;
};

const DEFAULT_DENSITY_ZONES: readonly DensityZone[] = [
  { x: 0.18, y: 0.22, radius: 0.18, weight: 1.7 },
  { x: 0.72, y: 0.3, radius: 0.16, weight: 1.45 },
  { x: 0.26, y: 0.78, radius: 0.2, weight: 1.85 },
  { x: 0.82, y: 0.62, radius: 0.15, weight: 1.35 },
];

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickSpawnPoint(
  width: number,
  height: number,
  densityZones: readonly DensityZone[],
) {
  let x = Math.random();
  let y = Math.random();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidateX = Math.random();
    const candidateY = Math.random();
    let probability = 0.08;

    for (const zone of densityZones) {
      const dx = candidateX - zone.x;
      const dy = candidateY - zone.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= zone.radius) {
        const closeness = 1 - distance / zone.radius;
        probability += closeness * zone.weight * 0.34;
      }
    }

    if (Math.random() < Math.min(probability, 0.98)) {
      x = candidateX;
      y = candidateY;
      break;
    }
  }

  return {
    x: x * width,
    y: y * height,
  };
}

function createStar(
  width: number,
  height: number,
  densityZones: readonly DensityZone[],
): Star {
  const point = pickSpawnPoint(width, height, densityZones);

  return {
    x: point.x,
    y: point.y,
    radius: randomBetween(0.7, 1.9),
    opacity: 0,
    maxOpacity: randomBetween(0.35, 0.95),
    glow: randomBetween(6, 18),
    life: randomBetween(1.4, 3.8),
    age: 0,
    driftX: randomBetween(-1.6, 1.6),
    driftY: randomBetween(-1.2, 1.2),
    twinkleOffset: Math.random() * Math.PI * 2,
  };
}

export function Starfield({
  background = "#6a63a6",
  baseSpawnRate = 22,
  className,
  densityZones = DEFAULT_DENSITY_ZONES,
  warpOnScroll = false,
  warpStrength = 0.14,
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const warpVelocityRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let disposed = false;
    let lastTime = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();

    function resizeCanvas() {
      const bounds = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(bounds.width * dpr);
      canvas.height = Math.round(bounds.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawStar(star: Star, timeSeconds: number, warpVelocity: number) {
      const twinkle = 0.85 + 0.25 * Math.sin(timeSeconds * 5.5 + star.twinkleOffset);
      const alpha = Math.max(0, Math.min(1, star.opacity * twinkle));
      const warpLength = Math.min(
        Math.abs(warpVelocity) * warpStrength * 46,
        100,
      );
      const warpDirection = warpVelocity >= 0 ? -1 : 1;

      context.save();
      context.globalAlpha = alpha;
      context.shadowBlur = star.glow;
      context.shadowColor = "rgba(255,255,255,0.95)";
      context.fillStyle = "rgba(255,255,255,0.98)";

      if (warpOnScroll && warpLength > 1.5) {
        context.strokeStyle = "rgba(255,255,255,0.9)";
        context.lineWidth = Math.max(star.radius * 0.95, 0.8);
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(star.x, star.y);
        context.lineTo(star.x, star.y + warpDirection * warpLength);
        context.stroke();
      }

      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    function updateWarpVelocity() {
      if (!warpOnScroll) {
        warpVelocityRef.current = 0;
        return;
      }

      const now = performance.now();
      const scrollDelta = window.scrollY - lastScrollY;
      const timeDelta = Math.max(now - lastScrollTime, 8);
      const instantaneousVelocity = scrollDelta / timeDelta;

      warpVelocityRef.current =
        warpVelocityRef.current * 0.72 + instantaneousVelocity * 0.28;

      lastScrollY = window.scrollY;
      lastScrollTime = now;
    }

    function tick(timestamp: number) {
      if (disposed) {
        return;
      }

      if (!lastTime) {
        lastTime = timestamp;
      }

      const deltaSeconds = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;
      updateWarpVelocity();

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const stars = starsRef.current;
      const warpVelocity = warpVelocityRef.current;

      context.clearRect(0, 0, width, height);
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      const spawnBudget = baseSpawnRate * deltaSeconds;
      const wholeSpawns = Math.floor(spawnBudget);
      const fractionalSpawn = spawnBudget - wholeSpawns;

      for (let index = 0; index < wholeSpawns; index += 1) {
        stars.push(createStar(width, height, densityZones));
      }

      if (Math.random() < fractionalSpawn) {
        stars.push(createStar(width, height, densityZones));
      }

      const timeSeconds = timestamp / 1000;

      for (let index = stars.length - 1; index >= 0; index -= 1) {
        const star = stars[index];

        star.age += deltaSeconds;

        const progress = star.age / star.life;
        const fadeIn = Math.min(progress / 0.22, 1);
        const fadeOut = progress > 0.55 ? 1 - (progress - 0.55) / 0.45 : 1;

        star.opacity = star.maxOpacity * Math.max(0, Math.min(fadeIn, fadeOut));
        star.x += star.driftX * deltaSeconds;
        star.y += star.driftY * deltaSeconds;

        if (progress >= 1) {
          stars.splice(index, 1);
          continue;
        }

        drawStar(star, timeSeconds, warpVelocity);
      }

      warpVelocityRef.current *= 0.9;

      animationFrameRef.current = window.requestAnimationFrame(tick);
    }

    resizeCanvas();
    animationFrameRef.current = window.requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    resizeObserver.observe(canvas);

    return () => {
      disposed = true;
      resizeObserver.disconnect();

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [background, baseSpawnRate, densityZones, warpOnScroll, warpStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}

export type { DensityZone, StarfieldProps };
