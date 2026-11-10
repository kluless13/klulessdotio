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

interface PartProps {
  live: boolean
  className?: string
  label?: string
  switchOn?: boolean
  children?: ReactNode
}

// Only the live exhibit is a real button. Tiles and list rows are buttons themselves, and the
// state row sits beside the live one, so every other state is a span: a button in a button is invalid HTML.
function Part({ live, className, label, switchOn, children }: PartProps) {
  const classes = className === "btn lx-mine" ? className : `lx-b${className ? ` ${className}` : ""}`
  if (!live) return <span className={classes}>{children}</span>
  return (
    <button type="button" className={classes} aria-label={label} role={switchOn ? "switch" : undefined} aria-checked={switchOn ? true : undefined}>
      {children}
    </button>
  )
}

const framed =
  (render: (live: boolean) => ReactNode): Maker =>
  (props) => <Frame {...props}>{render((props.state ?? "live") === "live")}</Frame>

export const EXHIBITS: Record<string, Maker> = {
  weighted: framed((live) => (
    <Part live={live} className="lx-weighted">
      Search <CornerDownLeft size={17} aria-hidden="true" />
    </Part>
  )),
  "weighted-light": framed((live) => (
    <Part live={live} className="lx-weighted-light">
      Cancel <kbd>esc</kbd>
    </Part>
  )),
  "weighted-dark": framed((live) => (
    <Part live={live} className="lx-weighted-dark">
      Continue <CornerDownLeft size={16} aria-hidden="true" />
    </Part>
  )),
  "weighted-icon": framed((live) => (
    <Part live={live} className="lx-weighted-icon" label="Send">
      <ArrowUp size={20} aria-hidden="true" />
    </Part>
  )),
  keycaps: framed((live) => (
    <div className="lx-keys">
      <Part live={live} className="lx-keycap">⌘</Part>
      <Part live={live} className="lx-keycap">K</Part>
    </div>
  )),
  segmented: framed((live) => (
    <div className="lx-segmented" role={live ? "group" : undefined} aria-label={live ? "Range" : undefined}>
      <Part live={live}>Day</Part>
      <Part live={live} className="lx-on">Week</Part>
      <Part live={live}>Month</Part>
    </div>
  )),

  platinum: framed((live) => (
    <span className="lx-platinum-ring">
      <Part live={live} className="lx-platinum">OK</Part>
    </span>
  )),
  bevel: framed((live) => <Part live={live} className="lx-bevel">Apply</Part>),
  luna: framed((live) => <Part live={live} className="lx-luna">OK</Part>),
  "luna-start": framed((live) => (
    <Part live={live} className="lx-luna-start">
      <span className="lx-flag" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      start
    </Part>
  )),
  aero: framed((live) => <Part live={live} className="lx-aero">Next</Part>),
  aqua: framed((live) => <Part live={live} className="lx-aqua">Continue</Part>),
  "aqua-graphite": framed((live) => <Part live={live} className="lx-aqua-graphite">Cancel</Part>),
  "aqua-help": framed((live) => (
    <Part live={live} className="lx-aqua-help" label="Help">
      ?
    </Part>
  )),
  "traffic-lights": framed((live) => (
    <div className="lx-lights">
      <Part live={live} className="lx-light" label="Close" />
      <Part live={live} className="lx-light lx-yellow" label="Minimise" />
      <Part live={live} className="lx-light lx-green" label="Zoom" />
    </div>
  )),

  "glossy-download": framed((live) => (
    <Part live={live} className="lx-download">
      <Download size={22} aria-hidden="true" />
      <span>
        <b>Download</b>
        <small>Free, for Mac</small>
      </span>
    </Part>
  )),
  "bootstrap-2": framed((live) => <Part live={live} className="lx-bootstrap2">Sign up</Part>),
  "gel-switch": framed((live) => (
    <Part live={live} className="lx-gel" label="Switch" switchOn>
      <span>ON</span>
      <span className="lx-gel-knob" />
    </Part>
  )),
  "glossy-bar-button": framed((live) => <Part live={live} className="lx-bar">Edit</Part>),

  "text-button": framed((live) => <Part live={live} className="lx-text">Done</Part>),
  raised: framed((live) => <Part live={live} className="lx-raised">Button</Part>),
  "floating-action": framed((live) => (
    <Part live={live} className="lx-fab" label="Add">
      <Plus size={24} aria-hidden="true" />
    </Part>
  )),

  "shadcn-ui": framed((live) => (
    <div className="lx-shadcn">
      <Part live={live} className="lx-shadcn-default">Default</Part>
      <Part live={live} className="lx-shadcn-secondary">Secondary</Part>
      <Part live={live} className="lx-shadcn-outline">Outline</Part>
      <Part live={live} className="lx-shadcn-ghost">Ghost</Part>
    </div>
  )),
  "primer-green": framed((live) => <Part live={live} className="lx-primer">Create repository</Part>),
  "blue-pill": framed((live) => <Part live={live} className="lx-blue-pill">Buy</Part>),
  "purple-pill": framed((live) => (
    <Part live={live} className="lx-purple-pill">
      Start now <ChevronRight size={14} aria-hidden="true" />
    </Part>
  )),
  "neo-brutalist": framed((live) => <Part live={live} className="lx-brutalist">Buy now</Part>),

  neumorphic: framed((live) => (
    <Surface kind="neu">
      <Part live={live} className="lx-neu">
        <Play size={16} aria-hidden="true" /> Play
      </Part>
    </Surface>
  )),
  clay: framed((live) => (
    <Surface kind="clay">
      <Part live={live} className="lx-clay">Let’s go</Part>
    </Surface>
  )),
  "frosted-glass": framed((live) => (
    <Surface kind="glass">
      <Part live={live} className="lx-glass">Join the list</Part>
    </Surface>
  )),
  "liquid-glass": framed((live) => (
    <Surface kind="liquid">
      <Part live={live} className="lx-liquid">
        <Play size={15} aria-hidden="true" /> Listen
      </Part>
    </Surface>
  )),

  // The site's real button: same classes as everywhere else, so it follows the tone.
  mine: framed((live) => (
    <Part live={live} className="btn lx-mine">
      Say hello
    </Part>
  )),
}

export function Exhibit({ slug, state, scale }: { slug: string } & ExhibitProps): JSX.Element {
  const make = Object.hasOwn(EXHIBITS, slug) ? EXHIBITS[slug] : undefined
  if (!make) throw new Error(`Unknown library exhibit: ${slug}`)
  return make({ state, scale })
}
