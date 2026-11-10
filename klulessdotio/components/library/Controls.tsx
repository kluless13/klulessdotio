"use client"

import { LayoutGrid, List } from "lucide-react"
import type { Filter } from "@/lib/library/types"
import type { LibraryViewMode } from "@/lib/library/view-pref"

const FILTERS: readonly { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "type", label: "Type" },
  { value: "buttons", label: "Buttons" },
]

const VIEWS: readonly { value: LibraryViewMode; label: string; Icon: typeof LayoutGrid }[] = [
  { value: "grid", label: "Grid", Icon: LayoutGrid },
  { value: "list", label: "List", Icon: List },
]

interface ControlsProps {
  filter: Filter
  view: LibraryViewMode
  onFilter: (filter: Filter) => void
  onView: (view: LibraryViewMode) => void
}

/** The All, Type and Buttons filter and the grid and list switch, both in the soft segmented style. */
export function Controls({ filter, view, onFilter, onView }: ControlsProps) {
  return (
    <div className="lib-controls">
      <div className="lib-seg" role="group" aria-label="Show">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            className="lib-seg-option"
            aria-pressed={option.value === filter}
            onClick={() => onFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="lib-seg" role="group" aria-label="View">
        {VIEWS.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            className="lib-seg-option lib-seg-icon"
            aria-label={label}
            aria-pressed={value === view}
            onClick={() => onView(value)}
          >
            <Icon size={16} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  )
}
