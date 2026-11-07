import { TruflationLogo, TrufonomicsLogo } from "@/components/Logos"
import { Row } from "@/components/noise/Row"
import { HISTORY_LINE, TIMELINE } from "@/lib/content"

export function Timeline() {
  return (
    <section className="timeline-block">
      <Row title="How I got here" subtitle={HISTORY_LINE}>
        <ol className="timeline">
          {TIMELINE.map((entry) => (
            <li key={`${entry.when}-${entry.what}`}>
              <span className="when">{entry.when}</span>
              <span className="what">
                {entry.logo === "truflation" ? <TruflationLogo /> : null}
                {entry.logo === "trufonomics" ? <TrufonomicsLogo /> : null}
                {entry.what}
              </span>
              {entry.text ? <span className="what-text">{entry.text}</span> : null}
            </li>
          ))}
        </ol>
      </Row>
    </section>
  )
}
