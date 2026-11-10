"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { ArrowUp, ChevronRight, CornerDownLeft, Download, Pause, Play, Plus } from "lucide-react"

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
  /** Makes the live element a switch with this checked value. */
  checked?: boolean
  /** Sets aria-pressed on the live element. */
  toggled?: boolean
  onClick?: () => void
  pressedMarker?: boolean
  children?: ReactNode
}

// Only the live exhibit is a real button. Tiles and list rows are buttons themselves, and the
// state row sits beside the live one, so every other state is a span: a button in a button is invalid HTML.
function Part({ live, className, label, checked, toggled, onClick, pressedMarker, children }: PartProps) {
  const classes = className === "btn lx-mine" ? className : `lx-b${className ? ` ${className}` : ""}`
  const marker = pressedMarker ? "true" : undefined
  if (!live) return <span className={classes}>{children}</span>
  return (
    <button
      type="button"
      className={classes}
      aria-label={label}
      role={checked === undefined ? undefined : "switch"}
      aria-checked={checked}
      aria-pressed={toggled}
      data-pressed={marker}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// Stateful exhibits. Each holds its own small state; forced states never mount handlers (live is false).

function GelSwitch({ live }: { live: boolean }) {
  const [on, setOn] = useState(true)
  return (
    <Part live={live} className={`lx-gel${on ? "" : " lx-gel-off"}`} label="Switch" checked={on} onClick={() => setOn((v) => !v)}>
      <span className="lx-gel-label">{on ? "ON" : "OFF"}</span>
      <span className="lx-gel-knob" />
    </Part>
  )
}

const SEGMENTS = ["Day", "Week", "Month"] as const

function Segmented({ live }: { live: boolean }) {
  const [selected, setSelected] = useState(1)
  if (!live) {
    return (
      <div className="lx-segmented">
        {SEGMENTS.map((name, i) => (
          <Part key={name} live={false} className={i === 1 ? "lx-on" : undefined}>
            {name}
          </Part>
        ))}
      </div>
    )
  }
  return (
    <div className="lx-segmented" role="group" aria-label="Range" style={{ "--lx-i": selected } as CSSProperties}>
      <span className="lx-seg-thumb" aria-hidden="true" />
      {SEGMENTS.map((name, i) => (
        <Part key={name} live className={i === selected ? "lx-sel" : undefined} toggled={i === selected} onClick={() => setSelected(i)}>
          {name}
        </Part>
      ))}
    </div>
  )
}

const KEY_PRESS_MS = 150
type KeyName = "meta" | "k"

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
}

function Keycaps({ live }: { live: boolean }) {
  const [down, setDown] = useState<ReadonlySet<KeyName>>(new Set())
  const timers = useRef<Partial<Record<KeyName, ReturnType<typeof setTimeout>>>>({})

  const press = (key: KeyName) => {
    clearTimeout(timers.current[key])
    setDown((prev) => new Set(prev).add(key))
    timers.current[key] = setTimeout(() => {
      setDown((prev) => new Set([...prev].filter((k) => k !== key)))
    }, KEY_PRESS_MS)
  }
  const pressRef = useRef(press)
  pressRef.current = press

  useEffect(() => {
    if (!live) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return
      if (event.metaKey || event.key === "Meta") pressRef.current("meta")
      if (event.key === "k" || event.key === "K") pressRef.current("k")
    }
    window.addEventListener("keydown", onKeyDown)
    const pending = timers.current
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      Object.values(pending).forEach((t) => clearTimeout(t))
    }
  }, [live])

  return (
    <div className="lx-keys">
      <Part live={live} className="lx-keycap" pressedMarker={down.has("meta")} onClick={() => press("meta")}>
        ⌘
      </Part>
      <Part live={live} className="lx-keycap" pressedMarker={down.has("k")} onClick={() => press("k")}>
        K
      </Part>
    </div>
  )
}

function FloatingAction({ live }: { live: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <Part live={live} className={`lx-fab${open ? " lx-fab-open" : ""}`} label={open ? "Close" : "Add"} toggled={live ? open : undefined} onClick={() => setOpen((v) => !v)}>
      <Plus size={24} aria-hidden="true" />
    </Part>
  )
}

function GlossyDownload({ live }: { live: boolean }) {
  const [plays, setPlays] = useState(0)
  return (
    <Part live={live} className="lx-download" onClick={() => setPlays((n) => n + 1)}>
      {/* a new key remounts the icon, which replays its one bounce */}
      <span key={plays} className={plays > 0 ? "lx-dl-icon lx-bounce" : "lx-dl-icon"}>
        <Download size={22} aria-hidden="true" />
      </span>
      <span>
        <b>Download</b>
        <small>Free, for Mac</small>
      </span>
    </Part>
  )
}

function PlayToggle({ live, className, size, label }: { live: boolean; className: string; size: number; label: string }) {
  const [playing, setPlaying] = useState(false)
  const Icon = playing ? Pause : Play
  return (
    <Part live={live} className={className} toggled={live ? playing : undefined} onClick={() => setPlaying((v) => !v)}>
      <Icon size={size} aria-hidden="true" /> {label}
    </Part>
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
  keycaps: framed((live) => <Keycaps live={live} />),
  segmented: framed((live) => <Segmented live={live} />),

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

  "glossy-download": framed((live) => <GlossyDownload live={live} />),
  "bootstrap-2": framed((live) => <Part live={live} className="lx-bootstrap2">Sign up</Part>),
  "gel-switch": framed((live) => <GelSwitch live={live} />),
  "glossy-bar-button": framed((live) => <Part live={live} className="lx-bar">Edit</Part>),

  "text-button": framed((live) => <Part live={live} className="lx-text">Done</Part>),
  raised: framed((live) => <Part live={live} className="lx-raised">Button</Part>),
  "floating-action": framed((live) => <FloatingAction live={live} />),

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
      <PlayToggle live={live} className="lx-neu" size={16} label="Play" />
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
      <PlayToggle live={live} className="lx-liquid" size={15} label="Listen" />
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
