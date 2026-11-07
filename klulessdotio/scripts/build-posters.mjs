// Turns the full-size posters into the small WebP files the site serves, and records their sizes.
// Run with: node scripts/build-posters.mjs
import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const ROOT = path.resolve(import.meta.dirname, "..")
const OUT = path.join(ROOT, "public/p")
const FULL_HEIGHT = 1600
const THUMB_HEIGHT = 180

const slugify = (value) => value.toLowerCase().replace(/\.[a-z]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

async function buildOne({ group, folder, file }) {
  const source = path.join(ROOT, "public/posters", folder, file)
  const slug = `${slugify(folder)}-${slugify(file)}`
  const image = sharp(source)
  const { width, height } = await image.metadata()
  const scale = Math.min(1, FULL_HEIGHT / height)
  const w = Math.round(width * scale)
  const h = Math.round(height * scale)
  await image.clone().resize({ width: w, height: h }).webp({ quality: 82 }).toFile(path.join(OUT, `${slug}.webp`))
  await image.clone().resize({ height: THUMB_HEIGHT }).webp({ quality: 72 }).toFile(path.join(OUT, `${slug}-t.webp`))
  return { slug, group, title: file.replace(/\.[a-z]+$/i, ""), w, h }
}

async function main() {
  const sources = JSON.parse(await fs.readFile(path.join(ROOT, "scripts/posters.source.json"), "utf8"))
  await fs.mkdir(OUT, { recursive: true })
  const manifest = []
  for (const source of sources) manifest.push(await buildOne(source))
  await fs.writeFile(path.join(ROOT, "lib/posters.manifest.json"), `${JSON.stringify(manifest, null, 1)}\n`)
  process.stdout.write(`Built ${manifest.length} posters\n`)
}

main().catch((error) => {
  process.stderr.write(`Poster build failed: ${error.message}\n`)
  process.exit(1)
})
