/**
 * Minimal GitHub Notifications API client.
 *
 * Endpoint: GET /notifications?since={ISO8601}&participating={true|false}
 * Auth: Bearer token (PAT with `notifications` + read scopes).
 *
 * Used by the cron route to fetch new notifications since the last poll.
 * Filtering by `reason` happens server-side (in route.ts), not here.
 */

const GH_API_BASE = "https://api.github.com";

export interface GithubNotification {
  id: string;
  unread: boolean;
  reason: string; // mention | review_requested | team_mention | author | assign | ...
  updated_at: string; // ISO 8601
  subject: {
    title: string;
    url: string; // API URL — convert via toWebUrl()
    latest_comment_url: string | null;
    type: string; // PullRequest | Issue | Commit | Release | Discussion | ...
  };
  repository: {
    full_name: string;
    html_url: string;
  };
}

/** Fetch notifications updated after `since` (ISO 8601). */
export async function fetchNotifications(
  since: string,
  token: string
): Promise<GithubNotification[]> {
  const url = `${GH_API_BASE}/notifications?since=${encodeURIComponent(since)}&all=false&participating=false&per_page=50`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "klulessdotio-gh-notify-bot/1.0",
    },
    // Force a fresh fetch on every cron invocation.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GitHub notifications ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as GithubNotification[];
}

/**
 * Convert a GitHub API URL (e.g. `https://api.github.com/repos/X/Y/pulls/123`)
 * to its user-facing web URL (`https://github.com/X/Y/pull/123`).
 *
 * Falls back to the repository's html_url if the pattern is unrecognized.
 */
export function toWebUrl(notification: GithubNotification): string {
  const apiUrl = notification.subject.url;
  const repoHtmlUrl = notification.repository.html_url;

  if (!apiUrl) return repoHtmlUrl;

  // https://api.github.com/repos/{owner}/{repo}/{kind}/{id}
  const m = apiUrl.match(/\/repos\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/);
  if (!m) return repoHtmlUrl;
  const [, owner, repo, kind, id] = m;

  switch (kind) {
    case "pulls":
      return `https://github.com/${owner}/${repo}/pull/${id}`;
    case "issues":
      return `https://github.com/${owner}/${repo}/issues/${id}`;
    case "commits":
      return `https://github.com/${owner}/${repo}/commit/${id}`;
    case "discussions":
      return `https://github.com/${owner}/${repo}/discussions/${id}`;
    case "releases":
      return `https://github.com/${owner}/${repo}/releases`;
    default:
      return repoHtmlUrl;
  }
}

/** Map GitHub's `reason` codes to human-friendly labels for Telegram messages. */
export function reasonLabel(reason: string): string {
  switch (reason) {
    case "mention":
      return "Mentioned you";
    case "team_mention":
      return "Team mention";
    case "review_requested":
      return "Review requested";
    case "author":
      return "Activity on your thread";
    case "assign":
      return "Assigned to you";
    case "security_alert":
      return "Security alert";
    case "comment":
      return "New comment";
    default:
      return reason;
  }
}

/** Default include-list of reasons that get pushed to Telegram. */
export const NOTIFY_REASONS = new Set<string>([
  "mention",
  "team_mention",
  "review_requested",
  "author",
  "assign",
  "security_alert",
]);
