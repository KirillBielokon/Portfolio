import React, { useEffect, useRef } from "react";

const WIDTH = 600;
const HEIGHT = 480;
const COUNT = 960;
const LIME = [214, 255, 98];
const LILAC = [194, 172, 247];

function roundedRect(ctx, x, y, width, height, radius = 8) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function signatureMask(ctx) {
  // The same cut of the K appears in each composition, rather than an unrelated
  // collection of particles. Its broad strokes remain legible on a small phone.
  ctx.beginPath();
  ctx.moveTo(147, 62);
  ctx.lineTo(228, 62);
  ctx.lineTo(228, 213);
  ctx.lineTo(371, 62);
  ctx.lineTo(470, 62);
  ctx.lineTo(302, 236);
  ctx.lineTo(478, 418);
  ctx.lineTo(372, 418);
  ctx.lineTo(228, 268);
  ctx.lineTo(228, 418);
  ctx.lineTo(147, 418);
  ctx.closePath();
  ctx.fill();
}

function webMask(ctx) {
  ctx.lineWidth = 5;
  roundedRect(ctx, 66, 86, 468, 316, 13);
  ctx.stroke();
  ctx.fillRect(68, 128, 464, 5);
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(87 + i * 16, 109, 3.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillRect(383, 106, 115, 5);
  // A deliberately designed page: wordmark, two-line headline, CTA, artwork.
  ctx.fillRect(96, 160, 54, 6);
  ctx.fillRect(96, 191, 175, 16);
  ctx.fillRect(96, 217, 142, 16);
  ctx.fillRect(96, 254, 158, 5);
  ctx.fillRect(96, 266, 128, 5);
  roundedRect(ctx, 96, 294, 86, 29, 3);
  ctx.stroke();
  ctx.fillRect(112, 306, 44, 5);
  roundedRect(ctx, 316, 160, 187, 173, 4);
  ctx.stroke();
  ctx.save();
  ctx.translate(342, 174);
  ctx.scale(0.36, 0.4);
  ctx.translate(-140, -50);
  signatureMask(ctx);
  ctx.restore();
  ctx.fillRect(96, 361, 407, 3);
  ctx.fillRect(96, 379, 76, 4);
  ctx.fillRect(336, 379, 39, 4);
  ctx.fillRect(393, 379, 39, 4);
  ctx.fillRect(450, 379, 53, 4);
}

function socialCard(ctx, centerX, centerY, angle, design) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  ctx.lineWidth = 4.2;
  roundedRect(ctx, -74, -127, 148, 254, 5);
  ctx.stroke();
  ctx.fillRect(-55, -106, 29, 4);
  ctx.fillRect(-55, -89, 105, 2.5);
  if (design === 0) {
    ctx.fillRect(-54, -67, 95, 12);
    ctx.fillRect(-54, -47, 74, 12);
    ctx.beginPath();
    ctx.arc(0, 21, 42, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.save();
    ctx.translate(-23, -6);
    ctx.scale(0.14, 0.15);
    ctx.translate(-147, -62);
    signatureMask(ctx);
    ctx.restore();
  } else if (design === 1) {
    ctx.save();
    ctx.translate(-30, -66);
    ctx.scale(0.2, 0.24);
    ctx.translate(-147, -62);
    signatureMask(ctx);
    ctx.restore();
    ctx.fillRect(-51, 39, 104, 11);
    ctx.fillRect(-51, 58, 79, 11);
  } else {
    ctx.fillRect(-54, -67, 100, 12);
    ctx.fillRect(-54, -47, 81, 12);
    ctx.save();
    ctx.translate(0, 26);
    ctx.rotate(-0.35);
    ctx.fillRect(-35, -34, 18, 75);
    ctx.fillRect(17, -34, 18, 75);
    ctx.restore();
  }
  ctx.fillRect(-55, 94, 69, 4);
  ctx.fillRect(-55, 106, 101, 2.5);
  ctx.restore();
}

function socialMask(ctx) {
  socialCard(ctx, 130, 257, -0.105, 0);
  socialCard(ctx, 300, 232, 0, 1);
  socialCard(ctx, 470, 257, 0.105, 2);
}

function morton(x, y) {
  let result = 0;
  for (let bit = 0; bit < 10; bit += 1) {
    result |= ((x >> bit) & 1) << (bit * 2);
    result |= ((y >> bit) & 1) << (bit * 2 + 1);
  }
  return result;
}

function makeTargets(draw) {
  const mask = document.createElement("canvas");
  mask.width = WIDTH;
  mask.height = HEIGHT;
  const ctx = mask.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  draw(ctx);
  const pixels = ctx.getImageData(0, 0, WIDTH, HEIGHT).data;
  let points = [];
  // Thin browser frames need a finer grid than the solid monogram. Sampling is
  // deterministic, and spatial ordering keeps the morph looking constructed.
  for (let gap = 4; gap >= 2.5; gap -= 0.5) {
    points = [];
    for (let y = 3; y < HEIGHT - 3; y += gap) {
      for (let x = 3; x < WIDTH - 3; x += gap) {
        if (pixels[(Math.round(y) * WIDTH + Math.round(x)) * 4 + 3] > 150) {
          points.push({ x, y, order: morton(Math.round(x), Math.round(y)) });
        }
      }
    }
    if (points.length >= COUNT) break;
  }
  points.sort((a, b) => a.order - b.order);
  return Array.from({ length: COUNT }, (_, i) => {
    const p =
      points[
        Math.min(points.length - 1, Math.floor((i / COUNT) * points.length))
      ];
    return p ? { x: p.x, y: p.y } : { x: WIDTH / 2, y: HEIGHT / 2 };
  });
}

/** A live illustration of one identity becoming a website and a social system. */
export default function Playground({ mode = "signature", paused = false }) {
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);
  const initialRef = useRef({ mode, paused });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const shapes = {
      signature: makeTargets(signatureMask),
      web: makeTargets(webMask),
      social: makeTargets(socialMask),
    };
    if (!shapes.signature.length) return undefined;

    let currentMode =
      initialRef.current.mode in shapes ? initialRef.current.mode : "signature";
    let targets = shapes[currentMode];
    let isPaused = initialRef.current.paused;
    let reduced = media.matches;
    let inView = true;
    let destroyed = false;
    let raf = 0;
    let previousTime = 0;
    let width = 0;
    let height = 0;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let dpr = 1;
    const pointer = { x: -1000, y: -1000, active: false };
    const color = [...(currentMode === "social" ? LILAC : LIME)];
    let targetColor = currentMode === "social" ? LILAC : LIME;
    const particles = targets.map((p, i) => ({
      x: p.x,
      y: p.y,
      vx: 0,
      vy: 0,
      size: 2.9 + ((i * 17) % 7) * 0.18,
      phase: ((i * 37) % 100) / 16,
    }));

    const canAnimate = () =>
      !isPaused && !reduced && inView && !document.hidden && !destroyed;

    function paint(time = 0, simulate = false) {
      if (!width || !height || destroyed) return;
      const dt =
        simulate && previousTime
          ? Math.min((time - previousTime) / 16.667, 2)
          : 1;
      previousTime = time;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(
        dpr * scale,
        0,
        0,
        dpr * scale,
        dpr * offsetX,
        dpr * offsetY,
      );
      if (simulate) {
        for (let c = 0; c < 3; c += 1)
          color[c] += (targetColor[c] - color[c]) * Math.min(0.1 * dt, 1);
      }
      const rgb = color.map(Math.round).join(",");
      const seconds = time / 1000;

      // Quiet corner registration, rather than a decorative dashboard.
      ctx.strokeStyle = "rgba(243,241,233,.13)";
      ctx.lineWidth = 0.75;
      [
        [27, 29, 1, 1],
        [573, 29, -1, 1],
        [27, 451, 1, -1],
        [573, 451, -1, -1],
      ].forEach(([x, y, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(x, y + dy * 13);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dx * 13, y);
        ctx.stroke();
      });

      if (simulate) {
        particles.forEach((p, i) => {
          const target = targets[i];
          const ambientX = Math.sin(seconds * 0.7 + target.y * 0.012) * 1.6;
          const ambientY = Math.sin(seconds * 0.65 + target.x * 0.012) * 1.6;
          p.vx += (target.x + ambientX - p.x) * 0.062 * dt;
          p.vy += (target.y + ambientY - p.y) * 0.062 * dt;
          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const distance = Math.hypot(dx, dy);
            if (distance < 90 && distance > 0.1) {
              const force = (1 - distance / 90) ** 2 * 4.8 * dt;
              p.vx += (dx / distance) * force;
              p.vy += (dy / distance) * force;
            }
          }
          p.vx *= 0.8 ** dt;
          p.vy *= 0.8 ** dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        });
      }

      // One low-contrast offset gives the cells a physical cut-paper edge.
      ctx.fillStyle = `rgba(${rgb},.1)`;
      particles.forEach((p) => ctx.fillRect(p.x + 3, p.y + 4, p.size, p.size));
      ctx.fillStyle = `rgb(${rgb})`;
      particles.forEach((p, i) => {
        if (i % 19 !== 0) ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.fillStyle = "rgba(243,241,233,.88)";
      particles.forEach((p, i) => {
        if (i % 19 === 0) ctx.fillRect(p.x, p.y, p.size, p.size);
      });
    }

    function snap() {
      particles.forEach((p, i) => {
        p.x = targets[i].x;
        p.y = targets[i].y;
        p.vx = 0;
        p.vy = 0;
      });
      color.splice(0, 3, ...targetColor);
      paint(0, false);
    }

    function tick(time) {
      raf = 0;
      if (!canAnimate()) return;
      paint(time, true);
      raf = requestAnimationFrame(tick);
    }

    function synchronize() {
      cancelAnimationFrame(raf);
      raf = 0;
      previousTime = 0;
      if (canAnimate()) raf = requestAnimationFrame(tick);
      else if (isPaused || reduced) snap();
    }

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (!width || !height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      scale = Math.min(width / WIDTH, height / HEIGHT);
      offsetX = (width - WIDTH * scale) / 2;
      offsetY = (height - HEIGHT * scale) / 2;
      paint(performance.now(), false);
    }

    function point(event) {
      if (isPaused || reduced) return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - bounds.left - offsetX) / scale;
      pointer.y = (event.clientY - bounds.top - offsetY) / scale;
      pointer.active = true;
    }
    const leave = () => {
      pointer.active = false;
    };
    const release = (event) => {
      if (event.pointerType !== "mouse") leave();
    };
    const visibility = () => synchronize();
    const preference = (event) => {
      reduced = event.matches;
      pointer.active = false;
      synchronize();
    };
    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        synchronize();
      },
      { threshold: 0.01 },
    );
    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    canvas.addEventListener("pointermove", point, { passive: true });
    canvas.addEventListener("pointerdown", point, { passive: true });
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", leave);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", preference);

    controlsRef.current = {
      setMode(next) {
        currentMode = next in shapes ? next : "signature";
        targets = shapes[currentMode];
        targetColor = currentMode === "social" ? LILAC : LIME;
        if (isPaused || reduced) snap();
        else synchronize();
      },
      setPaused(next) {
        isPaused = next;
        pointer.active = false;
        synchronize();
      },
    };
    resize();
    synchronize();

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", point);
      canvas.removeEventListener("pointerdown", point);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointerup", release);
      canvas.removeEventListener("pointercancel", leave);
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", preference);
      controlsRef.current = null;
    };
  }, []);

  useEffect(() => {
    controlsRef.current?.setMode(mode);
  }, [mode]);
  useEffect(() => {
    controlsRef.current?.setPaused(paused);
  }, [paused]);

  return (
    <canvas
      ref={canvasRef}
      className="playground-canvas"
      aria-hidden="true"
      data-mode={mode}
      data-paused={paused}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        touchAction: "pan-y",
      }}
    />
  );
}
