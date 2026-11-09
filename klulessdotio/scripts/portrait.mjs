// Converts the supplied portrait to the site image: node scripts/portrait.mjs
import sharp from "sharp"

const SOURCE = "docs/writing/design/angad-portrait.png"
const OUTPUT = "public/about/angad.jpg"

await sharp(SOURCE).resize(480, 480, { fit: "cover" }).grayscale().jpeg({ quality: 82 }).toFile(OUTPUT)
console.log(`wrote ${OUTPUT}`)
