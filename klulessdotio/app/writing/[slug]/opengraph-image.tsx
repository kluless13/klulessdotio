import { readFile } from "node:fs/promises"
import path from "node:path"
import { ImageResponse } from "next/og"
import { notFound } from "next/navigation"
import { getPost, loadPosts } from "@/lib/writing/posts"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Post share image"

const INK = "#101A2E"
const SOFT = "rgba(16,26,46,0.6)"
const FONT = "Instrument Sans"

export function generateStaticParams() {
  return loadPosts().map((post) => ({ slug: post.slug }))
}

const dataUri = (mime: string, bytes: Buffer): string => `data:${mime};base64,${bytes.toString("base64")}`

async function readCover(slug: string, cover: string): Promise<string | null> {
  const file = path.join(process.cwd(), "public", "writing", slug, path.basename(cover))
  const mime = file.endsWith(".png") ? "image/png" : file.endsWith(".webp") ? "image/webp" : "image/jpeg"
  try {
    return dataUri(mime, await readFile(file))
  } catch (error) {
    console.error(`Share image: cover not readable for ${slug}`, error)
    return null
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  if (!post) notFound()
  const [font, sky, cover] = await Promise.all([
    readFile(path.join(process.cwd(), "assets/fonts/InstrumentSans-Medium.ttf")),
    readFile(path.join(process.cwd(), "assets/og/sky-day.jpg")),
    post.cover ? readCover(post.slug, post.cover) : Promise.resolve(null),
  ])

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: 1200, height: 630, position: "relative", fontFamily: FONT }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dataUri("image/jpeg", sky)} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0 }} />
        <div style={{ display: "flex", justifyContent: "space-between", width: 1200, height: 630, padding: 64 }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 590, padding: "8px 0" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 60, lineHeight: "66px", letterSpacing: "-0.025em", color: INK }}>{post.title}</div>
              <div style={{ fontSize: 24, lineHeight: "34px", color: SOFT, paddingTop: 18 }}>{post.description}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 20, lineHeight: "28px", color: INK }}>Angad Maniyambath</div>
              <div style={{ fontSize: 20, lineHeight: "28px", color: SOFT }}>{`1tx.dev/writing/${post.slug}`}</div>
            </div>
          </div>
          {cover ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 436,
                borderRadius: 36,
                background: "rgba(255,255,255,0.55)",
                border: "1.5px solid rgba(255,255,255,0.85)",
                boxShadow: "0 2px 4px rgba(20,30,60,0.06), 0 30px 60px rgba(20,30,60,0.12)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt="" width={396} style={{ borderRadius: 18 }} />
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: FONT, data: font, weight: 500, style: "normal" }] },
  )
}
