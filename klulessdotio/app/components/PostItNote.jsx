"use client";
import { useTheme } from '../contexts/ThemeContext';
import { useState, useRef, useEffect } from 'react';

export default function PostItNote({ message, style }) {
  const { theme } = useTheme();
  const noteRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  
  // Map color names to tailwind classes
  const colorClasses = {
    yellow: 'bg-yellow-100 dark:bg-yellow-800',
    blue: 'bg-blue-100 dark:bg-blue-800',
    green: 'bg-green-100 dark:bg-green-800',
    pink: 'bg-pink-100 dark:bg-pink-800',
    orange: 'bg-orange-100 dark:bg-orange-800',
    purple: 'bg-purple-100 dark:bg-purple-800',
  };
  
  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Set initial position based on provided style
  useEffect(() => {
    if (style && noteRef.current && noteRef.current.parentElement) {
      const noteRect = noteRef.current.getBoundingClientRect();
      const parentRect = noteRef.current.parentElement.getBoundingClientRect();
      
      // Calculate initial position
      let initialX = 0;
      let initialY = 0;
      
      if (style.left) {
        initialX = parseFloat(style.left) / 100 * parentRect.width;
      } else if (style.right) {
        initialX = parentRect.width - (parseFloat(style.right) / 100 * parentRect.width) - noteRect.width;
      }
      
      if (style.top) {
        initialY = parseFloat(style.top) / 100 * parentRect.height;
      } else if (style.bottom) {
        initialY = parentRect.height - (parseFloat(style.bottom) / 100 * parentRect.height) - noteRect.height;
      }
      
      // Ensure positions are valid numbers and within bounds
      initialX = isNaN(initialX) ? 0 : Math.max(0, Math.min(parentRect.width - noteRect.width, initialX));
      initialY = isNaN(initialY) ? 0 : Math.max(0, Math.min(parentRect.height - noteRect.height, initialY));
      
      setPosition({ x: initialX, y: initialY });
      setInitialPos({ x: initialX, y: initialY });
    }
  }, [style]);
  
  // Start dragging
  const handleMouseDown = (e) => {
    if (!noteRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setInitialMousePos({
      x: e.clientX,
      y: e.clientY
    });
    setInitialPos({
      x: position.x,
      y: position.y
    });
    
    // Add cursor styling
    document.body.style.cursor = 'grabbing';
  };
  
  // Start dragging (touch)
  const handleTouchStart = (e) => {
    if (!noteRef.current) return;
    
    const touch = e.touches[0];
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setInitialMousePos({
      x: touch.clientX,
      y: touch.clientY
    });
    setInitialPos({
      x: position.x,
      y: position.y
    });
  };
  
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!isDragging || !noteRef.current || !noteRef.current.parentElement) return;
      
      const dx = e.clientX - initialMousePos.x;
      const dy = e.clientY - initialMousePos.y;
      
      // Get parent container dimensions
      const parentRect = noteRef.current.parentElement.getBoundingClientRect();
      const noteRect = noteRef.current.getBoundingClientRect();
      
      // Calculate new position
      let newX = initialPos.x + dx;
      let newY = initialPos.y + dy;
      
      // Constrain to parent boundaries
      newX = Math.max(0, Math.min(parentRect.width - noteRect.width, newX));
      newY = Math.max(0, Math.min(parentRect.height - noteRect.height, newY));
      
      setPosition({
        x: newX,
        y: newY
      });
      
      setHasBeenDragged(true);
    };

    const handleTouchMove = (e) => {
      if (!isDragging || !noteRef.current || !noteRef.current.parentElement || !e.touches[0]) return;
      
      const touch = e.touches[0];
      const dx = touch.clientX - initialMousePos.x;
      const dy = touch.clientY - initialMousePos.y;
      
      // Get parent container dimensions
      const parentRect = noteRef.current.parentElement.getBoundingClientRect();
      const noteRect = noteRef.current.getBoundingClientRect();
      
      // Calculate new position
      let newX = initialPos.x + dx;
      let newY = initialPos.y + dy;
      
      // Constrain to parent boundaries
      newX = Math.max(0, Math.min(parentRect.width - noteRect.width, newX));
      newY = Math.max(0, Math.min(parentRect.height - noteRect.height, newY));
      
      setPosition({
        x: newX,
        y: newY
      });
      
      setHasBeenDragged(true);
      
      // Prevent scrolling while dragging
      e.preventDefault();
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, initialMousePos, initialPos]);
  
  const backgroundClass = colorClasses[message.color] || colorClasses.yellow;
  
  // Generate a random rotation between -3 and 3 degrees
  const randomRotation = Math.floor(Math.random() * 6) - 3;
  
  return (
    <div 
      ref={noteRef}
      className={`${backgroundClass} rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 ${isDragging ? 'cursor-grabbing opacity-80' : 'cursor-grab'} select-none`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${randomRotation}deg)`,
        maxWidth: '250px',
        minHeight: '180px',
        zIndex: isDragging ? 100 : (hasBeenDragged ? 50 : Math.floor(Math.random() * 10 + 10)),
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <p className="text-sm mb-3 italic line-clamp-6">{message.message}</p>
        </div>
        <div className="mt-auto">
          <p className={`text-xs font-semibold ${theme.name === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            — {message.name}
          </p>
          <p className={`text-xs ${theme.name === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {formatDate(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
} 