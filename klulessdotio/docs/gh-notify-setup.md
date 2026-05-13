# GitHub → Telegram notifier — setup

A Vercel Cron job (every 1 minute) that polls GitHub for new notifications,
filters them by reason, and forwards anything interesting to your Telegram
chat. Lives entirely behind `/api/cron/notify`; never touches the public
site.

## Architecture at a glance

```
[Vercel Cron] every 60s
        ↓ GET /api/cron/notify  (with Authorization: Bearer ${CRON_SECRET})
[app/api/cron/notify/route.ts]
        ↓ load `gh:last_polled_at` from Upstash Redis (via Vercel marketplace)
        ↓ fetch GitHub /notifications?since={...}
        ↓ filter to mention | review_requested | team_mention | author | assign | security_alert
        ↓ POST Telegram sendMessage per notification
        ↓ save new `gh:last_polled_at` to KV
        ↓ return { ok, fetched, matched, sent, errors }
```

Files:

- `app/api/cron/notify/route.ts` — the endpoint
- `lib/github.ts` — GitHub Notifications API client + reason filtering + URL conversion
- `lib/telegram.ts` — minimal `sendMessage`
- `vercel.json` — declares the cron schedule

## One-time setup

### 1. GitHub Personal Access Token

Fine-grained PAT (recommended) at <https://github.com/settings/tokens?type=beta>:

- **Repository access**: All repositories
- **Account permissions**: Notifications → **Read**
- **Repository permissions**: Contents → Read-only, Issues → Read-only, Pull requests → Read-only

Classic alternative at <https://github.com/settings/tokens>: scopes `notifications` + `repo`.

Copy the token (starts with `github_pat_` or `ghp_`) — only shown once.

### 2. Telegram bot

1. DM [`@BotFather`](https://t.me/BotFather) → `/newbot` → follow prompts
2. Copy the token (`7234567890:AAH...`)
3. Find your bot (search the username you set), open chat, click **Start**, send it any message
4. In a browser, visit `https://api.telegram.org/bot<TOKEN>/getUpdates`
5. Find `"chat":{"id":123456789,...}` — copy that integer as your `TELEGRAM_CHAT_ID`

### 3. Cron secret

```bash
openssl rand -hex 32
```

Used to verify that incoming requests to `/api/cron/notify` came from Vercel Cron
(which auto-injects `Authorization: Bearer ${CRON_SECRET}`) and not from a
random caller hitting your URL.

### 4. Upstash Redis (via Vercel marketplace) — state storage

Vercel dashboard → klulessdotio project → **Storage** tab → **Create Database** → pick **Upstash** from the marketplace providers, then choose **Redis** as the database type:

- Name: any (e.g. `gh-notify-state` / auto-generated like `upstash-kv-camel-candle`)
- Region: nearest to your Vercel deploy region
- Connect to klulessdotio project, scope to Production + Preview + Development
- **Custom Prefix: `KV`** (default may be `STORAGE` — change it to `KV` so `Redis.fromEnv()` auto-detects without code config)
- Sensitive: ON

Vercel auto-injects `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`,
`KV_REST_API_READ_ONLY_TOKEN`. The `@upstash/redis` client's `Redis.fromEnv()`
picks these up via the Vercel-KV-compat fallback. No manual env-var entry
needed.

### 5. Set env vars in Vercel

Dashboard → klulessdotio → Settings → Environment Variables → add (Production +
Preview + Development scope):

| Name                    | Value                                                    |
| ----------------------- | -------------------------------------------------------- |
| `GH_NOTIFICATIONS_PAT`  | from step 1                                              |
| `TELEGRAM_BOT_TOKEN`    | from step 2                                              |
| `TELEGRAM_CHAT_ID`      | from step 2                                              |
| `CRON_SECRET`           | from step 3                                              |

The four `KV_*` vars are already auto-injected from step 4.

### 6. Deploy

Push to `main`; Vercel auto-deploys. After deployment:

- **Crons** tab in the project dashboard should show `/api/cron/notify` running every minute
- First firing might take up to 60 seconds. Subsequent runs are exactly on the minute boundary
- First message you'll get is anything from the previous 5 minutes that matched a notify-reason
- Steady state: each cron run sends 0-N messages and logs `{ fetched, matched, sent }` in the function logs

## Filter rules (default)

The route forwards notifications whose `reason` is in this set
(`lib/github.ts → NOTIFY_REASONS`):

- `mention` — someone @-mentioned you
- `team_mention` — a team you're in was @-mentioned
- `review_requested` — PR review request
- `author` — activity on a PR/issue you authored
- `assign` — you were assigned
- `security_alert` — Dependabot / code scanning

Edit `NOTIFY_REASONS` in `lib/github.ts` to tune.

## Telegram message format

Each notification becomes a single message:

```
🔔 Mentioned you
truflation/truflation-eps-markets · PullRequest
[Add EDGAR data source]   ← click-through link
```

HTML parse mode. `disable_web_page_preview: true` to avoid noisy embeds.

## Local development

```bash
# Pull the auto-injected Upstash Redis (via Vercel marketplace) vars + your other env vars
vercel env pull .env.local

# Run a one-off invocation (you need to set CRON_SECRET in .env.local
# matching what's in Vercel)
curl -H "Authorization: Bearer $(grep CRON_SECRET .env.local | cut -d= -f2)" \
     http://localhost:3000/api/cron/notify
```

## Operations

- **See cron history**: Vercel dashboard → Functions tab → filter to `/api/cron/notify`
- **Pause temporarily**: comment out the entry in `vercel.json` and redeploy, or delete the env var `GH_NOTIFICATIONS_PAT` (the route will 500, cron retries fail harmlessly)
- **Rotate the GitHub PAT**: regenerate at <https://github.com/settings/tokens>, update the env var in Vercel, redeploy
- **Reset state** (re-scan recent notifications): in Vercel dashboard → Storage → KV → delete the `gh:last_polled_at` key. Next cron run will treat it as a first run and look back 5 minutes
- **Debug a single notification**: hit the route manually with the cron secret; response JSON includes `fetched`, `matched`, `sent`, and any `errors`

## Cost

- Vercel Cron: included in Pro tier
- Upstash Redis (via Vercel marketplace): ~1 read + 1 write per minute = ~86k operations/month, well within the free tier's allowance
- GitHub API: 1 call per minute = 1,440 calls/day, far under the 5,000/hour authenticated rate limit
- Telegram API: only sends when there's something to send; no cost

## Known limits

- Only checks notifications updated in the last poll window; if Vercel Cron itself is delayed by minutes, that's the worst-case latency
- Doesn't dedupe across notification updates — if a thread you're subscribed to gets multiple new comments in the same minute, you may get multiple messages
- Doesn't mark-as-read on GitHub (intentional: leaves GitHub's web UI authoritative for read state)
- No quiet hours — every notification, every time. Add a check on `req.headers.get("x-vercel-cron-day-of-week")` if you want this
