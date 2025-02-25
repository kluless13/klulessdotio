"use client";
import Link from "next/link"
import { useTheme } from "../contexts/ThemeContext"

export default function Projects() {
  const { theme } = useTheme();
  
  const projects = [
    {
      title: "AI-Powered Content Generator",
      description: "A machine learning application that generates high-quality content for blogs, social media, and marketing materials based on simple prompts.",
      technologies: ["Python", "TensorFlow", "Flask", "React"],
      link: "https://github.com/yourusername/ai-content-generator",
      featured: true
    },
    {
      title: "E-commerce Analytics Dashboard",
      description: "A comprehensive dashboard for e-commerce businesses to track sales, customer behavior, and inventory in real-time with predictive analytics.",
      technologies: ["Next.js", "TypeScript", "D3.js", "Firebase"],
      link: "https://github.com/yourusername/ecommerce-analytics",
      featured: true
    },
    {
      title: "Decentralized Finance Platform",
      description: "A blockchain-based platform for peer-to-peer lending and borrowing with smart contracts and automated interest rate adjustments.",
      technologies: ["Solidity", "Ethereum", "Web3.js", "React"],
      link: "https://github.com/yourusername/defi-platform",
      featured: false
    },
    {
      title: "Health & Fitness Tracker",
      description: "A mobile application that tracks workouts, nutrition, and health metrics with personalized recommendations and progress visualization.",
      technologies: ["React Native", "Node.js", "MongoDB", "TensorFlow Lite"],
      link: "https://github.com/yourusername/fitness-tracker",
      featured: true
    }
  ];
  
  return (
    <div className={`min-h-screen p-8 max-w-4xl mx-auto`}>
      <Link href="/" className={`${theme.primary} hover:underline mb-6 inline-block`}>
        ← Back to Home
      </Link>
      <h1 className={`text-4xl font-bold mb-6 ${theme.primary}`}>My Projects</h1>
      <p className={`mb-8 ${theme.foreground}`}>
        Here&apos;s a collection of projects I&apos;ve built that showcase my skills and interests in software development, 
        machine learning, and web technologies. Each project represents a unique challenge and learning opportunity.
      </p>
      
      {/* Featured Projects Section */}
      <section className="mb-12">
        <h2 className={`text-2xl font-semibold mb-6 ${theme.primary}`}>Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.filter(project => project.featured).map((project, index) => (
            <div key={index} className={`border ${theme.accent} rounded-lg p-6 ${theme.card} shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}>
              <h3 className={`text-xl font-semibold mb-2 ${theme.primary}`}>{project.title}</h3>
              <p className={`${theme.foreground} mb-4`}>{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech, techIndex) => (
                  <span key={techIndex} className={`border border-current ${theme.primary} text-xs px-2 py-1 rounded`}>{tech}</span>
                ))}
              </div>
              <a href={project.link} target="_blank" rel="noopener noreferrer" className={`${theme.primary} hover:underline`}>View Project →</a>
            </div>
          ))}
        </div>
      </section>
      
      {/* Other Projects Section */}
      <section>
        <h2 className={`text-2xl font-semibold mb-6 ${theme.primary}`}>Other Projects</h2>
        <div className="grid grid-cols-1 gap-6">
          {projects.filter(project => !project.featured).map((project, index) => (
            <div key={index} className={`border ${theme.accent} rounded-lg p-5 ${theme.card} shadow-md transition-all duration-300 hover:shadow-lg`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className={`text-lg font-semibold mb-1 ${theme.primary}`}>{project.title}</h3>
                  <p className={`${theme.foreground} mb-3 md:mb-0`}>{project.description}</p>
                </div>
                <div className="flex flex-col items-start md:items-end">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.technologies.slice(0, 2).map((tech, techIndex) => (
                      <span key={techIndex} className={`border border-current ${theme.primary} text-xs px-2 py-1 rounded`}>{tech}</span>
                    ))}
                    {project.technologies.length > 2 && (
                      <span className={`border border-current ${theme.primary} text-xs px-2 py-1 rounded`}>+{project.technologies.length - 2} more</span>
                    )}
                  </div>
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className={`${theme.primary} text-sm hover:underline`}>View Project →</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* GitHub Stats Section */}
      <section className="mt-12">
        <h2 className={`text-2xl font-semibold mb-6 ${theme.primary}`}>GitHub Activity</h2>
        <div className={`border ${theme.accent} rounded-lg p-6 ${theme.card}`}>
          <p className={`${theme.foreground} mb-4`}>
            Check out my GitHub profile for more projects and contributions to open-source.
          </p>
          <div className="flex justify-center">
            <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className={`${theme.primary} hover:underline px-4 py-2 border ${theme.accent} rounded-md transition-all hover:shadow-md`}>
              View GitHub Profile
            </a>
          </div>
        </div>
      </section>
    </div>
  )
} 