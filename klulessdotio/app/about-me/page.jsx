"use client";
import Link from "next/link"
import { useTheme } from "../contexts/ThemeContext"

export default function AboutMe() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 max-w-6xl mx-auto`}>
      <Link href="/" className={`${theme.primary} hover:underline mb-4 sm:mb-6 md:mb-8 inline-block text-sm sm:text-base`}>
        ← Back to Home
      </Link>
      <h1 className={`text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 md:mb-8 ${theme.primary}`}>About Me</h1>
      
      <section className={`mb-6 sm:mb-8 md:mb-10 ${theme.foreground}`}>
        <h2 className={`text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 md:mb-6 ${theme.primary}`}>Who I Am</h2>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base">
          I&apos;m a passionate software engineer and technology enthusiast with a deep interest in building innovative solutions that solve real-world problems. With a background in computer science and several years of industry experience, I&apos;ve developed expertise in full-stack development, machine learning, and cloud architecture.
        </p>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base">
          When I&apos;m not coding, you can find me exploring new technologies, contributing to open-source projects, or sharing my knowledge through technical writing and mentoring.
        </p>
      </section>
      
      <section className={`mb-6 sm:mb-8 md:mb-10 ${theme.foreground}`}>
        <h2 className={`text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 md:mb-6 ${theme.primary}`}>Skills & Expertise</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h3 className={`text-lg sm:text-xl mb-2 sm:mb-3 ${theme.primary}`}>Languages</h3>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 text-sm sm:text-base">
              <li>JavaScript/TypeScript</li>
              <li>Python</li>
              <li>Go</li>
              <li>SQL</li>
            </ul>
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl mb-2 sm:mb-3 ${theme.primary}`}>Frameworks & Tools</h3>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 ml-2 text-sm sm:text-base">
              <li>React & Next.js</li>
              <li>Node.js & Express</li>
              <li>TensorFlow & PyTorch</li>
              <li>AWS & Google Cloud</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className={`mb-6 sm:mb-8 md:mb-10 ${theme.foreground}`}>
        <h2 className={`text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 md:mb-6 ${theme.primary}`}>Education & Certifications</h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h3 className={`text-lg sm:text-xl ${theme.primary}`}>B.S. in Computer Science</h3>
            <p className="text-xs sm:text-sm opacity-80">University of Technology, 2018-2022</p>
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl ${theme.primary}`}>AWS Certified Solutions Architect</h3>
            <p className="text-xs sm:text-sm opacity-80">Amazon Web Services, 2023</p>
          </div>
        </div>
      </section>
      
      <section className={`${theme.foreground}`}>
        <h2 className={`text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4 md:mb-6 ${theme.primary}`}>Get In Touch</h2>
        <p className="mb-4 text-sm sm:text-base">
          I&apos;m always open to discussing new projects, creative ideas, or opportunities to be part of your vision. Feel free to reach out through any of the platforms below.
        </p>
        <div className="flex space-x-4">
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className={`${theme.primary} text-sm sm:text-base hover:underline`}>GitHub</a>
          <a href="https://linkedin.com/in/" target="_blank" rel="noopener noreferrer" className={`${theme.primary} text-sm sm:text-base hover:underline`}>LinkedIn</a>
          <a href="mailto:hello@example.com" className={`${theme.primary} text-sm sm:text-base hover:underline`}>Email</a>
        </div>
      </section>
    </div>
  )
} 