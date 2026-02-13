import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

// Custom Icons
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

interface FeedItem {
  title: string
  link: string
  pubDate: string
  description: string
}

async function getSubstackFeed(): Promise<FeedItem[]> {
  try {
    const res = await fetch('https://deltaconfidence.substack.com/feed', {
      next: { revalidate: 3600 } // Revalidate every hour
    })

    if (!res.ok) {
      return []
    }

    const xml = await res.text()

    // Parse XML manually (simple approach)
    const items: FeedItem[] = []
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || []

    for (const itemXml of itemMatches) {
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        || itemXml.match(/<title>(.*?)<\/title>/)?.[1]
        || ''
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        || itemXml.match(/<description>(.*?)<\/description>/)?.[1]
        || ''

      if (title && link) {
        items.push({ title, link, pubDate, description })
      }
    }

    return items
  } catch (error) {
    console.error('Failed to fetch Substack feed:', error)
    return []
  }
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return ''
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').slice(0, 150) + '...'
}

export default async function WritingPage() {
  const articles = await getSubstackFeed()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/trufonomics logo111 - light mode.png"
              alt="Logo"
              className="h-6 w-6"
            />
            <span className="font-semibold text-lg hidden sm:inline">1tx.dev</span>
          </Link>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Link
              href="/portfolio"
              className="px-2 sm:px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Portfolio
            </Link>
            <Link
              href="/writing"
              className="px-2 sm:px-3 py-1.5 text-sm text-foreground font-medium"
            >
              Writing
            </Link>
            <div className="w-px h-4 bg-border mx-1 sm:mx-2" />
            <a
              href="https://github.com/kluless13"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <GitHubIcon />
            </a>
            <a
              href="https://twitter.com/onetrillionx"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-2xl font-bold mb-2">Writing</h1>
          <p className="text-muted-foreground">
            Research and essays on prediction markets, data, and systems.
          </p>
        </header>

        {/* Articles */}
        <section>
          {articles.length === 0 ? (
            <p className="text-muted-foreground">Loading articles...</p>
          ) : (
            <div className="space-y-8">
              {articles.map((article, i) => (
                <article key={i} className="group">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="flex items-baseline justify-between gap-4 mb-1">
                      <h2 className="font-medium group-hover:text-primary transition-colors">
                        {article.title}
                        <ArrowUpRight className="inline h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h2>
                      <span className="text-sm text-muted-foreground shrink-0">
                        {formatDate(article.pubDate)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stripHtml(article.description)}
                    </p>
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Substack CTA */}
        <section className="mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Subscribe for new research and essays.
          </p>
          <a
            href="https://deltaconfidence.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Subscribe on Substack
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </section>
      </main>
    </div>
  )
}
