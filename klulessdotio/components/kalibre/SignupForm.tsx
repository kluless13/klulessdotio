"use client"

import { useEffect, useState, type FormEvent } from "react"
import {
  REGIONS,
  STARTING_POINTS,
  checkField,
  checkSignup,
  decideOutcome,
  firstProblem,
  readKnownEmails,
  rememberEmail,
  type SendOutcome,
  type Signup,
  type SignupErrors,
  type SignupField,
  type SignupInput,
} from "@/lib/kalibre/signup"
import { Select } from "./Select"
import { NextStepsModal } from "./NextStepsModal"
import { AlreadyOnList, OnTheList, SendFailed } from "./SignupResult"
import { TextField } from "./TextField"
import { Spinner } from "./icons"
import { currentListEntry, joinList, leaveList, useListEntry } from "./listStore"

/** How long the pretend send takes, so the sending state is visible */
const SEND_MS = 1200

type Status = "idle" | "sending" | SendOutcome

type SignupFormProps = {
  /** Field ids must be unique on the page */
  readonly idPrefix: string
  /** Only the closing form asks for a starting point */
  readonly askStartingPoint: boolean
}

const EMPTY: SignupInput = { firstName: "", email: "", region: "", startingPoint: "" }

const storage = (): Storage | null => {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const focusById = (id: string) => window.setTimeout(() => document.getElementById(id)?.focus(), 0)

/** The pretend send: decides the outcome, remembers the address in this browser and shares it with the rest of the page */
function finishSend(data: Signup): SendOutcome | "superseded" {
  // The other form signed someone up while this one was sending
  if (currentListEntry()) return "superseded"
  const outcome = decideOutcome(data.email, readKnownEmails(storage()), navigator.onLine)
  if (outcome === "added") rememberEmail(storage(), data.email)
  if (outcome !== "failed") joinList({ firstName: data.firstName, email: data.email, outcome })
  return outcome
}

/** The demo sign-up form. It runs every state but sends nothing anywhere. */
export function SignupForm({ idPrefix, askStartingPoint }: SignupFormProps) {
  const [values, setValues] = useState<SignupInput>(EMPTY)
  const [errors, setErrors] = useState<SignupErrors>({})
  const [status, setStatus] = useState<Status>("idle")
  const [modalOpen, setModalOpen] = useState(false)
  const listed = useListEntry()
  const id = (field: SignupField | "submit" | "result") => `${idPrefix}-${field}`
  const sending = status === "sending"

  // Move focus to whatever replaced the button, so it's read out and keyboard users keep their place
  useEffect(() => {
    if (status === "already") focusById(`${idPrefix}-result`)
    if (status === "failed") focusById(`${idPrefix}-submit`)
  }, [status, idPrefix])

  const update = (field: SignupField, value: string) => {
    if (sending) return
    const next = { ...values, [field]: value }
    setValues(next)
    // An error clears as soon as someone starts fixing it
    if (errors[field]) setErrors({ ...errors, [field]: checkField(field, next, askStartingPoint) })
  }

  const leave = (field: SignupField) => {
    const filled = String(values[field] ?? "").trim() !== ""
    if (filled || errors[field]) setErrors({ ...errors, [field]: checkField(field, values, askStartingPoint) })
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending) return
    const result = checkSignup(values, askStartingPoint)
    if (!result.ok) {
      setErrors(result.errors)
      setStatus("idle")
      const field = firstProblem(result.errors)
      if (field) document.getElementById(id(field))?.focus()
      return
    }
    setErrors({})
    setStatus("sending")
    window.setTimeout(() => {
      const outcome = finishSend(result.data)
      if (outcome === "added") setModalOpen(true)
      setStatus(outcome === "superseded" ? "idle" : outcome)
    }, SEND_MS)
  }

  const startOver = () => {
    leaveList()
    setValues({ ...values, email: "" })
    setStatus("idle")
    focusById(id("email"))
  }

  // Signed up here or in the other form: both show the same result
  if (listed?.outcome === "already") return <AlreadyOnList titleId={id("result")} email={listed.email} onUseAnother={startOver} />
  if (listed) {
    return (
      <>
        <OnTheList titleId={id("result")} firstName={listed.firstName} email={listed.email} />
        {modalOpen ? (
          <NextStepsModal
            firstName={listed.firstName}
            email={listed.email}
            onClose={() => {
              setModalOpen(false)
              focusById(id("result"))
            }}
          />
        ) : null}
      </>
    )
  }

  return (
    <form className="kt-form" onSubmit={submit} noValidate aria-busy={sending}>
      {status === "failed" ? <SendFailed /> : null}
      <TextField
        id={id("firstName")}
        label="First name"
        autoComplete="given-name"
        placeholder="Your first name"
        value={values.firstName}
        error={errors.firstName}
        busy={sending}
        onChange={(value) => update("firstName", value)}
        onBlur={() => leave("firstName")}
      />
      <TextField
        id={id("email")}
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={values.email}
        error={errors.email}
        busy={sending}
        onChange={(value) => update("email", value)}
        onBlur={() => leave("email")}
      />
      <Select
        id={id("region")}
        label="Where are you based?"
        placeholder="Select your region"
        options={REGIONS}
        value={values.region}
        error={errors.region}
        busy={sending}
        onChange={(value) => update("region", value)}
        onBlur={() => leave("region")}
      />
      {askStartingPoint ? (
        <Select
          id={id("startingPoint")}
          label="Starting point"
          hint="(optional)"
          placeholder="Choose one"
          options={STARTING_POINTS}
          value={values.startingPoint ?? ""}
          busy={sending}
          onChange={(value) => update("startingPoint", value)}
        />
      ) : null}
      <SubmitButton id={id("submit")} status={status} />
      <p className="kt-smallprint">
        <span>Launch emails only. Unsubscribe any time.</span>
        <a className="kt-link" href="/kalibre/privacy">
          Privacy notice
        </a>
      </p>
    </form>
  )
}

function SubmitButton({ id, status }: { readonly id: string; readonly status: Status }) {
  const sending = status === "sending"
  return (
    <button
      id={id}
      type="submit"
      className="kt-btn kt-btn--gold kt-btn--block"
      data-state={sending ? "sending" : undefined}
      aria-disabled={sending || undefined}
    >
      {sending ? (
        <>
          <Spinner /> Sending
        </>
      ) : status === "failed" ? (
        "Try again"
      ) : (
        "Get priority access"
      )}
    </button>
  )
}
