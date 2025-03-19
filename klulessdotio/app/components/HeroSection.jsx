'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Vortex } from '../../components/Vortex';

const HeroSection = ({ showText = true, onAnimationComplete }) => {
  const [initialDelayComplete, setInitialDelayComplete] = useState(false);
  const { theme } = useTheme();
  
  // After initial load, wait 2 seconds and then signal completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialDelayComplete(true);
    }, 3000); // Show vortex for 3 seconds
    
    return () => clearTimeout(timer);
  }, []);

  // When initial delay is complete, trigger the animation completion
  useEffect(() => {
    if (initialDelayComplete && onAnimationComplete) {
      onAnimationComplete();
    }
  }, [initialDelayComplete, onAnimationComplete]);

  return (
    <section className="relative flex flex-col items-center justify-center text-center px-4 bg-black min-h-screen overflow-hidden">
      <AnimatePresence>
        {showText && (
          <motion.div 
            className="w-full h-full absolute inset-0"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.6, ease: "easeOut" }
            }}
          >
            <Vortex 
              backgroundColor="#000000"
              baseHue={20} // Orange
              rangeHue={10}
              baseSpeed={0.3}
              rangeSpeed={1.0}
              baseRadius={1.5}
              rangeRadius={1.5}
              particleCount={800}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default HeroSection;
