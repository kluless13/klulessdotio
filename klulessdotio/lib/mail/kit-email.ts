export const KIT_EMAIL_SUBJECT = "Your starter kit is here"
export const KIT_EMAIL_PREVIEW = "Five steps to get the AI you already pay for doing real work."

const TITLE = "Talk to it. It does the work."
const GREETING = "Hi there,"
const THANKS = "Thanks for asking for the starter kit. Here it is."
const INTRO =
  "It's five short steps for getting Claude or ChatGPT to do real work inside your own spreadsheets, documents and accounts. No code, no terminal. Inside:"
const INSIDE = [
  "How to switch from chatting to working, and connect your tools",
  "A starting prompt that teaches the agent how you work",
  "Five kinds of jobs to try first, with the request written out",
]
const AFTER = [
  "Start with the first ten minutes in step 2. That's where it clicks for most people.",
  "If you get stuck, or you build something, just reply to this email. It comes straight to me, and I read every one.",
]
const BUTTON = "Open your kit"
const REASON = "You're getting this because you asked for the starter kit at 1tx.dev/kit."
const UNSUBSCRIBE = "Unsubscribe in one click"

const HEADER_URL = "https://1tx.dev/email/kit-header.gif"
const SIGNATURE_URL = "https://1tx.dev/email/signature-angad.png"

const INK = "#101A2E"
const SOFT = "#5E6675"
const UI = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
const SERIF = "Newsreader,Georgia,'Times New Roman',serif"
const GLOW_STATIC =
  "0 0 0 1.5px rgba(121,181,232,0.85),0 0 26px 4px rgba(121,181,232,0.55),0 20px 50px rgba(20,30,60,0.10)"
const GLOW_DIM =
  "0 0 0 1.5px rgba(121,181,232,0.25),0 0 10px 1px rgba(121,181,232,0.15),0 20px 50px rgba(20,30,60,0.10)"

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const paragraph = (text: string) =>
  `<tr><td style="padding:0 0 16px;font-family:${SERIF};font-size:18px;line-height:29px;color:${INK};">${escapeHtml(text)}</td></tr>`

const listItem = (text: string) =>
  `<tr><td width="17" valign="top" style="padding:12px 0 0;"><div style="width:5px;height:5px;border-radius:3px;background:${INK};font-size:0;line-height:0;">&nbsp;</div></td>` +
  `<td style="padding:0 0 4px;font-family:${SERIF};font-size:18px;line-height:29px;color:${INK};">${escapeHtml(text)}</td></tr>`

export function kitEmailHtml(link: string, unsubscribeLink: string): string {
  const safeLink = escapeHtml(link)
  const safeUnsub = escapeHtml(unsubscribeLink)
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(KIT_EMAIL_SUBJECT)}</title>
<style>
@media (prefers-reduced-motion: no-preference) {
  @keyframes kitpulse {
    0%,100% { box-shadow: ${GLOW_STATIC}; }
    50% { box-shadow: ${GLOW_DIM}; }
  }
  .kit-card { animation: kitpulse 3s ease-in-out infinite; }
}
</style>
</head>
<body style="margin:0;padding:0;background:#EEF3F9;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">${escapeHtml(KIT_EMAIL_PREVIEW)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EEF3F9;">
<tr><td align="center" style="padding:28px 24px 28px;">
<table role="presentation" class="kit-card" width="552" cellpadding="0" cellspacing="0" border="0" style="width:552px;max-width:100%;background:#FFFFFF;border-radius:18px;overflow:hidden;box-shadow:${GLOW_STATIC};">
<tr><td style="font-size:0;line-height:0;border-radius:18px 18px 0 0;overflow:hidden;"><img src="${HEADER_URL}" alt="" width="552" style="display:block;width:100%;max-width:552px;height:auto;border:0;border-radius:18px 18px 0 0;"></td></tr>
<tr><td style="padding:36px 40px 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding:0 0 20px;font-family:${UI};font-size:28px;line-height:34px;font-weight:500;letter-spacing:-0.02em;color:${INK};">${escapeHtml(TITLE)}</td></tr>
${paragraph(GREETING)}
${paragraph(THANKS)}
${paragraph(INTRO)}
<tr><td style="padding:0 0 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${INSIDE.map(listItem).join("\n")}
</table></td></tr>
<tr><td style="padding:8px 0 24px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#1C263D" style="border-radius:10px;background:#1C263D linear-gradient(180deg,#2B3650 0%,#141B2C 100%);box-shadow:0 0 0 1px rgba(255,255,255,0.2),inset 0 1px 0 rgba(255,255,255,0.22),0 1px 2px rgba(0,0,0,0.28),0 8px 18px rgba(0,0,0,0.16);"><a href="${safeLink}" style="display:inline-block;padding:10px 15px;font-family:${UI};font-size:14px;line-height:20px;font-weight:500;color:#FFFFFF;text-decoration:none;border-radius:10px;">${BUTTON} &rarr;</a></td></tr></table></td></tr>
${AFTER.map(paragraph).join("\n")}
<tr><td style="padding:4px 0 0;"><img src="${SIGNATURE_URL}" alt="Angad" width="80" height="34" style="display:block;border:0;width:80px;height:34px;"><div style="padding-top:4px;font-family:${UI};font-size:14px;line-height:20px;color:${SOFT};">1tx.dev</div></td></tr>
</table>
</td></tr>
</table>
<table role="presentation" width="552" cellpadding="0" cellspacing="0" border="0" style="width:552px;max-width:100%;"><tr><td align="center" style="padding:24px 48px 20px;font-family:${UI};font-size:13px;line-height:19px;color:${SOFT};">${escapeHtml(REASON)} <a href="${safeUnsub}" style="color:${SOFT};text-decoration:underline;">${UNSUBSCRIBE}</a>.</td></tr></table>
</td></tr>
</table>
</body>
</html>`
}

export function kitEmailText(link: string, unsubscribeLink: string): string {
  return [
    GREETING,
    "",
    THANKS,
    "",
    INTRO,
    "",
    ...INSIDE.map((item) => `- ${item}`),
    "",
    `${BUTTON}: ${link}`,
    "",
    ...AFTER.flatMap((p) => [p, ""]),
    "Angad",
    "1tx.dev",
    "",
    REASON,
    `${UNSUBSCRIBE}: ${unsubscribeLink}`,
  ].join("\n")
}
