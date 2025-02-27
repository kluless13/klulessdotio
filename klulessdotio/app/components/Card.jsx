// Card.jsx
"use client";

import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Card = ({ title, description, children, additionalInfo }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { theme } = useTheme();

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={`card ${isFlipped ? 'flipped' : ''} ${theme.card} border-2 transition-all duration-300 hover:border-orange-400`}
      onClick={handleCardClick}
    >
      <div className="card-inner">
        {/* Front of card */}
        <div className="card-front">
          <h3 className={`text-xl mb-3 ${theme.name === 'dark' ? 'text-orange-400' : 'text-green-600'}`}>
            {title}
          </h3>
          <p className={theme.foreground}>{description}</p>
          <div className="mt-4 text-sm text-center">
            <span className={`${theme.secondary} cursor-pointer`}>
              Tap to see more
            </span>
          </div>
        </div>
        
        {/* Back of card */}
        <div className="card-back">
          <h3 className={`text-xl mb-3 ${theme.name === 'dark' ? 'text-orange-400' : 'text-green-600'}`}>
            {title}
          </h3>
          <div className="overflow-y-auto max-h-[180px] px-2">
            <p className={theme.foreground}>{additionalInfo || description}</p>
            {children && (
              <div className="mt-4">
                {children}
              </div>
            )}
          </div>
          <div className="mt-4 text-sm text-center">
            <span className={`${theme.secondary} cursor-pointer`}>
              Tap to go back
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;