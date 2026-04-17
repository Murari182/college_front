import { useMotionValue, useTransform, useSpring } from "motion/react";
import type { RefObject } from "react";
import { useRef } from "react";

/**
 * Returns spring-based rotateX/rotateY motion values driven by mouse position.
 * Attach `ref` to the container, and spread `handlers` on it.
 */
export function use3DTilt(intensity = 12) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 200,
    damping: 30,
  });
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 200,
    damping: 30,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  return { ref: ref as RefObject<HTMLDivElement>, rotateX, rotateY, handleMouseMove, handleMouseLeave };
}
