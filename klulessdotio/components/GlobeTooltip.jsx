"use client";

import { useState, useEffect } from 'react';

export default function GlobeTooltip({ country, position, type }) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (country) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [country]);
  
  if (!visible || !country) return null;
  
  const getStatusText = () => {
    if (type === 'visited') return 'Visited';
    if (type === 'work') return 'Work With';
    return '';
  };
  
  return (
    <div 
      className="absolute z-10 bg-black/80 text-white p-2 rounded-md text-sm pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px',
        minWidth: '120px',
        textAlign: 'center',
        borderLeft: type === 'visited' ? '3px solid #3DEC89' : 
                  type === 'work' ? '3px solid #FFA500' : 'none'
      }}
    >
      <div className="font-semibold">{country}</div>
      {type && <div className="text-xs opacity-80">{getStatusText()}</div>}
    </div>
  );
} 