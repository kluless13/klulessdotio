"use client"

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react"
import { ChevronRightIcon, CloseIcon, MenuIcon } from "./icons"
import { ListCta } from "./ListCta"
import { scrollBehaviour, trapFocus, useScrollLock } from "./hooks"

export const NAV_LINKS = [
  { id: "how-it-works", label: "How it works" },
  { id: "account-sizes", label: "Account sizes" },
  { id: "drawdown", label: "Drawdown" },
  { id: "dr-caroline", label: "Dr Caroline" },
  { id: "community", label: "Community" },
] as const

type SectionId = (typeof NAV_LINKS)[number]["id"]

/** Which section the reader is in: the one crossing the middle of the screen, or none between and after them */
function useCurrentSection(): SectionId | null {
  const [current, setCurrent] = useState<SectionId | null>(null)
  useEffect(() => {
    const targets = NAV_LINKS.map((link) => document.getElementById(link.id)).filter((el): el is HTMLElement => el !== null)
    let inView: ReadonlySet<string> = new Set()
    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.reduce<ReadonlySet<string>>((ids, entry) => {
          const next = new Set(ids)
          if (entry.isIntersecting) next.add(entry.target.id)
          else next.delete(entry.target.id)
          return next
        }, inView)
        setCurrent(NAV_LINKS.find((link) => inView.has(link.id))?.id ?? null)
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])
  return current
}

function useScrolledPast(offset: number): boolean {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const update = () => setPast(window.scrollY > offset)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [offset])
  return past
}

/** Roughly where the hero card ends: past it the pinned nav needs a stronger shadow over light sections */
const PAST_HERO_PX = 560

/** Scrolls to a section and moves focus there, so keyboard and screen reader users land where they asked */
function goToSection(sectionId: string): void {
  const target = document.getElementById(sectionId)
  if (!target) return
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1")
  target.focus({ preventScroll: true })
  target.scrollIntoView({ behavior: scrollBehaviour() })
}

export function Nav() {
  const current = useCurrentSection()
  const scrolled = useScrolledPast(PAST_HERO_PX)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  /** Closing returns focus to the Menu button, or takes the reader to the section they chose */
  const closeMenu = useCallback((sectionId: string | null) => {
    setMenuOpen(false)
    window.setTimeout(() => (sectionId ? goToSection(sectionId) : menuButtonRef.current?.focus()), 0)
  }, [])

  return (
    <header className="kt-header" data-scrolled={scrolled ? "" : undefined}>
      <nav className="kt-nav" aria-label="KalibreTrades">
        <a href="#top" className="kt-wordmark">
          <span className="kt-wordmark-dot" aria-hidden="true" />
          KalibreTrades
        </a>
        <ul className="kt-nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a href={`#${link.id}`} className="kt-nav-link" aria-current={current === link.id ? "true" : undefined}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <ListCta className="kt-btn--navy kt-nav-cta" doneClassName="kt-nav-cta" />
        <button
          type="button"
          ref={menuButtonRef}
          className="kt-btn kt-btn--navy kt-menu-btn"
          aria-expanded={menuOpen}
          aria-controls="kt-mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          <MenuIcon /> Menu
        </button>
      </nav>
      {menuOpen ? <MobileMenu current={current} onClose={closeMenu} /> : null}
    </header>
  )
}

type MobileMenuProps = {
  readonly current: SectionId | null
  readonly onClose: (sectionId: string | null) => void
}

/** Adds one history entry while the menu is open, so the phone's back gesture closes it instead of leaving the page */
function useBackCloses(onBack: () => void): void {
  useEffect(() => {
    // StrictMode runs effects twice in development: only ever add one entry
    if (!window.history.state?.ktMenu) window.history.pushState({ ...window.history.state, ktMenu: true }, "")
    window.addEventListener("popstate", onBack)
    return () => window.removeEventListener("popstate", onBack)
  }, [onBack])
}

function MobileMenu({ current, onClose }: MobileMenuProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const chosen = useRef<string | null>(null)
  const onBack = useCallback(() => onClose(chosen.current), [onClose])
  useScrollLock()
  useBackCloses(onBack)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  /** Closing by button or link also drops the history entry the menu added, so back still leaves the page */
  const close = (sectionId: string | null) => {
    chosen.current = sectionId
    if (window.history.state?.ktMenu) window.history.back()
    else onClose(sectionId)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") close(null)
    else trapFocus(event, sheetRef.current)
  }

  const linkTo = (sectionId: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    close(sectionId)
  }

  return (
    <div className="kt-sheet-backdrop" onPointerDown={(event) => event.target === event.currentTarget && close(null)}>
      <div className="kt-sheet" id="kt-mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" ref={sheetRef} onKeyDown={onKeyDown}>
        <div className="kt-sheet-head">
          <span className="kt-wordmark">
            <span className="kt-wordmark-dot" aria-hidden="true" />
            KalibreTrades
          </span>
          <button type="button" className="kt-icon-btn kt-icon-btn--lg" aria-label="Close menu" ref={closeRef} onClick={() => close(null)}>
            <CloseIcon />
          </button>
        </div>
        <ul className="kt-sheet-links">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a href={`#${link.id}`} className="kt-sheet-link" aria-current={current === link.id ? "true" : undefined} onClick={linkTo(link.id)}>
                {link.label}
                <ChevronRightIcon />
              </a>
            </li>
          ))}
        </ul>
        <div className="kt-sheet-foot">
          <ListCta className="kt-btn--gold kt-btn--block" doneClassName="kt-btn--block" onNavigate={linkTo("register")} />
          <a href="mailto:hello@kalibretrades.com" className="kt-sheet-mail">
            hello@kalibretrades.com
          </a>
        </div>
      </div>
    </div>
  )
}
