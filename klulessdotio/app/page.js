"use client";
import HeroSection from "./components/HeroSection"
import { useTheme } from "./contexts/ThemeContext"
import { useState, useCallback, Suspense } from 'react';
import { FloatingDock } from "@/components/FloatingDock";
import dynamic from 'next/dynamic';
import { useGlobe } from "@/lib/useGlobe";
import { generateTravelArcs, generateWorkArcs } from "@/data/visited-countries";
import { StarsBackground } from "@/components/StarsBackground";
import { ShootingStars } from "@/components/ShootingStars";
import { GlowingEffect } from "../components/GlowingEffect";

// Dynamically import the Globe component with SSR disabled
const GlobeComponent = dynamic(
  () => import('@/components/Globe').then((mod) => ({ default: mod.World })),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center text-white text-xl">Loading Globe...</div>
  }
);

// Update globe configuration with dark green theme
const globeConfig = {
  ambientLight: "#ffffff",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  globeColor: "#005c29", // Dark green globe
  emissive: "#004d25", // Dark green emissive
  emissiveIntensity: 0.2,
  shininess: 0.8,
  atmosphereColor: "#4ade80", // Light green atmosphere
  atmosphereAltitude: 0.15,
  polygonColor: "rgba(255,255,255,0.7)",
  arcTime: 2000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  autoRotate: true,
  autoRotateSpeed: 0.5
};

