'use client';
import React, { useState } from 'react';
import { useTheme } from '../app/contexts/ThemeContext';

/**
 * Renders a folder icon component that serves as a navigation link
 * @param {Object} props - Component props
 * @param {string} props.name - Display name for the folder
 * @param {string} props.path - URL path for the folder link
 * @param {string} props.icon - Emoji icon to display
 */
export default function FolderIcon({ name, path, icon }) {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  
  // Handle icon display transformations on hover
  const displayIcon = () => {
    if (isHovered) {
      // Handle different icon types
      switch (icon) {
        case '📁': // Folder
          return '📂'; // Open folder
        case '📚': // Books
          return '📖'; // Open book
        case '📅': // Calendar/Timeline
          return '📆'; // Detailed calendar
        case '💬': // Messages
          return '💭'; // Message bubble
        default:
          return icon; // Return original icon if no transformation defined
      }
    }
    
    // Return original icon when not hovered
    return icon;
  };

  // Get the text color based on the current theme
  const getTextColor = () => {
    return theme.name === 'dark' ? 'text-orange-400' : 'text-green-600';
  };
  
  return (
    <div 
      className="flex flex-col items-center justify-center hover:scale-110 transition-transform"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-6xl mb-2 transition-all duration-300">{displayIcon()}</div>
      <span className={`font-normal ${getTextColor()} transition-colors duration-300`}>{name}</span>
    </div>
  );
} 