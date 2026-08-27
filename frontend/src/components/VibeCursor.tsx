import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const VibeCursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useSpring(0, { stiffness: 450, damping: 35 });
  const mouseY = useSpring(0, { stiffness: 450, damping: 35 });

  useEffect(() => {
    // Only enable custom cursor on non-touch pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('button') ||
          target.closest('a') ||
          target.classList.contains('cursor-pointer'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* 1. Large Ambient Radial Spotlight following Cursor */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="fixed top-0 left-0 pointer-events-none z-0 w-[500px] h-[500px] rounded-full opacity-20 transition-opacity duration-300"
        animate={{
          background: isHovered
            ? 'radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, rgba(139, 92, 246, 0.15) 35%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(139, 92, 246, 0.08) 35%, transparent 70%)',
        }}
      />

      {/* 2. Sleek Vibe Ring Cursor Indicator */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        className="fixed top-0 left-0 pointer-events-none z-50 rounded-full border border-cyber-cyan/50 shadow-glow-cyan"
        animate={{
          width: isHovered ? 44 : 24,
          height: isHovered ? 44 : 24,
          backgroundColor: isHovered ? 'rgba(0, 240, 255, 0.15)' : 'rgba(0, 240, 255, 0.05)',
          scale: isHovered ? 1.15 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      >
        <div className="w-1.5 h-1.5 bg-cyber-cyan rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </motion.div>
    </>
  );
};
