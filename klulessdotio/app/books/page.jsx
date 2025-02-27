"use client";
import Link from "next/link"
import { useTheme } from "../contexts/ThemeContext"
import { useState } from "react"

export default function Books() {
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

  const bookList = [
    {
      title: "The Pragmatic Programmer",
      shortLine: "A classic guide to software craftsmanship.",
      author: "Andrew Hunt & David Thomas",
      description: "A classic guide to software craftsmanship that has helped developers for over 20 years.",
      myTake: "This book fundamentally changed how I approach software development. The concept of 'pragmatic programming' taught me to balance theoretical best practices with practical solutions, making me a more effective developer.",
      category: "Software Development",
    },
    {
      title: "Clean Code",
      shortLine: "The art of writing maintainable code.",
      author: "Robert C. Martin",
      description: "A handbook of agile software craftsmanship that has transformed the way developers think about code quality.",
      myTake: "Uncle Bob's principles of clean code have become my daily mantra. This book taught me that code is read far more often than it's written, and that clarity should always be our primary goal.",
      category: "Software Development",
    },
    {
      title: "Designing Data-Intensive Applications",
      shortLine: "Understanding modern data systems.",
      author: "Martin Kleppmann",
      description: "A deep dive into the principles and practices of building robust, scalable data systems.",
      myTake: "This book opened my eyes to the complexities of distributed systems. It's dense but rewarding, offering practical insights that have helped me make better architectural decisions.",
      category: "System Design",
    },
    {
      title: "Atomic Habits",
      shortLine: "Small changes, remarkable results.",
      author: "James Clear",
      description: "An easy and proven way to build good habits and break bad ones, with practical strategies for everyday life.",
      myTake: "The concept of 1% improvements resonated deeply with me. I've applied these principles not just to coding, but to every aspect of my professional development.",
      category: "Productivity",
    },
    {
      title: "Deep Work",
      shortLine: "Mastering focused work in a distracted world.",
      author: "Cal Newport",
      description: "Rules for focused success in a distracted world, helping you develop the ability to focus without distraction.",
      myTake: "This book transformed my work habits. Newport's strategies for achieving deep focus have been invaluable in tackling complex programming challenges.",
      category: "Productivity",
    },
    {
      title: "Thinking, Fast and Slow",
      shortLine: "Understanding how we think and decide.",
      author: "Daniel Kahneman",
      description: "An exploration of the two systems that drive the way we think and make decisions.",
      myTake: "Kahneman's insights into decision-making biases have made me a better problem solver. It's helped me recognize when to trust my intuition and when to slow down and think systematically.",
      category: "Psychology",
    }
  ];

  // Get categories with counts
  const categoryCount = bookList.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {});
  
  const categories = Object.keys(categoryCount).sort();

  // Filter books based on selected categories
  const filteredBooks = bookList.filter(book => 
    selectedCategories.size === 0 || selectedCategories.has(book.category)
  );

  return (
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 max-w-6xl mx-auto`}>
      <Link href="/" className={`${theme.primary} hover:underline mb-4 sm:mb-6 md:mb-8 inline-block text-sm sm:text-base`}>
        ← Back to Home
      </Link>
      <h1 className={`text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6 md:mb-8 ${theme.primary}`}>Books I Recommend</h1>
      <p className={`mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base ${theme.foreground}`}>
        Reading is a fundamental part of my continuous learning journey. Here are some books that have influenced my thinking.
      </p>
      
      {/* Book categories */}
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
            {bookList.length}
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
      
      {/* Book grid with masonry transition */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 
        ${expandedItems.size > 0 ? 'masonry-auto-rows' : ''}`}>
        {filteredBooks.map((book, index) => (
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
              {/* Initial View */}
              <h3 className={`text-lg sm:text-xl ${theme.primary} mb-2`}>
                {book.title}
              </h3>
              <p className={`text-sm ${theme.foreground} ${expandedItems.has(index) ? 'mb-4' : 'mb-2'}`}>
                {book.shortLine}
              </p>
              
              {/* Expanded Content */}
              <div className={`
                overflow-hidden transition-all duration-300
                ${expandedItems.has(index) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
              `}>
                <div className="border-t border-current pt-4 mt-4">
                  <p className={`text-sm ${theme.secondary} mb-4`}>
                    by {book.author}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className={`text-sm font-medium ${theme.primary} mb-2`}>My Take</h4>
                    <p className={`text-sm ${theme.foreground}`}>
                      {book.myTake}
                    </p>
                  </div>

                  <span className={`
                    inline-block text-xs px-2 py-1 
                    border border-current rounded-full 
                    ${theme.primary}
                  `}>
                    {book.category}
                  </span>
                </div>
              </div>

              {/* Expand Hint */}
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
    </div>
  )
} 