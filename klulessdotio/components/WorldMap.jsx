"use client";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";
import Image from "next/image";
import { visitedCountries, workCountries, countryCodeToName, generateTravelArcs, generateWorkArcs, countryCoordinates } from "@/data/visited-countries";

export function WorldMap({
  lineColor = "#0ea5e9"
}) {
  const svgRef = useRef(null);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const mapContainerRef = useRef(null);
  const map = new DottedMap({ height: 100, grid: "diagonal" });

  // Get theme from localStorage or default to dark if we're on the client
  const isDarkTheme = typeof window !== 'undefined' ? 
    (localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) : true;

  const svgMap = map.getSVG({
    radius: 0.22,
    color: isDarkTheme ? "#FFFFFF40" : "#00000040",
    shape: "circle",
    backgroundColor: isDarkTheme ? "black" : "white",
  });

  // Measure the map container for responsive calculations
  useEffect(() => {
    if (mapContainerRef.current) {
      const updateDimensions = () => {
        const rect = mapContainerRef.current.getBoundingClientRect();
        setMapDimensions({
          width: rect.width,
          height: rect.height
        });
      };
      
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, []);

  const projectPoint = (lat, lng) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (start, end, arcHeight = 0.4) => {
    const midX = (start.x + end.x) / 2;
    const heightFactor = Math.min(start.y, end.y) * arcHeight;
    const midY = Math.min(start.y, end.y) - heightFactor;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    
    // Check if hovering over a point
    const points = Object.entries(countryCoordinates).map(([code, coords]) => {
      const projected = projectPoint(coords.lat, coords.lng);
      return {
        code,
        x: projected.x,
        y: projected.y
      };
    });
    
    // Find closest point within 20px radius
    const closestPoint = points.find(point => {
      const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
      return distance < 20;
    });
    
    if (closestPoint) {
      const countryCode = closestPoint.code;
      const countryName = countryCodeToName[countryCode];
      let type = null;
      
      if (visitedCountries.includes(countryCode)) {
        type = 'visited';
      }
      
      if (workCountries.includes(countryCode)) {
        type = type ? 'both' : 'work';
      }
      
      // Position tooltip above the cursor
      setTooltipInfo({
        country: countryName,
        type,
        x: e.clientX,
        y: e.clientY - 70,
        code: countryCode
      });
    } else {
      setTooltipInfo(null);
    }
  };

  // Get travel arcs for visited and work countries
  const visitedArcs = generateTravelArcs();
  const workArcs = generateWorkArcs();

  // Create an expanded highlighting effect for Australia
  const australiaPoint = projectPoint(countryCoordinates["AUS"].lat, countryCoordinates["AUS"].lng);

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <div
        ref={mapContainerRef}
        className="w-full aspect-[2/1] dark:bg-black bg-white rounded-lg relative font-sans"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltipInfo(null)}
        onClick={(e) => handleMouseMove(e)}>
        <Image
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
          alt="world map"
          height="495"
          width="1056"
          draggable={false} />
        <svg
          ref={svgRef}
          viewBox="0 0 800 400"
          className="w-full h-full absolute inset-0 select-none">
          
          {/* Render arcs for visited countries */}
          {visitedArcs.map((arc, i) => {
            const startPoint = projectPoint(arc.startLat, arc.startLng);
            const endPoint = projectPoint(arc.endLat, arc.endLng);
            return (
              <g key={`visited-arc-${i}`}>
                <path
                  d={createCurvedPath(startPoint, endPoint, 0.4)}
                  fill="none"
                  stroke="#3DEC89"
                  strokeWidth="1.5"
                  strokeDasharray="5,3"
                  opacity="0.7">
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="50"
                    dur="3s"
                    repeatCount="indefinite" />
                </path>
              </g>
            );
          })}
          
          {/* Render arcs for work countries */}
          {workArcs.map((arc, i) => {
            const startPoint = projectPoint(arc.startLat, arc.startLng);
            const endPoint = projectPoint(arc.endLat, arc.endLng);
            return (
              <g key={`work-arc-${i}`}>
                <path
                  d={createCurvedPath(startPoint, endPoint, 0.25)}
                  fill="none"
                  stroke="#FFA500"
                  strokeWidth="1.5"
                  strokeDasharray="3,5"
                  opacity="0.5">
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-40"
                    dur="4s"
                    repeatCount="indefinite" />
                </path>
              </g>
            );
          })}

          <defs>
            <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
              <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            
            {/* Add radial gradients for points */}
            <radialGradient id="visited-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#3DEC89" stopOpacity="1" />
              <stop offset="70%" stopColor="#3DEC89" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3DEC89" stopOpacity="0" />
            </radialGradient>
            
            <radialGradient id="work-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#FFA500" stopOpacity="1" />
              <stop offset="70%" stopColor="#FFA500" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
            </radialGradient>
            
            <radialGradient id="both-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#ff00ff" stopOpacity="1" />
              <stop offset="70%" stopColor="#ff00ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ff00ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Map outlines for countries (improves visibility) */}
          {Object.entries(countryCoordinates).map(([code, coords], i) => {
            const isVisited = visitedCountries.includes(code);
            const isWork = workCountries.includes(code);
            
            // Only show outlines for countries you've visited or work with
            if (!isVisited && !isWork) return null;
            
            const point = projectPoint(coords.lat, coords.lng);
            
            return (
              <circle
                key={`country-outline-${code}`}
                cx={point.x}
                cy={point.y}
                r="8"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.5"
                strokeOpacity="0.3"
              />
            );
          })}
          
          {/* Render points for all countries with appropriate colors */}
          {Object.entries(countryCoordinates).map(([code, coords], i) => {
            const isVisited = visitedCountries.includes(code);
            const isWork = workCountries.includes(code);
            
            // Only show points for countries you've visited or work with
            if (!isVisited && !isWork) return null;
            
            const point = projectPoint(coords.lat, coords.lng);
            
            // Make Australia larger to ensure visibility
            const isAustralia = code === "AUS";
            const pointRadius = isAustralia ? "6" : isVisited && isWork ? "5" : "4";
            const pulseRadius = isAustralia ? "15" : isVisited && isWork ? "12" : "10";
            const fillColor = isVisited && isWork ? "url(#both-gradient)" : 
                             isVisited ? "url(#visited-gradient)" : "url(#work-gradient)";
            
            return (
              <g key={`country-point-${code}`}>
                {/* Base circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={pointRadius}
                  fill={fillColor} />
                
                {/* Interior dot for better visibility */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={(parseInt(pointRadius) * 0.6).toString()}
                  fill={isVisited && isWork ? "#ff00ff" : isVisited ? "#3DEC89" : "#FFA500"} />
                
                {/* Pulsing animation */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={pointRadius}
                  fill={fillColor}
                  opacity="0.5">
                  <animate
                    attributeName="r"
                    from={pointRadius}
                    to={pulseRadius}
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite" />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite" />
                </circle>
                
                {/* Country code text for identification */}
                <text
                  x={point.x}
                  y={point.y + parseInt(pointRadius) + 10}
                  textAnchor="middle"
                  fontSize="8"
                  fill="white"
                  fontWeight="bold">
                  {code}
                </text>
              </g>
            );
          })}

          {/* Special highlight for Australia */}
          <circle
            cx={australiaPoint.x}
            cy={australiaPoint.y}
            r="20"
            fill="none"
            stroke="#ff00ff"
            strokeWidth="1"
            opacity="0.6">
            <animate
              attributeName="r"
              values="15;25;15"
              dur="3s"
              repeatCount="indefinite" />
            <animate
              attributeName="opacity"
              values="0.1;0.6;0.1"
              dur="3s"
              repeatCount="indefinite" />
          </circle>
        </svg>
        
        {/* Tooltip */}
        {tooltipInfo && (
          <div
            className="fixed z-50 bg-neutral-800/90 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 backdrop-blur-sm border border-white/10"
            style={{
              left: `${tooltipInfo.x}px`,
              top: `${tooltipInfo.y}px`,
              transition: 'all 0.1s ease-out'
            }}>
            <div className="font-medium">{tooltipInfo.country}</div>
            {tooltipInfo.type && (
              <div className="text-xs mt-1">
                {tooltipInfo.type === 'visited' && (
                  <span className="text-green-400">✦ Visited</span>
                )}
                {tooltipInfo.type === 'work' && (
                  <span className="text-orange-400">✦ Work</span>
                )}
                {tooltipInfo.type === 'both' && (
                  <div className="flex flex-col">
                    <span className="text-green-400">✦ Visited</span>
                    <span className="text-orange-400">✦ Work</span>
                  </div>
                )}
              </div>
            )}
            <div className="absolute w-2 h-2 bg-neutral-800 transform rotate-45 left-1/2 -ml-1 -bottom-1"></div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3DEC89]"></div>
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FFA500]"></div>
          <span>Work With</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff00ff]"></div>
          <span>Both</span>
        </div>
      </div>
    </div>
  );
} 