export const KIT_EMAIL_SUBJECT = "Your starter kit is here"

// The kit email is a plain personal letter on purpose. Gmail files designed mail
// (header images, cards, buttons, hidden preheaders) under Promotions.
const GREETING = "Hi there,"
const THANKS = "Thanks for asking for the starter kit. Here it is:"
const LINK_TEXT = "Open your kit"
const INTRO =
  "It's five short steps for getting Claude or ChatGPT to do real work inside your own spreadsheets, documents and accounts. No code, no terminal. Inside:"
const INSIDE = [
  "How to switch from chatting to working, and connect your tools",
  "A starting prompt that teaches the agent how you work",
  "Five kinds of jobs to try first, with the request written out",
]
const AFTER = [
  "Start with the first ten minutes in step 2. That's where it clicks for most people. The link works for good, so keep this email.",
  "If you get stuck, or you build something, just reply to this email. It comes straight to me, and I read every one.",
]
const NAME = "Angad"
const SITE_LABEL = "1tx.dev"
const SITE_HREF = "https://1tx.dev"
const REASON = "You're getting this because you asked for the starter kit at 1tx.dev/kit."
const UNSUBSCRIBE = "Unsubscribe"

// Fonts go on every text element: Outlook's Word engine does not pass them down from a div.
// Colours are left to the mail client, as in a typed personal email.
const FONT = "font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;"
const P = `margin:0 0 14px;${FONT}`
const LI = `margin:0 0 4px;${FONT}`
const SMALL = "margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;"

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const paragraph = (text: string) => `<p style="${P}">${escapeHtml(text)}</p>`

export function kitEmailHtml(link: string, unsubscribeLink: string): string {
  const safeLink = escapeHtml(link)
  const safeUnsub = escapeHtml(unsubscribeLink)
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(KIT_EMAIL_SUBJECT)}</title>
</head>
<body style="margin:0;padding:0;">
<div style="max-width:560px;padding:16px;">
${paragraph(GREETING)}
<p style="${P}">${escapeHtml(THANKS)} <a href="${safeLink}">${LINK_TEXT}</a></p>
${paragraph(INTRO)}
<ul style="margin:0 0 14px;padding:0 0 0 22px;">
${INSIDE.map((item) => `<li style="${LI}">${escapeHtml(item)}</li>`).join("\n")}
</ul>
${AFTER.map(paragraph).join("\n")}
<p style="${P}">${NAME}<br><a href="${SITE_HREF}">${SITE_LABEL}</a></p>
<p style="${SMALL}">${escapeHtml(REASON)} <a href="${safeUnsub}">${UNSUBSCRIBE}</a>.</p>
</div>
</body>
</html>`
}

export function kitEmailText(link: string, unsubscribeLink: string): string {
  return [
    GREETING,
    "",
    THANKS,
    `${LINK_TEXT}: ${link}`,
    "",
    INTRO,
    "",
    ...INSIDE.map((item) => `- ${item}`),
    "",
    ...AFTER.flatMap((p) => [p, ""]),
    NAME,
    SITE_LABEL,
    "",
    REASON,
    `${UNSUBSCRIBE}: ${unsubscribeLink}`,
  ].join("\n")
}
