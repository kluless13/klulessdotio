"use client";
import Link from "next/link"
import { useTheme } from "../contexts/ThemeContext"
import { useState } from "react"

export default function Projects() {
  const { theme } = useTheme();
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  const toggleItem = (index) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };
  
  const projects = [
    {
      title: "AI-Powered Content Generator",
      description: "A machine learning application that generates high-quality content for blogs, social media, and marketing materials based on simple prompts.",
      shortLine: "AI-driven content creation platform.",
      technologies: ["Python", "TensorFlow", "Flask", "React"],
      link: "https://github.com/yourusername/ai-content-generator",
      category: "Machine Learning",
      featured: true
    },
    {
      title: "E-commerce Analytics Dashboard",
      description: "A comprehensive dashboard for e-commerce businesses to track sales, customer behavior, and inventory in real-time with predictive analytics.",
      shortLine: "Real-time e-commerce analytics platform.",
      technologies: ["Next.js", "TypeScript", "D3.js", "Firebase"],
      link: "https://github.com/yourusername/ecommerce-analytics",
      category: "Web Development",
      featured: true
    },
    {
      title: "Decentralized Finance Platform",
      description: "A blockchain-based platform for peer-to-peer lending and borrowing with smart contracts and automated interest rate adjustments.",
      shortLine: "P2P lending on the blockchain.",
      technologies: ["Solidity", "Ethereum", "Web3.js", "React"],
      link: "https://github.com/yourusername/defi-platform",
      category: "Blockchain",
      featured: false
    },
    {
      title: "Health & Fitness Tracker",
      description: "A mobile application that tracks workouts, nutrition, and health metrics with personalized recommendations and progress visualization.",
      shortLine: "Smart health and fitness companion.",
      technologies: ["React Native", "Node.js", "MongoDB", "TensorFlow Lite"],
      link: "https://github.com/yourusername/fitness-tracker",
      category: "Mobile Development",
      featured: true
    }
  ];

  // Get categories with counts
  const categoryCount = projects.reduce((acc, project) => {
    acc[project.category] = (acc[project.category] || 0) + 1;
    return acc;
  }, {});
  
  const categories = Object.keys(categoryCount).sort();

  // Filter projects based on selected categories
  const filteredProjects = projects.filter(project => 
    selectedCategories.size === 0 || selectedCategories.has(project.category)
  );

  // Separate featured and other projects
  const featuredProjects = filteredProjects.filter(project => project.featured);
  const otherProjects = filteredProjects.filter(project => !project.featured);
  
  return (
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 max-w-6xl mx-auto`}>
      <Link href="/" className={`${theme.primary} hover:underline mb-4 sm:mb-6 md:mb-8 inline-block text-sm sm:text-base`}>
        ← Back to Home
      </Link>
      <h1 className={`text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 md:mb-8 ${theme.primary}`}>My Projects</h1>
      <p className={`mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base ${theme.foreground}`}>
        Here&apos;s a collection of projects I&apos;ve built that showcase my skills and interests in software development, 
        machine learning, and web technologies.
      </p>
      
      {/* Project categories */}
      <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 md:mb-10">
        <button
          onClick={() => setSelectedCategories(new Set())}
          className={`
            border-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm 
            transition-all duration-300 flex items-center gap-2
            ${selectedCategories.size === 0 
              ? `${theme.name === 'dark' ? 'border-orange-400 bg-orange-400/10' : 'border-green-600 bg-green-600/10'}` 
              : `border-current ${theme.primary} hover:opacity-80`
            }
          `}
        >
          <span>All</span>
          <span className={`
            px-1.5 py-0.5 rounded-full text-xs
            ${selectedCategories.size === 0
              ? theme.name === 'dark' ? 'bg-orange-400/20' : 'bg-green-600/20'
              : theme.name === 'dark' ? 'bg-orange-400/10' : 'bg-green-600/10'
            }
          `}>
            {projects.length}
          </span>
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={`
              border-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm 
              transition-all duration-300 flex items-center gap-2
              ${selectedCategories.has(category)
                ? `${theme.name === 'dark' ? 'border-orange-400 bg-orange-400/10' : 'border-green-600 bg-green-600/10'}`
                : `border-current ${theme.primary} hover:opacity-80`
              }
            `}
          >
            <span>{category}</span>
            <span className={`
              px-1.5 py-0.5 rounded-full text-xs
              ${selectedCategories.has(category)
                ? theme.name === 'dark' ? 'bg-orange-400/20' : 'bg-green-600/20'
                : theme.name === 'dark' ? 'bg-orange-400/10' : 'bg-green-600/10'
              }
            `}>
              {categoryCount[category]}
            </span>
          </button>
        ))}
      </div>
      
      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="mb-8 sm:mb-10 md:mb-12">
          <h2 className={`text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 md:mb-8 ${theme.primary}`}>Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {featuredProjects.map((project, index) => (
              <div
                key={index}
                onClick={() => toggleItem(index)}
                className={`
                  group cursor-pointer rounded-lg
                  ${theme.card} 
                  border-2 border-transparent
                  transition-all duration-300 ease-in-out
                  ${expandedItems.has(index) ? 
                    `transform scale-[1.02] ${theme.name === 'dark' ? 'border-orange-400' : 'border-green-600'}` : 
                    `hover:border-current ${theme.name === 'dark' ? 'hover:border-orange-400/50' : 'hover:border-green-600/50'}`}
                `}
              >
                <div className="p-4 sm:p-5">
                  <h3 className={`text-lg sm:text-xl ${theme.primary} mb-2`}>
                    {project.title}
                  </h3>
                  <p className={`text-sm ${theme.foreground} ${expandedItems.has(index) ? 'mb-4' : 'mb-2'}`}>
                    {project.shortLine}
                  </p>
                  
                  <div className={`
                    overflow-hidden transition-all duration-300
                    ${expandedItems.has(index) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                  `}>
                    <div className="border-t border-current pt-4 mt-4">
                      <p className={`text-sm ${theme.foreground} mb-4`}>
                        {project.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className={`text-xs px-2 py-1 rounded-full border border-current ${theme.primary}`}>
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded-full border border-current ${theme.primary}`}>
                          {project.category}
                        </span>
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`${theme.primary} text-sm hover:underline`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Project →
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className={`
                    mt-2 text-xs ${theme.secondary}
                    transition-opacity duration-300
                    ${expandedItems.has(index) ? 'opacity-0' : 'group-hover:opacity-100'}
                  `}>
                    Click to expand
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Other Projects Section */}
      {otherProjects.length > 0 && (
        <section>
          <h2 className={`text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 md:mb-8 ${theme.primary}`}>
            {featuredProjects.length > 0 ? 'Other Projects' : 'Projects'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {otherProjects.map((project, index) => (
              <div
                key={index}
                onClick={() => toggleItem(index + featuredProjects.length)}
                className={`
                  group cursor-pointer rounded-lg
                  ${theme.card} 
                  border-2 border-transparent
                  transition-all duration-300 ease-in-out
                  ${expandedItems.has(index + featuredProjects.length) ? 
                    `transform scale-[1.02] ${theme.name === 'dark' ? 'border-orange-400' : 'border-green-600'}` : 
                    `hover:border-current ${theme.name === 'dark' ? 'hover:border-orange-400/50' : 'hover:border-green-600/50'}`}
                `}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className={`text-lg sm:text-xl ${theme.primary} mb-2`}>
                        {project.title}
                      </h3>
                      <p className={`text-sm ${theme.foreground} ${expandedItems.has(index + featuredProjects.length) ? 'mb-4' : 'mb-2'}`}>
                        {project.shortLine}
                      </p>
                    </div>

                    <div className={`
                      overflow-hidden transition-all duration-300
                      ${expandedItems.has(index + featuredProjects.length) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100'}
                    `}>
                      <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                        {project.technologies.slice(0, 2).map((tech, techIndex) => (
                          <span key={techIndex} className={`text-xs px-2 py-1 rounded-full border border-current ${theme.primary}`}>
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 2 && (
                          <span className={`text-xs px-2 py-1 rounded-full border border-current ${theme.primary}`}>
                            +{project.technologies.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`
                    overflow-hidden transition-all duration-300
                    ${expandedItems.has(index + featuredProjects.length) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                  `}>
                    <div className="border-t border-current pt-4 mt-4">
                      <p className={`text-sm ${theme.foreground} mb-4`}>
                        {project.description}
                      </p>

                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded-full border border-current ${theme.primary}`}>
                          {project.category}
                        </span>
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`${theme.primary} text-sm hover:underline`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Project →
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className={`
                    mt-2 text-xs ${theme.secondary}
                    transition-opacity duration-300
                    ${expandedItems.has(index + featuredProjects.length) ? 'opacity-0' : 'group-hover:opacity-100'}
                  `}>
                    Click to expand
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* GitHub Stats Section */}
      <section className="mt-8 sm:mt-10 md:mt-12">
        <h2 className={`text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 ${theme.primary}`}>GitHub Activity</h2>
        <div className={`border-2 ${theme.accent} rounded-lg p-4 sm:p-5 md:p-6 ${theme.card}`}>
          <p className={`${theme.foreground} text-sm sm:text-base mb-4 sm:mb-6`}>
            Check out my GitHub profile for more projects and contributions to open-source.
          </p>
          <div className="flex justify-center">
            <a 
              href="https://github.com/yourusername" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`${theme.primary} hover:underline px-4 sm:px-5 py-2 sm:py-3 text-sm sm:text-base border-2 ${theme.accent} rounded-md transition-all hover:shadow-md`}
            >
              View GitHub Profile
            </a>
          </div>
        </div>
      </section>
    </div>
  )
} 