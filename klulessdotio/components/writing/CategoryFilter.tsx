"use client"

import { useEffect, useState } from "react"

const ALL = "All"
const PARAM = "category"

function applyFilter(selected: string): void {
  document.querySelectorAll<HTMLElement>("[data-category]").forEach((group) => {
    group.hidden = selected !== ALL && group.dataset.category !== selected
  })
  document.querySelectorAll<HTMLElement>("[data-all-only]").forEach((el) => {
    el.hidden = selected !== ALL
  })
}

function urlFor(selected: string): string {
  const url = new URL(window.location.href)
  if (selected === ALL) url.searchParams.delete(PARAM)
  else url.searchParams.set(PARAM, selected)
  return `${url.pathname}${url.search}${url.hash}`
}

/** Shows one category at a time. The server renders every group, so without JavaScript nothing is hidden. */
export function CategoryFilter({ categories }: { categories: readonly string[] }) {
  const options = [ALL, ...categories]
  const [selected, setSelected] = useState(ALL)

  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get(PARAM)
    if (wanted && categories.includes(wanted)) setSelected(wanted)
  }, [categories])

  useEffect(() => applyFilter(selected), [selected])

  const choose = (option: string) => {
    setSelected(option)
    window.history.replaceState(window.history.state, "", urlFor(option))
  }

  return (
    <div className="segmented" role="group" aria-label="Filter by category">
      {options.map((option) => (
        <button key={option} type="button" className="segment" aria-pressed={option === selected} onClick={() => choose(option)}>
          {option}
        </button>
      ))}
    </div>
  )
}
