"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define our themes with more comprehensive styling options
const themes = {
  dark: {
    name: "dark",
    background: "bg-transparent",
    foreground: "text-white",
    primary: "text-orange-400",
    secondary: "text-gray-300",
    accent: "border-orange-400",
    card: "border-gray-800",
    hover: "hover:border-orange-400 hover:text-orange-400",
    button: "bg-orange-400 text-black hover:bg-orange-500",
    shadow: "shadow-orange-400/20",
  },
  light: {
    name: "light",
    background: "bg-transparent",
    foreground: "text-gray-900",
    primary: "text-green-600",
    secondary: "text-gray-700",
    accent: "border-green-600",
    card: "border-gray-200",
    hover: "hover:border-green-600 hover:text-green-600",
    button: "bg-green-600 text-white hover:bg-green-700",
    shadow: "shadow-green-400/20",
  },
  // Add more themes as needed
};

// Create the context
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(themes.dark);
  
  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => 
      prevTheme.name === "dark" ? themes.light : themes.dark
    );
  };

  // Set initial theme based on system preference or saved preference
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme && themes[savedTheme]) {
        setTheme(themes[savedTheme]);
      } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        setTheme(themes.light);
      }
    }
  }, []);

  // Update HTML class and save preference when theme changes
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      
      // Remove all theme classes
      Object.keys(themes).forEach(themeName => {
        html.classList.remove(themeName);
      });
      
      // Add current theme class
      html.classList.add(theme.name);
      
      // Update body class to ensure background is applied correctly
      if (theme.name === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
      }
      
      // Save preference
      localStorage.setItem("theme", theme.name);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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