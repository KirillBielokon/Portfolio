import { useEffect, useRef } from "react";

/**
 * Drive a scroll scene without measuring layout in the scroll handler.
 * `range` is pure geometry: (absoluteTop, height, viewportHeight) => [start, end].
 * `onProgress` should update compositor properties or CSS variables only.
 */
export default function useScrollScene(
  ref,
  { disabled = false, range, onProgress } = {},
) {
  const optionsRef = useRef({ range, onProgress });
  optionsRef.current = { range, onProgress };

  useEffect(() => {
    const element = ref.current;
    if (disabled || !element) return undefined;

    let active = true;
    let scrollFrame = 0;
    let measureFrame = 0;
    let top = 0;
    let height = 0;
    let viewportHeight = 0;
    let previousProgress;

    function updateProgress() {
      if (!active) return;

      const current = optionsRef.current;
      const bounds = current.range
        ? current.range(top, height, viewportHeight)
        : [top - viewportHeight, top + height];
      const start = Number(bounds?.[0]);
      const end = Number(bounds?.[1]);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return;

      // scrollY is the only live position read in this path. All element and
      // viewport dimensions were cached during measurement.
      const position = window.scrollY;
      const progress =
        end === start
          ? position >= end
            ? 1
            : 0
          : Math.max(0, Math.min(1, (position - start) / (end - start)));

      if (progress === previousProgress) return;
      previousProgress = progress;
      current.onProgress?.(progress);
    }

    function measure() {
      measureFrame = 0;
      if (!active) return;
      const bounds = element.getBoundingClientRect();
      top = bounds.top + window.scrollY;
      height = element.offsetHeight;
      viewportHeight = window.innerHeight;
      updateProgress();
    }

    function scheduleProgress() {
      if (!active || scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        updateProgress();
      });
    }

    function scheduleMeasure() {
      if (!active || measureFrame) return;
      measureFrame = requestAnimationFrame(measure);
    }

    // Install observers after the initial measurement so the scene always
    // receives its initial progress, even when the restored scroll position
    // is in the middle of the document.
    measure();
    window.addEventListener("scroll", scheduleProgress, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(scheduleMeasure)
        : null;
    observer?.observe(element);
    // Preceding sections can change height at a responsive breakpoint.
    // Re-cache positions after that layout change, not during scrolling.
    observer?.observe(document.body);
    document.fonts?.ready.then(scheduleMeasure, () => {});

    return () => {
      active = false;
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(measureFrame);
      observer?.disconnect();
      window.removeEventListener("scroll", scheduleProgress);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [ref, disabled]);
}
