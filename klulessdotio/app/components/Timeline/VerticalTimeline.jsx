"use client";
import { useEffect, useRef, useState } from "react"
import { TimelineItem } from "./TimelineItem"
import { useTheme } from "../../contexts/ThemeContext"

const personalEvents = [
  {
    id: 1,
    date: "1999-03-03",
    title: "Born",
    description: "Entered the world and began my journey.",
  },
  {
    id: 2,
    date: "2004-09-01",
    title: "Started School",
    description: "Embarked on my educational adventure.",
  },
  {
    id: 3,
    date: "2011-06-15",
    title: "First Computer",
    description: "Got my first personal computer and discovered the digital world.",
  },
  {
    id: 4,
    date: "2017-05-20",
    title: "Graduated High School",
    description: "Completed secondary education and prepared for the next chapter.",
  },
  {
    id: 5,
    date: "2021-06-10",
    title: "College Graduation",
    description: "Earned my degree and stepped into the professional world.",
  },
  {
    id: 6,
    date: "2023-03-03",
    title: "Started First Job",
    description: "Began my career in the tech industry.",
  },
  {
    id: 7,
    date: "2024-02-25",
    title: "25th Birthday",
    description: "Celebrating a quarter-century of life and looking forward to the future.",
  },
]

export const VerticalTimeline = () => {
  const [visibleItems, setVisibleItems] = useState(new Set())
  const observerRef = useRef(null)
  const { theme } = useTheme();

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const itemId = Number(entry.target.id)
        setVisibleItems((prev) => {
          const newSet = new Set(prev)
          if (entry.isIntersecting) {
            newSet.add(itemId)
          } else {
            newSet.delete(itemId)
          }
          return newSet
        })
      })
    }, { threshold: 0.5 })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    };
  }, [])

  return (
    <div className={`container mx-auto px-4 py-8 ${theme.background}`}>
      <div className="relative">
        {/* Central line - updated to be visible in both light and dark modes */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-orange-400/60"></div>

        {/* Timeline items */}
        {personalEvents
          .slice()
          .reverse()
          .map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              isLeft={index % 2 === 0}
              isVisible={visibleItems.has(event.id)}
              observerRef={observerRef}
              isRecent={index === 0} />
          ))}
      </div>
    </div>
  );
} 