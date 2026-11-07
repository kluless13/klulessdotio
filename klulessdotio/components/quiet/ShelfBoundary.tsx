"use client"

import { Component, type ReactNode } from "react"

export const SHELF_ERROR = "The bookshelf couldn't load. Please reload the page and try again."

/** If the shelf's code can't load, say so here and leave the rest of Quiet working. */
export class ShelfBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    console.error("Bookshelf failed to load", error)
  }

  render() {
    return this.state.failed ? <p className="shelf-error" role="alert">{SHELF_ERROR}</p> : this.props.children
  }
}
