"use client";
import FolderIcon from "@/components/FolderIcon"
import HeroSection from "./components/HeroSection"
import MessageWall from "./components/MessageWall"
import Link from 'next/link'
import { useTheme } from "./contexts/ThemeContext"

const sections = [
  { name: "About Me", path: "about-me", icon: "📁" },
  { name: "Timeline", path: "timeline", icon: "📅" },
  { name: "Books", path: "books", icon: "📗" },
  { name: "Projects", path: "projects", icon: "📁" },
  { name: "Messages", path: "messages", icon: "💬" },
]

export default function HomePage() {
  const { theme } = useTheme();
  
  return (
    <main className={`flex flex-col items-center justify-between min-h-screen`}>
      <HeroSection />
      
      <div className="flex-1 flex flex-col justify-center items-center p-8 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 gap-y-8 max-w-6xl mx-auto">
          {sections.map((section, index) => (
            <Link 
              key={section.name} 
              href={section.path}
              className={`flex justify-center ${index > 2 && index < 5 ? 'small-screen-bottom' : ''}`}
            >
              <FolderIcon 
                name={section.name} 
                path={section.path} 
                icon={section.icon} 
              />
            </Link>
          ))}
        </div>
      </div>
      
      {/* Message Wall Section */}
      <div className="w-full px-4 py-12 relative">
        <MessageWall />
      </div>
      
      <footer className={`w-full py-4 text-center ${theme.primary}`}>
        <p>© 2025 kluless.io</p>
      </footer>
    </main>
  )
}
