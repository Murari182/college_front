/**
 * Standardized Animation Variants for CollegeConnects
 * Optimized for speed, fluidity, and consistent triggers.
 */

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] } // Fast bespoke cubic-bezier
};

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

export const blurFocus = {
  initial: { opacity: 0, filter: "blur(10px)", scale: 0.98 },
  animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

/**
 * Creative: Scattered tiles converging to center
 */
export const scattered = (index: number) => {
  const x = index % 2 === 0 ? -120 : 120;
  const y = index < 2 ? -80 : 80;
  return {
    initial: { opacity: 0, x, y, rotate: index % 2 === 0 ? -15 : 15, scale: 0.9 },
    animate: { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 },
    transition: { 
      type: "spring", 
      stiffness: 70, 
      damping: 14, 
      mass: 1,
      delay: index * 0.08 
    }
  };
};

/**
 * Creative: 3D Perspective unfold (flipping up from floor)
 */
export const perspectiveUnfold = {
  initial: { 
    opacity: 0, 
    rotateX: 85, 
    y: 100, 
    scale: 0.9,
    filter: "blur(8px)" 
  },
  animate: { 
    opacity: 1, 
    rotateX: 0, 
    y: 0, 
    scale: 1,
    filter: "blur(0px)" 
  },
  transition: { 
    duration: 0.8, 
    ease: [0.16, 1, 0.3, 1] 
  }
};

export const viewportConfig = {
  once: false,
  amount: 0.15, 
  margin: "0px 0px -50px 0px"
};

/**
 * Buttery smooth spring for scroll-linked transforms
 */
export const springConfig = { 
  stiffness: 100, 
  damping: 30, 
  restDelta: 0.001 
};
