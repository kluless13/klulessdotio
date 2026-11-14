"use client"

import { CheckIcon } from "./icons"

/** Shown in place of the form once the pretend send succeeds */
type ResultProps = {
  /** The title takes focus when the result appears, so it is read out and keyboard users keep their place */
  readonly titleId: string
  readonly email: string
}

export function OnTheList({ titleId, firstName, email }: ResultProps & { readonly firstName: string }) {
  return (
    <div className="kt-result" role="status">
      <span className="kt-result-badge" aria-hidden="true">
        <CheckIcon size={20} />
      </span>
      <h3 className="kt-result-title" id={titleId} tabIndex={-1}>
        You&rsquo;re on the list, {firstName}.
      </h3>
      <p className="kt-result-text">
        We&rsquo;ve sent a confirmation to {email}. Your early-bird fee is held for you.
      </p>
      <span className="kt-btn kt-btn--done kt-btn--block" aria-hidden="true">
        <CheckIcon size={16} /> On the list
      </span>
    </div>
  )
}

/** Not an error: the address signed up earlier, in this browser */
export function AlreadyOnList({ titleId, email, onUseAnother }: ResultProps & { readonly onUseAnother: () => void }) {
  return (
    <div className="kt-result" role="status">
      <span className="kt-result-badge kt-result-badge--info" aria-hidden="true">
        i
      </span>
      <h3 className="kt-result-title" id={titleId} tabIndex={-1}>
        You&rsquo;re already on the list.
      </h3>
      <p className="kt-result-text">
        {email} signed up earlier, so your early-bird fee is already held. We&rsquo;ll email you when evaluations open.
      </p>
      <button type="button" className="kt-link kt-result-link" onClick={onUseAnother}>
        Use a different email
      </button>
    </div>
  )
}

export function SendFailed() {
  return (
    <p className="kt-banner" role="alert">
      That didn&rsquo;t go through. Your details are still here, so check your connection and try again.
    </p>
  )
}
