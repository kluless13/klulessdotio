"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define our theme with comprehensive styling options
const darkTheme = {
  name: "dark",
  mode: "dark", // For spotlight effect
  background: "bg-transparent",
  foreground: "text-white",
  primary: "text-orange-400",
  secondary: "text-gray-200",
  accent: "border-orange-400",
  card: "border-gray-800",
  hover: "hover:border-orange-400 hover:text-orange-400",
  button: "bg-orange-400 text-black hover:bg-orange-500",
  shadow: "shadow-orange-400/20",
};

// Create the context
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Always use dark theme
  const [theme] = useState(darkTheme);
  
  // Update HTML class when component mounts
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      
      // Add dark theme class
      html.classList.add('dark');
      
      // Update body class to ensure background is applied correctly
      document.body.classList.add('dark-theme');
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
} 