/**
 * GitHub → Telegram notification cron endpoint.
 *
 * Schedule: every 1 minute (declared in vercel.json).
 * Auth: Vercel Cron auto-injects `Authorization: Bearer ${CRON_SECRET}`.
 *
 * Flow:
 *   1. Verify the cron secret (reject if header doesn't match).
 *   2. Load last_polled_at from Vercel KV (default: 5 min ago on first run).
 *   3. Fetch GitHub notifications updated since that timestamp.
 *   4. Filter to interesting reasons (mention, review_requested, etc.).
 *   5. Send each one as a Telegram message.
 *   6. Update last_polled_at in KV to the latest notification's updated_at
 *      (or to "now" if no notifications were received).
 *
 * Returns: { ok: true, fetched, sent, errors } JSON.
 *
 * State key: `gh:last_polled_at` (ISO 8601 string in KV).
 */

import { Redis } from "@upstash/redis";
import {
  fetchNotifications,
  NOTIFY_REASONS,
  reasonLabel,
  toWebUrl,
  type GithubNotification,
} from "@/lib/github";
import { escapeHtml, sendMessage } from "@/lib/telegram";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const STATE_KEY = "gh:last_polled_at";
const FIRST_RUN_LOOKBACK_MS = 5 * 60 * 1000; // 5 minutes

// Redis.fromEnv() auto-detects either UPSTASH_REDIS_REST_{URL,TOKEN} or
// the KV-prefixed Vercel-KV-compat names KV_REST_API_{URL,TOKEN}.
const redis = Redis.fromEnv();

function formatMessage(n: GithubNotification): string {
  const label = escapeHtml(reasonLabel(n.reason));
  const repo = escapeHtml(n.repository.full_name);
  const type = escapeHtml(n.subject.type);
  const title = escapeHtml(n.subject.title);
  const url = toWebUrl(n);

  return [
    `🔔 <b>${label}</b>`,
    `${repo} · ${type}`,
    `<a href="${url}">${title}</a>`,
  ].join("\n");
}

export async function GET(req: Request): Promise<Response> {
  // 1. Verify cron secret.
  const expected = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!expected || authHeader !== `Bearer ${expected}`) {
    // Diagnostic body (length-only, no secret values).
    // Remove once 200s start landing — this is debug-only.
    return Response.json(
      {
        ok: false,
        error: "unauthorized",
        debug: {
          env_var_exists: !!expected,
          env_var_length: expected?.length ?? 0,
          auth_header_exists: !!authHeader,
          auth_header_length: authHeader?.length ?? 0,
          header_starts_with_bearer: authHeader?.startsWith("Bearer ") ?? false,
          header_token_length:
            authHeader?.startsWith("Bearer ") ? authHeader.length - 7 : null,
          lengths_match:
            expected && authHeader?.startsWith("Bearer ")
              ? expected.length === authHeader.length - 7
              : null,
        },
      },
      { status: 401 }
    );
  }

  // 2. Load last_polled_at from KV (or default).
  const ghToken = process.env.GH_NOTIFICATIONS_PAT;
  if (!ghToken) {
    return Response.json(
      { ok: false, error: "GH_NOTIFICATIONS_PAT not set" },
      { status: 500 }
    );
  }

  const stored = await redis.get<string>(STATE_KEY);
  const since =
    stored ?? new Date(Date.now() - FIRST_RUN_LOOKBACK_MS).toISOString();

  // 3. Fetch GitHub notifications.
  let notifications: GithubNotification[];
  try {
    notifications = await fetchNotifications(since, ghToken);
  } catch (e) {
    return Response.json(
      { ok: false, error: `github fetch failed: ${e}` },
      { status: 502 }
    );
  }

  // 4. Filter to interesting reasons.
  const interesting = notifications.filter((n) => NOTIFY_REASONS.has(n.reason));

  // 5. Send to Telegram. Continue on individual failures.
  const errors: string[] = [];
  let sent = 0;
  for (const n of interesting) {
    const result = await sendMessage(formatMessage(n));
    if (result.ok) {
      sent++;
    } else {
      errors.push(`${n.id}: ${result.error}`);
    }
  }

  // 6. Update last_polled_at. Use latest seen updated_at + 1s to avoid
  //    re-fetching boundary notifications on the next cron tick. If no
  //    notifications came back, advance to "now" so we don't re-scan the
  //    same window forever.
  const latestUpdate = notifications
    .map((n) => n.updated_at)
    .sort()
    .pop();
  const nextSince = latestUpdate
    ? new Date(new Date(latestUpdate).getTime() + 1000).toISOString()
    : new Date().toISOString();
  await redis.set(STATE_KEY, nextSince);

  return Response.json({
    ok: true,
    since,
    nextSince,
    fetched: notifications.length,
    matched: interesting.length,
    sent,
    errors: errors.length ? errors : undefined,
  });
}
