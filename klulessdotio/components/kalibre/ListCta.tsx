"use client"

import type { MouseEvent, ReactNode } from "react"
import { CheckIcon } from "./icons"
import { useListEntry } from "./listStore"

type ListCtaProps = {
  /** Classes for the "Get priority access" link, e.g. "kt-btn--gold kt-btn--block" */
  readonly className: string
  /** Extra classes kept once the button turns into "You're on the list" */
  readonly doneClassName?: string
  readonly onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void
}

/** "Get priority access" until someone joins the list, then a quiet confirmation in its place */
export function ListCta({ className, doneClassName = "", onNavigate }: ListCtaProps) {
  const listed = useListEntry()
  if (listed) {
    return (
      <span className={`kt-btn kt-btn--done ${doneClassName}`} role="status">
        <CheckIcon size={16} />
        You&rsquo;re on the list
      </span>
    )
  }
  return (
    <a href="#register" className={`kt-btn ${className}`} onClick={onNavigate}>
      Get priority access
    </a>
  )
}

/** Shows its children only until someone joins the list, e.g. the hero form's "Get priority access" heading */
export function UntilListed({ children }: { readonly children: ReactNode }) {
  return useListEntry() ? null : <>{children}</>
}
