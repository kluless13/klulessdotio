"use client";
import { useEffect, useRef, useState } from "react"
import { useTheme } from "../../contexts/ThemeContext"

export const TimelineItem = ({ event, isVisible, observerRef, isRecent }) => {
  const itemRef = useRef(null)
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Get theme-specific styles
  const getGlowColor = () => {
    return theme.name === 'dark' 
      ? 'shadow-[0_0_15px_rgba(251,146,60,0.3)]' 
      : 'shadow-[0_0_15px_rgba(22,163,74,0.3)]';
  };

  const getDotColor = () => {
    return theme.name === 'dark' ? 'bg-orange-400' : 'bg-green-600';
  };

  const getHoverGlow = () => {
    return theme.name === 'dark'
      ? 'hover:shadow-[0_0_20px_rgba(251,146,60,0.5)]'
      : 'hover:shadow-[0_0_20px_rgba(22,163,74,0.5)]';
  };

  return (
    <div
      ref={itemRef}
      id={String(event.id)}
      className={`relative pl-8 pb-8 group transition-opacity duration-500
        ${isVisible ? 'opacity-100' : 'opacity-50'}`}
    >
      {/* Timeline dot */}
      <div className={`absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full ${getDotColor()} 
        transition-all duration-300 group-hover:scale-125
        ${isRecent ? 'ring-2 ring-orange-200 dark:ring-orange-700' : ''}`}
      />

      {/* Content card */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`${theme.card} rounded-lg p-4 cursor-pointer
          transition-all duration-300
          ${getGlowColor()}
          ${getHoverGlow()}
          ${expanded ? 'scale-102' : 'hover:scale-[1.01]'}
          ${isRecent ? theme.name === 'dark' ? 'border-orange-400/50' : 'border-green-600/50' : ''}`}
      >
        <div className="flex flex-col">
          <span className={`text-sm ${theme.secondary} mb-1`}>
            {formatDate(event.date)}
          </span>
          <h3 className={`font-medium text-lg mb-2 ${isRecent ? theme.primary : theme.foreground}`}>
            {event.title}
          </h3>
          <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96' : 'max-h-20'}`}>
            <p className={`text-sm leading-relaxed ${theme.foreground}`}>
              {event.description}
            </p>
            {event.additionalInfo && expanded && (
              <div className={`mt-3 pt-2 border-t ${theme.name === 'dark' ? 'border-orange-400/20' : 'border-green-600/20'}`}>
                <p className={`text-sm leading-relaxed ${theme.foreground}`}>
                  {event.additionalInfo}
                </p>
              </div>
            )}
          </div>
          <div className="mt-2 text-xs text-center">
            <span className={`${theme.secondary} hover:underline`}>
              {expanded ? "Show less" : "Show more"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 