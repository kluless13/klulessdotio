"use client";
import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef, useCallback } from "react";

export const StarsBackground = ({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
}) => {
  const [stars, setStars] = useState([]);
  const canvasRef = useRef(null);

  const generateStars = useCallback((width, height) => {
    const area = width * height;
    const numStars = Math.floor(area * starDensity);
    return Array.from({ length: numStars }, () => {
      const shouldTwinkle =
        allStarsTwinkle || Math.random() < twinkleProbability;
      // Create different sized stars for more realism
      const sizeCategory = Math.random();
      let radius, baseOpacity;
      
      if (sizeCategory < 0.7) {
        // 70% small stars
        radius = Math.random() * 0.5 + 0.8;
        baseOpacity = Math.random() * 0.2 + 0.7; 
      } else if (sizeCategory < 0.95) {
        // 25% medium stars
        radius = Math.random() * 0.8 + 1.3;
        baseOpacity = Math.random() * 0.2 + 0.8;
      } else {
        // 5% large, bright stars
        radius = Math.random() * 1.5 + 2.0;
        baseOpacity = Math.random() * 0.1 + 0.9;
      }
      
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: radius,
        opacity: baseOpacity,
        twinkleSpeed: shouldTwinkle
          ? minTwinkleSpeed +
            Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
          : null,
        sizeCategory: sizeCategory,
      };
    });
  }, [
    starDensity,
    allStarsTwinkle,
    twinkleProbability,
    minTwinkleSpeed,
    maxTwinkleSpeed,
  ]);

  useEffect(() => {
    const updateStars = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        setStars(generateStars(width, height));
      }
    };

    updateStars();

    const resizeObserver = new ResizeObserver(updateStars);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      if (canvasRef.current) {
        resizeObserver.unobserve(canvasRef.current);
      }
    };
  }, [
    starDensity,
    allStarsTwinkle,
    twinkleProbability,
    minTwinkleSpeed,
    maxTwinkleSpeed,
    generateStars,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        
        // Different glow effects based on star size
        const glowSize = star.sizeCategory < 0.95 ? star.radius * 2 : star.radius * 3;
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, glowSize
        );
        
        if (star.sizeCategory < 0.7) {
          // Small stars - subtle glow
          gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
          gradient.addColorStop(0.5, `rgba(240, 240, 255, ${star.opacity * 0.4})`);
          gradient.addColorStop(1, `rgba(230, 230, 255, 0)`);
        } else if (star.sizeCategory < 0.95) {
          // Medium stars - brighter glow
          gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
          gradient.addColorStop(0.4, `rgba(240, 245, 255, ${star.opacity * 0.6})`);
          gradient.addColorStop(1, `rgba(230, 240, 255, 0)`);
        } else {
          // Large stars - intense glow and color
          gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
          gradient.addColorStop(0.2, `rgba(220, 240, 255, ${star.opacity * 0.8})`);
          gradient.addColorStop(0.4, `rgba(200, 220, 255, ${star.opacity * 0.6})`);
          gradient.addColorStop(1, `rgba(180, 200, 255, 0)`);
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();

        if (star.twinkleSpeed !== null) {
          const twinkleIntensity = star.sizeCategory < 0.95 ? 0.3 : 0.15;
          star.opacity =
            (star.sizeCategory < 0.7 ? 0.7 : star.sizeCategory < 0.95 ? 0.8 : 0.9) +
            Math.abs(Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * twinkleIntensity);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("h-full w-full absolute inset-0 z-0", className)} />
  );
}; 