"use client";
import { useEffect, useRef } from "react"
import { useTheme } from "../../contexts/ThemeContext"

export const TimelineItem = ({ event, isLeft, isVisible, observerRef, isRecent }) => {
  const itemRef = useRef(null)
  const { theme } = useTheme();

  useEffect(() => {
    const currentRef = itemRef.current
    const observer = observerRef.current

    if (currentRef && observer) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef && observer) {
        observer.unobserve(currentRef)
      }
    };
  }, [observerRef])

  // Helper function to determine the appropriate colors based on the theme
  const getAccentColor = () => {
    return theme.name === 'dark' ? 'bg-orange-400' : 'bg-green-600';
  };

  const getShadowColor = () => {
    return theme.name === 'dark' 
      ? 'shadow-[0_0_8px_rgba(251,146,60,0.3)]' 
      : 'shadow-[0_0_8px_rgba(22,163,74,0.3)]';
  };

  const getHoverShadow = () => {
    return theme.name === 'dark' 
      ? 'group-hover:shadow-[0_0_10px_rgba(251,146,60,0.9)]' 
      : 'group-hover:shadow-[0_0_10px_rgba(22,163,74,0.9)]';
  };

  const getHoverBorder = () => {
    return theme.name === 'dark' ? 'hover:border-orange-400' : 'hover:border-green-600';
  };

  const getRecentColor = () => {
    return theme.name === 'dark' ? 'text-orange-400' : 'text-green-600';
  };

  const getRecentRing = () => {
    return theme.name === 'dark' ? 'ring-orange-200' : 'ring-green-200';
  };

  return (
    <div
      ref={itemRef}
      id={String(event.id)}
      className={`mb-8 flex justify-between items-center w-full ${isLeft ? "flex-row-reverse" : ""} group`}>
      <div className="order-1 w-5/12"></div>
      <div
        className={`z-20 flex items-center justify-center order-1 ${getAccentColor()} shadow-xl w-8 h-8 rounded-full 
        transition-all duration-300 ${getHoverShadow()} group-hover:scale-110
        ${isRecent ? `ring-4 ${getRecentRing()}` : ""}`}>
        <span className="text-lg text-black font-normal">{event.id}</span>
      </div>
      <div
        className={`order-1 ${theme.card} rounded-lg shadow-md w-5/12 px-6 py-4 
        transition-all duration-300 hover:shadow-[0_0_15px_rgba(251,146,60,0.7)] ${getHoverBorder()} hover:scale-105
        ${getShadowColor()}
        ${isVisible ? (isRecent ? "" : "animate-fadeIn") : "opacity-50"}
        ${isRecent ? theme.name === 'dark' ? "border-orange-400" : "border-green-600" : ""}`}>
        <h3
          className={`mb-3 font-normal text-xl ${isRecent ? getRecentColor() : theme.foreground}`}>{event.title}</h3>
        <p
          className={`text-sm leading-snug tracking-wide ${theme.foreground}`}>{event.description}</p>
        <p className={`mt-2 text-xs ${theme.secondary}`}>{event.date}</p>
      </div>
    </div>
  );
} 