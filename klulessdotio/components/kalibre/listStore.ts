"use client"

import { useSyncExternalStore } from "react"

/** Who joined the list in this visit. Shared by both forms and every "get priority access" button, so one sign-up updates the whole page. */
export interface ListEntry {
  readonly firstName: string
  readonly email: string
  /** "already" when the address had signed up before, so no confirmation was sent this time */
  readonly outcome: "added" | "already"
}

type Listener = () => void

let entry: ListEntry | null = null
let listeners: readonly Listener[] = []

const notify = () => listeners.forEach((listener) => listener())

/** The first sign-up wins: a second form finishing later leaves it alone */
export function joinList(next: ListEntry): boolean {
  if (entry) return false
  entry = next
  notify()
  return true
}

/** Clears the shared state, when someone chooses to sign up with a different email */
export function leaveList(): void {
  entry = null
  notify()
}

export function currentListEntry(): ListEntry | null {
  return entry
}

function subscribe(listener: Listener): () => void {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((current) => current !== listener)
  }
}

const readOnServer = (): ListEntry | null => null

export function useListEntry(): ListEntry | null {
  return useSyncExternalStore(subscribe, currentListEntry, readOnServer)
}
