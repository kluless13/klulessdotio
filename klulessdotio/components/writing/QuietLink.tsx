"use client"

import type { MouseEvent } from "react"
import { writeMode } from "@/lib/mode"

function browserStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Quiet lives on the home page, so this remembers the choice and then goes there with a full load. */
export function QuietLink() {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    writeMode(browserStorage(), "quiet")
    window.location.assign("/")
  }
  return (
    <a className="btn" href="/" onClick={onClick}>
      Quiet
    </a>
  )
}
