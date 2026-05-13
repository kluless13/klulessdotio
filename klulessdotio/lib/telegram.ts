/**
 * Minimal Telegram Bot API client — just `sendMessage`.
 *
 * Uses HTML parse mode (only <, >, & need escaping — much simpler than
 * MarkdownV2 which requires escaping ~15 punctuation chars).
 *
 * Server-side only. Reads TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID from env.
 */

const TG_API_BASE = "https://api.telegram.org";

interface SendMessageResult {
  ok: boolean;
  error?: string;
}

/**
 * Escape characters that have special meaning in Telegram HTML parse mode.
 * https://core.telegram.org/bots/api#html-style
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Send a Telegram message to the configured chat.
 *
 * Returns { ok: true } on success, { ok: false, error } on failure.
 * Never throws — the caller can decide whether one failed send should
 * abort the rest of a batch.
 */
export async function sendMessage(html: string): Promise<SendMessageResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set" };
  }

  try {
    const res = await fetch(`${TG_API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Telegram ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
