"use client";
import Link from "next/link"
import { VerticalTimeline } from "../components/Timeline/VerticalTimeline"
import { useTheme } from "../contexts/ThemeContext"

export default function Timeline() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 lg:p-12`}>
      <div className="max-w-6xl mx-auto">
        <Link href="/" className={`${theme.primary} hover:underline mb-4 sm:mb-6 md:mb-8 inline-block text-sm sm:text-base`}>
          ← Back to Home
        </Link>
        <h1 className={`text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 md:mb-8 ${theme.primary}`}>My Timeline</h1>
        <VerticalTimeline />
      </div>
    </div>
  );
} 