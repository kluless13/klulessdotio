"use client"

import type { InputHTMLAttributes } from "react"

type TextFieldProps = {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly error?: string
  /** While the form is sending the field stays focusable but can't be changed */
  readonly busy: boolean
  readonly onChange: (value: string) => void
  readonly onBlur: () => void
} & Pick<InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode" | "autoComplete" | "placeholder">

/** A labelled text field with its error underneath. No name attribute, so nothing can ever be submitted in a URL. */
export function TextField({ id, label, value, error, busy, onChange, onBlur, ...input }: TextFieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="kt-field">
      <label className="kt-label" htmlFor={id}>
        {label}
      </label>
      <input
        {...input}
        id={id}
        className="kt-input"
        value={value}
        readOnly={busy}
        aria-disabled={busy || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
      {error ? (
        <p className="kt-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