// Function to generate additional arcs between random countries
const generateAdditionalArcs = (visitedCountries, workCountries, countryCoordinates, baseColor, count = 25) => {
  const countries = [...visitedCountries, ...workCountries];
  const arcs = [];
  
  for (let i = 0; i < count; i++) {
    // Get random countries for start and end
    const startIdx = Math.floor(Math.random() * countries.length);
    let endIdx;
    do {
      endIdx = Math.floor(Math.random() * countries.length);
    } while (endIdx === startIdx); // Ensure different countries
    
    const startCountry = countries[startIdx];
    const endCountry = countries[endIdx];
    
    // Only add if coordinates exist for both countries
    if (countryCoordinates[startCountry] && countryCoordinates[endCountry]) {
      // Calculate the distance between points to determine minimum arc height
      const startLat = countryCoordinates[startCountry].lat;
      const startLng = countryCoordinates[startCountry].lng;
      const endLat = countryCoordinates[endCountry].lat;
      const endLng = countryCoordinates[endCountry].lng;
      
      // Calculate great circle distance (approximate)
      const toRad = (deg) => deg * Math.PI / 180;
      const R = 6371; // Earth's radius in km
      const dLat = toRad(endLat - startLat);
      const dLon = toRad(endLng - startLng);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(startLat)) * Math.cos(toRad(endLat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // Adjust arc height based on distance (longer distances need higher arcs)
      // Map the distance to a reasonable arc height (0.2 to 0.5)
      // Normalize distance: most country-country distances are under 15000km
      const normalizedDistance = Math.min(distance / 15000, 1);
      // Calculate minimum required arc height to avoid going through the globe
      const minArcHeight = 0.2 + (normalizedDistance * 0.3);
      
      // Slightly vary the color
      const colorVariation = Math.floor(Math.random() * 30) - 15; // -15 to +15
      const r = parseInt(baseColor.substr(1, 2), 16);
      const g = parseInt(baseColor.substr(3, 2), 16);
      const b = parseInt(baseColor.substr(5, 2), 16);
      
      const newR = Math.min(255, Math.max(0, r + colorVariation));
      const newG = Math.min(255, Math.max(0, g + colorVariation));
      const newB = Math.min(255, Math.max(0, b + colorVariation));
      
      const newColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
      
      arcs.push({
        startLat: startLat,
        startLng: startLng,
        endLat: endLat,
        endLng: endLng,
        color: newColor,
        arcAlt: minArcHeight, // Use calculated minimum height to prevent passing through globe
        order: i
      });
    }
  }
  
  return arcs;
}

export default function HomePage() {
  const { theme } = useTheme();
  const [showOsUI, setShowOsUI] = useState(false);
  const isClient = useGlobe();
  // Generate different colored arcs for visited and work countries
  const [travelData, setTravelData] = useState([]);
  
  // Handle text animation completion
  const handleAnimationComplete = useCallback(() => {
    console.log("Animation complete, showing OS UI");
    setShowOsUI(true);
    
    // Generate arcs with different colors
    if (isClient) {
      // Import required data for additional arcs
      import('@/data/visited-countries').then(({ 
        visitedCountries, 
        workCountries, 
        countryCoordinates,
        generateTravelArcs, 
        generateWorkArcs 
      }) => {
        // Standard arcs with modified heights
        const visitedArcs = generateTravelArcs().map(arc => {
          // Calculate distance between points
          const toRad = (deg) => deg * Math.PI / 180;
          const R = 6371; // Earth's radius in km
          const dLat = toRad(arc.endLat - arc.startLat);
          const dLon = toRad(arc.endLng - arc.startLng);
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(toRad(arc.startLat)) * Math.cos(toRad(arc.endLat)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          // Adjust arc height based on distance
          const normalizedDistance = Math.min(distance / 15000, 1);
          const minArcHeight = 0.2 + (normalizedDistance * 0.3);
          
          return {
            ...arc,
            color: "#3DEC89", // Green for visited
            arcAlt: Math.max(minArcHeight, arc.arcAlt * 0.6) // Use minimum height or scaled height, whichever is greater
          };
        });
        
        const workArcs = generateWorkArcs().map(arc => {
          // Calculate distance between points
          const toRad = (deg) => deg * Math.PI / 180;
          const R = 6371; // Earth's radius in km
          const dLat = toRad(arc.endLat - arc.startLat);
          const dLon = toRad(arc.endLng - arc.startLng);
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(toRad(arc.startLat)) * Math.cos(toRad(arc.endLat)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          // Adjust arc height based on distance
          const normalizedDistance = Math.min(distance / 15000, 1);
          const minArcHeight = 0.2 + (normalizedDistance * 0.3);
          
          return {
            ...arc,
            color: "#FFA500", // Orange for work
            arcAlt: Math.max(minArcHeight, arc.arcAlt * 0.6) // Use minimum height or scaled height, whichever is greater
          };
        });
        
        // Generate additional random arcs
        const extraVisitedArcs = generateAdditionalArcs(
          visitedCountries, 
          [], 
          countryCoordinates, 
          "#3DEC89", 
          25
        );
        
        const extraWorkArcs = generateAdditionalArcs(
          [], 
          workCountries, 
          countryCoordinates, 
          "#FFA500", 
          25
        );
        
        setTravelData([
          ...visitedArcs, 
          ...workArcs, 
          ...extraVisitedArcs, 
          ...extraWorkArcs
        ]);
      });
    }
  }, [isClient]);
  
  // Define items for the dock
  const dockItems = [
    { 
      title: "About Me", 
      href: "/about-me", 
      icon: <span className="text-2xl">📁</span>,
      hoverIcon: <span className="text-2xl">📂</span>
    },
    { 
      title: "Timeline", 
      href: "/timeline", 
      icon: <span className="text-2xl">📅</span>,
      hoverIcon: <span className="text-2xl">📆</span>
    },
    { 
      title: "Books", 
      href: "/books", 
      icon: <span className="text-2xl">📗</span>,
      hoverIcon: <span className="text-2xl">📖</span>
    },
    { 
      title: "Projects", 
      href: "/projects", 
      icon: <span className="text-2xl">📁</span>,
      hoverIcon: <span className="text-2xl">📂</span>
    },
    { 
      title: "Messages", 
      href: "/messages", 
      icon: <span className="text-2xl">💬</span>,
      hoverIcon: <span className="text-2xl">💭</span>
    },
    { 
      title: "Settings", 
      href: "#settings", 
      icon: <span className="text-2xl">⚙️</span>,
      hoverIcon: <span className="text-2xl">🛠️</span>
    },
  ];
  
  return (
    <main className="flex flex-col min-h-screen bg-black">
      <div className="flex-1 relative">
        {!showOsUI ? (
          <HeroSection 
            showText={true} 
            onAnimationComplete={handleAnimationComplete}
          />
        ) : (
          <div className="w-full h-screen flex items-center justify-center relative overflow-hidden bg-black">
            {/* Stars background */}
            <StarsBackground 
              starDensity={0.0008} // Increased density for more visibility
              twinkleProbability={0.9}
              minTwinkleSpeed={0.3}
              maxTwinkleSpeed={0.8}
            />
            
            {/* Shooting stars */}
            <ShootingStars 
              minDelay={800}
              maxDelay={2000}
              starColor="#ffffff" // Brighter white color
              trailColor="#a0f0ff" // Light blue trail
              starWidth={15}
              starHeight={2}
            />
            
            {isClient ? (
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white text-xl">Loading Globe...</div>}>
                <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] h-[90vh] mx-auto relative z-10">
                  <GlobeComponent 
                    globeConfig={globeConfig} 
                    data={travelData}
                  />
                </div>
              </Suspense>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xl">
                Loading...
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Floating Dock - only appears after hero text */}
      {showOsUI && (
        <div className="fixed bottom-6 left-0 right-0 z-50 animate-fadeIn">
          <FloatingDock 
            items={dockItems}
            desktopClassName="w-fit bg-opacity-80 backdrop-blur-sm border border-gray-800 shadow-lg"
            mobileClassName="fixed bottom-6 right-6"
          />
        </div>
      )}
    </main>
  )
}
