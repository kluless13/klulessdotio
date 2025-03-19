"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useGlobe } from "@/lib/useGlobe";
import { 
  generateTravelArcs, 
  visitedCountries, 
  workCountries,
  countryCodeToName
} from "@/data/visited-countries";
import GlobeTooltip from "@/components/GlobeTooltip";

// Dynamically import the WorldComponent
const WorldComponent = dynamic(() => import("@/components/Globe").then(mod => ({ default: mod.World })), {
  ssr: false,
  loading: () => <div className="flex h-screen w-full items-center justify-center">Loading Globe...</div>,
});

export default function Globe() {
  const isClient = useGlobe();
  const [travelArcs, setTravelArcs] = useState([]);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    // Generate travel arcs when component mounts on client
    if (isClient) {
      const arcs = generateTravelArcs();
      setTravelArcs(arcs);
    }
  }, [isClient]);

  // Track mouse position for tooltip
  useEffect(() => {
    if (!isClient) return;

    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isClient]);

  // Handle country hover/click
  const handleCountryInteraction = (countryCode, name) => {
    if (!countryCode) {
      setTooltipInfo(null);
      return;
    }

    let type = null;
    
    if (visitedCountries.includes(countryCode)) {
      type = 'visited';
    }
    
    if (workCountries.includes(countryCode)) {
      // If a country is both visited and worked with, prioritize "visited"
      type = type || 'work';
    }
    
    const countryName = name || countryCodeToName[countryCode] || countryCode;
    
    setTooltipInfo({
      country: countryName,
      type: type
    });
  };

  // Configuration for the globe
  const globeConfig = {
    pointLight: "#ffffff",
    ambientLight: "#94a3b8",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#9ca3af",
    arcTime: 1000, // Faster animation
    arcLength: 0.9,
    globeColor: "#1d072e", // Dark purple background
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen flex items-center justify-center"
      onClick={() => tooltipInfo && setTooltipInfo(null)}
    >
      {tooltipInfo && (
        <GlobeTooltip 
          country={tooltipInfo.country}
          position={mousePosition}
          type={tooltipInfo.type}
        />
      )}
      
      {isClient && (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
          <WorldComponent 
            globeConfig={globeConfig} 
            data={travelArcs} 
            onCountryHover={handleCountryInteraction}
            onCountryClick={handleCountryInteraction}
          />
        </Suspense>
      )}
    </div>
  );
} 