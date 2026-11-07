import { ArrowUpRight } from "lucide-react"
import { PROJECTS } from "@/lib/content"

export function Projects() {
  return (
    <section className="block" aria-labelledby="made">
      <h2 className="label" id="made">Things I've made</h2>
      {PROJECTS.map((project) => (
        <div className="row project" key={project.name}>
          <div className="project-head">
            <a className="project-name" href={project.href} target="_blank" rel="noopener noreferrer">
              {project.name}
            </a>
            {project.badge ? (
              <a className="badge" href={project.badge.href} target="_blank" rel="noopener noreferrer">
                {project.badge.text}
              </a>
            ) : null}
            <ArrowUpRight className="project-arrow" size={16} aria-hidden="true" />
          </div>
          <div className="project-text">
            <p className="row-text">{project.text}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
