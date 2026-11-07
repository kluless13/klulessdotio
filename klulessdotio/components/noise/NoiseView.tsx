"use client"

import { Greeting } from "@/components/Greeting"
import { TruflationLogo, TrufonomicsLogo } from "@/components/Logos"
import { Activity } from "@/components/noise/Activity"
import { PageBottom } from "@/components/noise/PageBottom"
import { Projects } from "@/components/noise/Projects"
import { Row } from "@/components/noise/Row"
import { SayHello } from "@/components/noise/SayHello"
import { Timeline } from "@/components/noise/Timeline"
import { BELIEFS, BUILD, MY_DAYS, ORIGIN } from "@/lib/content"
import { ArrowRight } from "lucide-react"

export function NoiseView({ onPosters, onQuiet }: { onPosters: () => void; onQuiet: () => void }) {
  return (
    <div className="noise">
      <header className="site-header">
        <span className="site-name">Angad Maniyambath</span>
        <button type="button" className="btn" onClick={onQuiet}>
          Quiet
        </button>
      </header>
      <main className="column">
        <Greeting className="greeting-page" />
        <section className="block" aria-labelledby="believe">
          <h2 className="label" id="believe">What I believe</h2>
          {BELIEFS.map((line) => (
            <p className="lead" key={line}>{line}</p>
          ))}
          <p className="small">{ORIGIN}</p>
        </section>
        <section className="block" aria-labelledby="do">
          <h2 className="label" id="do">What I do</h2>
          <p className="lead">
            Now I'm Head of AI at <TruflationLogo /> Truflation, building Truman, an agent built for macro. I ended up here after Truflation acquired <TrufonomicsLogo /> Trufonomics, the company I founded solo.
          </p>
          <p className="small">{MY_DAYS}</p>
          <div className="actions">
            <SayHello />
            <button type="button" className="btn" onClick={onPosters} data-testid="open-posters">
              Flick through my posters <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        </section>
        <section className="block" aria-labelledby="build">
          <h2 className="label" id="build">What I can build</h2>
          {BUILD.map((item) => (
            <Row key={item.name} title={item.name}>
              <p className="row-text">{item.text}</p>
            </Row>
          ))}
        </section>
        <Projects />
        <Activity />
        <Timeline />
        <footer className="foot">© {new Date().getFullYear()} Angad Maniyambath</footer>
      </main>
      <PageBottom />
    </div>
  )
}
