import { AccountSlider } from "./AccountSlider"
import { SignupForm } from "./SignupForm"
import { ArrowIcon, CheckIcon, DiscordIcon } from "./icons"
import { UntilListed } from "./ListCta"

export function Hero() {
  return (
    <section className="kt-hero" aria-labelledby="kt-hero-title">
      <div className="kt-hero-card">
        <div className="kt-hero-image kt-on-navy">
          <img src="/kalibre/hero-bank.webp" alt="" width={1600} height={1120} />
          <span className="kt-hero-shade" aria-hidden="true" />
          <div className="kt-hero-copy">
            <h1 id="kt-hero-title">
              Get funded.
              <br />
              Get paid on time.
            </h1>
            <p>A prop firm evaluation with a static drawdown and every rule published before you pay. Evaluations open end of September 2026.</p>
            <dl className="kt-hero-stats">
              <div>
                <dt>14 days</dt>
                <dd>Payouts processed</dd>
              </div>
              <div>
                <dt>£1,000</dt>
                <dd>Paid to you if we miss it</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="kt-hero-form">
          <UntilListed>
            <div className="kt-hero-form-head">
              <h2>Get priority access</h2>
              <p>The early-bird fee and first access when evaluations open.</p>
            </div>
          </UntilListed>
          <SignupForm idPrefix="hero" askStartingPoint={false} />
        </div>
      </div>
    </section>
  )
}

export function Accounts() {
  return (
    <section className="kt-section kt-accounts" id="account-sizes" aria-labelledby="kt-accounts-title">
      <div className="kt-accounts-copy">
        <h2 className="kt-h2" id="kt-accounts-title">
          Choose your account size
        </h2>
        <p className="kt-lead">Move the slider to see the fee and the limits for each size. Priority registrants pay the early-bird fee.</p>
      </div>
      <AccountSlider />
    </section>
  )
}

const COMMUNITY_POINTS = ["Prep, questions and post-mortems", "No signals. No selling.", "Priority registrants get the first invites"] as const

export function Community() {
  return (
    <section className="kt-section kt-community" id="community" aria-labelledby="kt-community-title">
      <div className="kt-shimmer">
        <div className="kt-community-card">
          <div className="kt-community-photo">
            <img src="/kalibre/community.webp" alt="" width={1080} height={880} loading="lazy" />
          </div>
          <div className="kt-community-copy">
            <div>
              <h2 id="kt-community-title">Join the community</h2>
              <p>A Discord for traders taking evaluations. Opens end of September 2026.</p>
            </div>
            <ul className="kt-checks">
              {COMMUNITY_POINTS.map((point) => (
                <li key={point}>
                  <CheckIcon />
                  {point}
                </li>
              ))}
            </ul>
            <a href="#register" className="kt-btn kt-btn--navy kt-discord-btn">
              <DiscordIcon />
              Join Discord
              <ArrowIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

const PRIORITY_POINTS = ["Early-bird challenge fee", "Full terms before launch", "First access in September"] as const

export function Priority() {
  return (
    <section className="kt-section kt-priority" id="register" aria-labelledby="kt-priority-title">
      <h2 id="kt-priority-title">Get priority access</h2>
      <ul className="kt-priority-points">
        {PRIORITY_POINTS.map((point) => (
          <li key={point}>
            <CheckIcon size={16} />
            {point}
          </li>
        ))}
      </ul>
      <div className="kt-closing-form">
        <SignupForm idPrefix="closing" askStartingPoint />
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="kt-footer">
      <div className="kt-footer-content">
        <div className="kt-footer-top">
          <div className="kt-footer-brand">
            <p className="kt-wordmark">
              <span className="kt-wordmark-dot" aria-hidden="true" />
              KalibreTrades
            </p>
            <p>Learn more. Fail less. Gain capital.</p>
          </div>
          <div className="kt-footer-cols">
            <div>
              <h2>Contact</h2>
              <a href="mailto:hello@kalibretrades.com">hello@kalibretrades.com</a>
              <a href="tel:+447525032871">07525 032871</a>
            </div>
            <div>
              <h2>Company</h2>
              <p>Westerbridge Ltd</p>
              <p>Registered in England and Wales</p>
              <a href="/kalibre/privacy">Privacy notice</a>
            </div>
            <div>
              <h2>Books</h2>
              <p>Westerbridge Publications</p>
            </div>
          </div>
        </div>
        <p className="kt-disclaimer">
          KalibreTrades is a proprietary trading evaluation firm. Trading financial instruments carries significant risk of loss. An evaluation
          does not guarantee future trading performance. Challenge fees are non-refundable except where stated in the published terms. The
          14-day payout guarantee and £1,000 compensation commitment apply to funded account payouts as set out in the full terms. Westerbridge
          Ltd is registered in England and Wales.
        </p>
        <p className="kt-credit">
          A concept site for KalibreTrades, designed by Angad. The forms are for show: nothing is sent, and this browser only remembers the emails you try.{" "}
          <a className="kt-link" href="/">
            1tx.dev
          </a>
        </p>
      </div>
      <div className="kt-footer-city" aria-hidden="true">
        <picture>
          <source media="(max-width: 760px)" srcSet="/kalibre/footer-westminster-mobile.webp" />
          <img src="/kalibre/footer-westminster.webp" alt="" width={2160} height={1350} loading="lazy" />
        </picture>
        <span className="kt-footer-tint" />
        <span className="kt-watermark">KalibreTrades</span>
      </div>
    </footer>
  )
}
