import { useEffect, useState } from "react";

/** One visibility/preference lifecycle shared by CSS and WebGL scene drivers. */
export default function useSceneActivity(
  ref,
  { paused, active, rootMargin = "0px" },
) {
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReducedMotion(media.matches);
    const visibility = () => setPageVisible(!document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin, threshold: 0.01 },
    );
    preference();
    visibility();
    observer.observe(element);
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", preference);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", preference);
    };
  }, [ref, rootMargin]);
  return {
    visible,
    pageVisible,
    reducedMotion,
    running: active && !paused && visible && pageVisible && !reducedMotion,
  };
}
