// Card.jsx
"use client";

import React, { useState } from 'react';

const Card = ({ title, description, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={`card ${isFlipped ? 'flipped' : ''} bg-black text-white border-white hover:border-orange-400 transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="card-content flex flex-col items-center justify-center h-full w-full">
        <h3 className="text-orange-400 font-bold text-xl mb-3">{title}</h3>
        <p className="text-white">{description}</p>
      </div>
      {children && isHovered && (
        <div className="additional-cards">
          {children}
        </div>
      )}
    </div>
  );
};

export default Card;