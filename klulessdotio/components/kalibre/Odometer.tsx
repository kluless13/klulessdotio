"use client"

import { rollColumns } from "@/lib/kalibre/odometer"

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const

type OdometerProps = {
  /** The formatted figure, e.g. "£46,000" */
  readonly text: string
  readonly className?: string
}

/** A figure that rolls digit by digit when it changes. Screen readers get the plain figure. */
export function Odometer({ text, className }: OdometerProps) {
  const columns = rollColumns(text)
  return (
    <span className={`kt-odo ${className ?? ""}`}>
      <span className="kt-sr">{text}</span>
      <span className="kt-odo-track" aria-hidden="true">
        {columns.map((column) =>
          column.isDigit ? (
            <span key={column.key} className="kt-odo-window">
              <span
                className="kt-odo-strip"
                style={{ transform: `translateY(-${Number(column.char) * 10}%)`, transitionDelay: `${column.delayMs}ms` }}
              >
                {DIGITS.map((digit) => (
                  <span key={digit}>{digit}</span>
                ))}
              </span>
            </span>
          ) : (
            <span key={column.key} className="kt-odo-char">
              {column.char}
            </span>
          ),
        )}
      </span>
    </span>
  )
}
