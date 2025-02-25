"use client";
import Link from "next/link"
import { VerticalTimeline } from "../components/Timeline/VerticalTimeline"
import { useTheme } from "../contexts/ThemeContext"

export default function Timeline() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen p-8`}>
      <div className="max-w-4xl mx-auto">
        <Link href="/" className={`${theme.primary} hover:underline mb-6 inline-block`}>
          ← Back to Home
        </Link>
        <h1 className={`text-4xl font-bold mb-6 ${theme.primary}`}>My Timeline</h1>
        <VerticalTimeline />
      </div>
    </div>
  );
} 