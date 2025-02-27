'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { LetterFx } from './LetterFx';
import { useTheme } from '../contexts/ThemeContext';

const HeroSection = () => {
  const [triggerMain, setTriggerMain] = useState(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const timeoutRef = useRef(null);
  const { theme } = useTheme();

  const phrases = useMemo(() => [
    "Nothing comes from nothin.",
    "All is flux, nothing is stationary.",
    "The only thing that is constant is change."
  ], []);

  // Trigger the main heading animation on load ONCE
  useEffect(() => {
    if (triggerMain && !hasTriggered) {
      triggerMain();
      setHasTriggered(true); // Mark as triggered so it won't happen again
    }
  }, [triggerMain, hasTriggered]);

  // Typewriter effect for phrases
  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    
    // Clear any existing timeouts to prevent memory leaks
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isTyping) {
      // If typing, add one character at a time
      if (displayText.length < currentPhrase.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(currentPhrase.substring(0, displayText.length + 1));
        }, 100);
      } else {
        // When we've typed the full phrase, wait before erasing
        timeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      // If erasing, remove one character at a time
      if (displayText.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, 50);
      } else {
        // When fully erased, move to next phrase and start typing again
        setCurrentPhraseIndex((currentPhraseIndex + 1) % phrases.length);
        setIsTyping(true);
      }
    }

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [displayText, isTyping, currentPhraseIndex, phrases]);

  return (
    <section className={`flex flex-col items-center justify-center text-center py-12 md:py-20 px-4 ${theme.background}`}>
      <h1 className={`${theme.foreground} text-2xl md:text-4xl mb-2 leading-tight`}>
        <LetterFx 
          trigger="custom" 
          speed="slow"
          charset={["$", "O", "7", "#", "@", "N", "E", "9", "D", "5", "W", "L",
            "6", "!", "^", "*", "h", "k", "4", "&"
          ]}
          onTrigger={(trigger) => setTriggerMain(trigger)}
        >
          Fortune, good night; smile once more, turn thy wheel.
        </LetterFx>
      </h1>
      <h1 className={`${theme.foreground} mb-2`}>-</h1>
      <h1 className={`${theme.primary} text-xl md:text-2xl`}>
        {displayText}
        <span className="animate-pulse">|</span>
      </h1>
    </section>
  );
}

export default HeroSection;
