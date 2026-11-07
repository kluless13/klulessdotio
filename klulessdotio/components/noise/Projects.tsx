"use client"

import { ArrowUpRight } from "lucide-react"
import { useState } from "react"
import { PROJECTS, type Project } from "@/lib/content"

/** Descriptions appear on hover, or on tap on touch screens. The name, badge and arrow are links. */
function ProjectRow({ project }: { project: Project }) {
  const [tapped, setTapped] = useState(false)
  const onTap = (event: React.MouseEvent) => {
    if (!(event.target as Element).closest("a")) setTapped((value) => !value)
  }
  return (
    <div className={`row project ${tapped ? "project-open" : ""}`} onClick={onTap}>
      <div className="project-head">
        <a className="project-name" href={project.href} target="_blank" rel="noopener noreferrer">
          {project.name}
        </a>
        {project.badge ? (
          <a className="badge" href={project.badge.href} target="_blank" rel="noopener noreferrer">
            {project.badge.text}
          </a>
        ) : null}
        <a className="project-arrow" href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name}`}>
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <div className="project-text">
        <p className="row-text">{project.text}</p>
      </div>
    </div>
  )
}

export function Projects() {
  return (
    <section className="block" aria-labelledby="made">
      <h2 className="label" id="made">Things I've made</h2>
      {PROJECTS.map((project) => (
        <ProjectRow key={project.name} project={project} />
      ))}
    </section>
  )
}
