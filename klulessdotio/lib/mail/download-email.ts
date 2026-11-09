function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function downloadEmailText(title: string, link: string): string {
  return [
    `Here's the ${title} you asked for.`,
    "",
    link,
    "",
    "The link works for 7 days.",
    "",
    "Angad",
  ].join("\n")
}

export function downloadEmailHtml(title: string, link: string): string {
  const safeLink = escapeHtml(link)
  return [
    `<p>Here's the ${escapeHtml(title)} you asked for.</p>`,
    `<p><a href="${safeLink}">${safeLink}</a></p>`,
    "<p>The link works for 7 days.</p>",
    "<p>Angad</p>",
  ].join("\n")
}
