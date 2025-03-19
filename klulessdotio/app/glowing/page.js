"use client";
import { GlowingEffect } from "@/components/GlowingEffect";
import { useState } from "react";

export default function GlowingEffectPage() {
  const [disabled, setDisabled] = useState(false);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-6">
      <h1 className="mb-8 text-center text-3xl font-bold text-white">Glowing Effect Demo</h1>
      
      <button
        onClick={() => setDisabled(!disabled)}
        className="mb-8 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        {disabled ? "Enable Effect" : "Disable Effect"}
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Box 1 */}
        <div className="relative w-60 h-60 rounded-xl bg-gray-800 flex items-center justify-center">
          <GlowingEffect 
            disabled={disabled}
            variant="default"
            spread={20}
            blur={8}
          />
          <span className="text-white text-xl font-semibold z-10">Hover Me!</span>
        </div>
        
        {/* Box 2 */}
        <div className="relative w-60 h-60 rounded-xl bg-gray-800 flex items-center justify-center">
          <GlowingEffect 
            disabled={disabled}
            variant="default"
            spread={30}
            blur={12}
          />
          <span className="text-white text-xl font-semibold z-10">More Blur</span>
        </div>
        
        {/* Box 3 */}
        <div className="relative w-60 h-60 rounded-xl bg-gray-800 flex items-center justify-center">
          <GlowingEffect 
            disabled={disabled}
            variant="white"
            spread={15}
            blur={5}
          />
          <span className="text-white text-xl font-semibold z-10">White Variant</span>
        </div>
      </div>
    </div>
  );
} 