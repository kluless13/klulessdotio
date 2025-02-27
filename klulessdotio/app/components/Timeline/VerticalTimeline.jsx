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
    additionalInfo: "Born in a beautiful spring day, marking the beginning of my adventure in this world. My family was overjoyed to welcome me."
  },
  {
    id: 2,
    date: "2004-09-01",
    title: "Started School",
    description: "Embarked on my educational adventure.",
    additionalInfo: "My first day of school was filled with excitement and nervousness. I made my first friends and discovered my love for learning."
  },
  {
    id: 3,
    date: "2011-06-15",
    title: "First Computer",
    description: "Got my first personal computer and discovered the digital world.",
    additionalInfo: "It was a Windows PC with modest specs, but it opened up a whole new world for me. I spent hours exploring software, games, and eventually started learning basic programming."
  },
  {
    id: 4,
    date: "2017-05-20",
    title: "Graduated High School",
    description: "Completed secondary education and prepared for the next chapter.",
    additionalInfo: "Graduated with honors and received recognition for my achievements in computer science and mathematics. This milestone marked the end of one chapter and the beginning of another."
  },
  {
    id: 5,
    date: "2021-06-10",
    title: "College Graduation",
    description: "Earned my degree and stepped into the professional world.",
    additionalInfo: "Graduated with a degree in Computer Science. My final project focused on web development and artificial intelligence, which helped me secure my first job in the tech industry."
  },
  {
    id: 6,
    date: "2023-03-03",
    title: "Started First Job",
    description: "Began my career in the tech industry.",
    additionalInfo: "Joined a dynamic tech company as a software developer. Working on cutting-edge projects has been both challenging and rewarding, allowing me to grow professionally and expand my skill set."
  },
  {
    id: 7,
    date: "2024-02-25",
    title: "25th Birthday",
    description: "Celebrating a quarter-century of life and looking forward to the future.",
    additionalInfo: "Reflecting on my journey so far and setting new goals for the future. Grateful for all the experiences and people who have shaped my path."
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
    <div className={`container mx-auto px-4 md:px-4 py-8 md:py-8 ${theme.background}`}>
      <div className="relative">
        {/* Central line - updated to be visible in both light and dark modes */}
        <div
          className="absolute left-[4.5rem] sm:left-[4.5rem] md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-orange-400/60"></div>

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