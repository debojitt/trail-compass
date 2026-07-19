/* One-off: convert public/panoramas/*.png to quality-82 JPG and remove the PNGs. */
import { readdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const dir = new URL("../public/panoramas", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const files = (await readdir(dir)).filter((f) => f.toLowerCase().endsWith(".png"));
let before = 0;
let after = 0;

for (const file of files) {
  const src = join(dir, file);
  const dst = src.replace(/\.png$/i, ".jpg");
  before += (await stat(src)).size;
  await sharp(src).jpeg({ quality: 82, mozjpeg: true }).toFile(dst);
  after += (await stat(dst)).size;
  await unlink(src);
  console.log(`${file} -> ${file.replace(/\.png$/i, ".jpg")}`);
}

console.log(
  `Converted ${files.length} files: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`,
);
