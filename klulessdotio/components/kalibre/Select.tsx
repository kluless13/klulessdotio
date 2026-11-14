"use client"

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { CheckIcon, ChevronIcon } from "./icons"
import { useCoarsePointer } from "./hooks"

type SelectProps = {
  readonly id: string
  readonly label: string
  readonly hint?: string
  readonly placeholder: string
  readonly options: readonly string[]
  readonly value: string
  readonly error?: string
  /** While the form is sending the field stays focusable but can't be changed */
  readonly busy?: boolean
  readonly onChange: (value: string) => void
  readonly onBlur?: () => void
}

/** A dropdown that matches the fields. Mouse and keyboard get the designed menu; phones get their own picker. */
export function Select({ id, label, hint, placeholder, options, value, error, busy, onChange, onBlur }: SelectProps) {
  const coarse = useCoarsePointer()
  const errorId = `${id}-error`

  return (
    <div className="kt-field">
      <label className="kt-label" htmlFor={id} id={`${id}-label`}>
        {label} {hint ? <small>{hint}</small> : null}
      </label>
      {coarse ? (
        <div className="kt-select-native">
          <select
            id={id}
            className="kt-input"
            value={value}
            aria-disabled={busy || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => !busy && onChange(event.target.value)}
            onBlur={onBlur}
            data-empty={value === "" ? "" : undefined}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronIcon size={14} className="kt-select-chevron" />
        </div>
      ) : (
        <Listbox id={id} placeholder={placeholder} options={options} value={value} error={error} errorId={errorId} busy={busy} onChange={onChange} onBlur={onBlur} />
      )}
      {error ? (
        <p className="kt-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

type MenuAction =
  | { readonly kind: "open" }
  | { readonly kind: "move"; readonly to: number }
  | { readonly kind: "choose"; readonly index: number; readonly keepFocus: boolean }
  | { readonly kind: "close" }
  | { readonly kind: "none" }

/** What a key does to the menu, following the select-only combobox pattern */
export function menuKeyAction(key: string, open: boolean, active: number, count: number): MenuAction {
  if (!open) return ["ArrowDown", "ArrowUp", "Enter", " "].includes(key) ? { kind: "open" } : { kind: "none" }
  const clamp = (index: number) => Math.min(count - 1, Math.max(0, index))
  switch (key) {
    case "ArrowDown":
      return { kind: "move", to: clamp(active + 1) }
    case "ArrowUp":
      return { kind: "move", to: clamp(active - 1) }
    case "Home":
      return { kind: "move", to: 0 }
    case "End":
      return { kind: "move", to: count - 1 }
    case "Enter":
    case " ":
      return active >= 0 ? { kind: "choose", index: active, keepFocus: true } : { kind: "none" }
    case "Tab":
      // Tabbing away keeps the highlighted answer, then focus moves on as usual
      return active >= 0 ? { kind: "choose", index: active, keepFocus: false } : { kind: "close" }
    case "Escape":
      return { kind: "close" }
    default:
      return { kind: "none" }
  }
}

type ListboxProps = Omit<SelectProps, "label" | "hint"> & { readonly errorId: string }

function Listbox({ id, placeholder, options, value, error, errorId, busy, onChange, onBlur }: ListboxProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  const close = useCallback(() => {
    setOpen(false)
    setActive(-1)
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      close()
      onBlur?.()
    }
    document.addEventListener("pointerdown", onPointer)
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [open, close, onBlur])

  const openMenu = () => {
    if (busy) return
    setOpen(true)
    setActive(Math.max(0, options.indexOf(value)))
  }

  const choose = (index: number) => {
    onChange(options[index])
    close()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const action = menuKeyAction(event.key, open, active, options.length)
    if (action.kind === "none") return
    if (event.key !== "Tab") event.preventDefault()
    if (action.kind === "open") openMenu()
    else if (action.kind === "move") setActive(action.to)
    else if (action.kind === "choose") choose(action.index)
    else close()
  }

  return (
    <div className="kt-select" ref={rootRef}>
      <button
        type="button"
        id={id}
        className="kt-input kt-select-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${id}-label ${id}`}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-disabled={busy || undefined}
        data-open={open ? "" : undefined}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onKeyDown}
        onBlur={() => !open && onBlur?.()}
      >
        <span className={value ? "kt-select-value" : "kt-select-placeholder"}>
          {value ? (
            <>
              <CheckIcon size={14} />
              {value}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronIcon size={14} className="kt-select-chevron" />
      </button>
      {open ? (
        <ul className="kt-menu" role="listbox" id={listId} aria-labelledby={`${id}-label`}>
          {options.map((option, index) => (
            <li
              key={option}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option === value}
              data-active={index === active ? "" : undefined}
              className="kt-menu-item"
              onPointerEnter={() => setActive(index)}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              <span>{option}</span>
              {option === value ? <CheckIcon size={16} /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
