"use client";
import Link from "next/link"
import { useTheme } from "../contexts/ThemeContext"

export default function Books() {
  const { theme } = useTheme();

  const bookList = [
    {
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt & David Thomas",
      description: "A classic guide to software craftsmanship that has helped developers for over 20 years.",
      category: "Software Development",
      rating: 5,
      coverColor: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      description: "A handbook of agile software craftsmanship that has transformed the way developers think about code quality.",
      category: "Software Development",
      rating: 5,
      coverColor: "bg-red-100 dark:bg-red-900"
    },
    {
      title: "Designing Data-Intensive Applications",
      author: "Martin Kleppmann",
      description: "A deep dive into the principles and practices of building robust, scalable data systems.",
      category: "System Design",
      rating: 5,
      coverColor: "bg-green-100 dark:bg-green-900"
    },
    {
      title: "Atomic Habits",
      author: "James Clear",
      description: "An easy and proven way to build good habits and break bad ones, with practical strategies for everyday life.",
      category: "Productivity",
      rating: 4,
      coverColor: "bg-yellow-100 dark:bg-yellow-900"
    },
    {
      title: "Deep Work",
      author: "Cal Newport",
      description: "Rules for focused success in a distracted world, helping you develop the ability to focus without distraction.",
      category: "Productivity",
      rating: 4,
      coverColor: "bg-purple-100 dark:bg-purple-900"
    },
    {
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      description: "An exploration of the two systems that drive the way we think and make decisions.",
      category: "Psychology",
      rating: 5,
      coverColor: "bg-indigo-100 dark:bg-indigo-900"
    }
  ];

  return (
    <div className={`min-h-screen p-8 max-w-4xl mx-auto`}>
      <Link href="/" className={`${theme.primary} hover:underline mb-6 inline-block`}>
        ← Back to Home
      </Link>
      <h1 className={`text-4xl font-bold mb-6 ${theme.primary}`}>Books I Recommend</h1>
      <p className={`mb-8 ${theme.foreground}`}>
        Reading is a fundamental part of my continuous learning journey. Here are some books that have significantly influenced my thinking and approach to technology, productivity, and life.
      </p>
      
      {/* Book categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className={`border border-current ${theme.primary} px-3 py-1 rounded-full text-sm cursor-pointer hover:opacity-80`}>All</span>
        <span className={`border border-current ${theme.primary} px-3 py-1 rounded-full text-sm cursor-pointer hover:opacity-80`}>Software Development</span>
        <span className={`border border-current ${theme.primary} px-3 py-1 rounded-full text-sm cursor-pointer hover:opacity-80`}>System Design</span>
        <span className={`border border-current ${theme.primary} px-3 py-1 rounded-full text-sm cursor-pointer hover:opacity-80`}>Productivity</span>
      </div>
      
      {/* Book list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookList.map((book, index) => (
          <div key={index} className={`border ${theme.accent} rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${theme.card}`}>
            <div className={`h-40 ${book.coverColor} flex items-center justify-center p-4`}>
              <span className={`text-xl font-bold ${theme.name === 'dark' ? 'text-white' : 'text-gray-800'} text-center`}>{book.title}</span>
            </div>
            <div className="p-4">
              <h3 className={`font-semibold mb-1 ${theme.primary}`}>{book.title}</h3>
              <p className={`text-sm mb-2 ${theme.foreground} opacity-80`}>by {book.author}</p>
              <p className={`text-sm mb-3 ${theme.foreground}`}>{book.description}</p>
              <div className="flex justify-between items-center">
                <span className={`text-xs px-2 py-1 rounded-full border border-current ${theme.primary}`}>{book.category}</span>
                <div className="flex">
                  {[...Array(book.rating)].map((_, i) => (
                    <span key={i} className={`${theme.primary}`}>★</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 