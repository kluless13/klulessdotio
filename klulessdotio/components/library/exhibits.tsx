import type { CSSProperties, ReactNode } from "react"
import { ArrowUp, ChevronRight, CornerDownLeft, Download, Play, Plus } from "lucide-react"

export type ExhibitState = "live" | "mirror" | "rest" | "hover" | "pressed"

export interface ExhibitProps {
  state?: ExhibitState
  scale?: number
}

type Maker = (props: ExhibitProps) => JSX.Element

function Frame({ state = "live", scale = 1, children }: ExhibitProps & { children: ReactNode }) {
  const style: CSSProperties | undefined = scale === 1 ? undefined : { transform: `scale(${scale})` }
  return (
    <div className="lx" data-state={state} style={style}>
      {children}
    </div>
  )
}

function Surface({ kind, children }: { kind: "neu" | "clay" | "glass" | "liquid"; children: ReactNode }) {
  return <div className={`lx-surface lx-surface-${kind}`}>{children}</div>
}

const Btn = ({ className, children }: { className?: string; children?: ReactNode }) => (
  <button type="button" className={className}>
    {children}
  </button>
)

const framed =
  (render: () => ReactNode): Maker =>
  (props) => <Frame {...props}>{render()}</Frame>

export const EXHIBITS: Record<string, Maker> = {
  weighted: framed(() => (
    <Btn className="lx-weighted">
      Search <CornerDownLeft size={17} aria-hidden="true" />
    </Btn>
  )),
  "weighted-light": framed(() => (
    <Btn className="lx-weighted-light">
      Cancel <kbd>esc</kbd>
    </Btn>
  )),
  "weighted-dark": framed(() => (
    <Btn className="lx-weighted-dark">
      Continue <CornerDownLeft size={16} aria-hidden="true" />
    </Btn>
  )),
  "weighted-icon": framed(() => (
    <button type="button" className="lx-weighted-icon" aria-label="Send">
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  )),
  keycaps: framed(() => (
    <div className="lx-keys">
      <Btn className="lx-keycap">⌘</Btn>
      <Btn className="lx-keycap">K</Btn>
    </div>
  )),
  segmented: framed(() => (
    <div className="lx-segmented" role="group" aria-label="Range">
      <Btn>Day</Btn>
      <Btn className="lx-on">Week</Btn>
      <Btn>Month</Btn>
    </div>
  )),

  platinum: framed(() => (
    <span className="lx-platinum-ring">
      <Btn className="lx-platinum">OK</Btn>
    </span>
  )),
  bevel: framed(() => <Btn className="lx-bevel">Apply</Btn>),
  luna: framed(() => <Btn className="lx-luna">OK</Btn>),
  "luna-start": framed(() => (
    <Btn className="lx-luna-start">
      <span className="lx-flag" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      start
    </Btn>
  )),
  aero: framed(() => <Btn className="lx-aero">Next</Btn>),
  aqua: framed(() => <Btn className="lx-aqua">Continue</Btn>),
  "aqua-graphite": framed(() => <Btn className="lx-aqua-graphite">Cancel</Btn>),
  "aqua-help": framed(() => (
    <button type="button" className="lx-aqua-help" aria-label="Help">
      ?
    </button>
  )),
  "traffic-lights": framed(() => (
    <div className="lx-lights">
      <button type="button" className="lx-light" aria-label="Close" />
      <button type="button" className="lx-light lx-yellow" aria-label="Minimise" />
      <button type="button" className="lx-light lx-green" aria-label="Zoom" />
    </div>
  )),

  "glossy-download": framed(() => (
    <Btn className="lx-download">
      <Download size={22} aria-hidden="true" />
      <span>
        <b>Download</b>
        <small>Free, for Mac</small>
      </span>
    </Btn>
  )),
  "bootstrap-2": framed(() => <Btn className="lx-bootstrap2">Sign up</Btn>),
  "gel-switch": framed(() => (
    <button type="button" role="switch" aria-checked="true" aria-label="Switch" className="lx-gel">
      <span>ON</span>
      <span className="lx-gel-knob" />
    </button>
  )),
  "glossy-bar-button": framed(() => <Btn className="lx-bar">Edit</Btn>),

  "text-button": framed(() => <Btn className="lx-text">Done</Btn>),
  raised: framed(() => <Btn className="lx-raised">Button</Btn>),
  "floating-action": framed(() => (
    <button type="button" className="lx-fab" aria-label="Add">
      <Plus size={24} aria-hidden="true" />
    </button>
  )),

  "shadcn-ui": framed(() => (
    <div className="lx-shadcn">
      <Btn className="lx-shadcn-default">Default</Btn>
      <Btn className="lx-shadcn-secondary">Secondary</Btn>
      <Btn className="lx-shadcn-outline">Outline</Btn>
      <Btn className="lx-shadcn-ghost">Ghost</Btn>
    </div>
  )),
  "primer-green": framed(() => <Btn className="lx-primer">Create repository</Btn>),
  "blue-pill": framed(() => <Btn className="lx-blue-pill">Buy</Btn>),
  "purple-pill": framed(() => (
    <Btn className="lx-purple-pill">
      Start now <ChevronRight size={14} aria-hidden="true" />
    </Btn>
  )),
  "neo-brutalist": framed(() => <Btn className="lx-brutalist">Buy now</Btn>),

  neumorphic: framed(() => (
    <Surface kind="neu">
      <Btn className="lx-neu">
        <Play size={16} aria-hidden="true" /> Play
      </Btn>
    </Surface>
  )),
  clay: framed(() => (
    <Surface kind="clay">
      <Btn className="lx-clay">Let’s go</Btn>
    </Surface>
  )),
  "frosted-glass": framed(() => (
    <Surface kind="glass">
      <Btn className="lx-glass">Join the list</Btn>
    </Surface>
  )),
  "liquid-glass": framed(() => (
    <Surface kind="liquid">
      <Btn className="lx-liquid">
        <Play size={15} aria-hidden="true" /> Listen
      </Btn>
    </Surface>
  )),

  // The site's real button: same markup and classes as everywhere else, so it follows the tone.
  mine: framed(() => (
    <button type="button" className="btn lx-mine">
      Say hello
    </button>
  )),
}

export function Exhibit({ slug, state, scale }: { slug: string } & ExhibitProps): JSX.Element {
  const make = Object.hasOwn(EXHIBITS, slug) ? EXHIBITS[slug] : undefined
  if (!make) throw new Error(`Unknown library exhibit: ${slug}`)
  return make({ state, scale })
}
