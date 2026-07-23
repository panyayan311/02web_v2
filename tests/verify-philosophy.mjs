import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const philosophy = read("philosophy/index.html");
const home = read("index.html");
const css = read("assets/css/philosophy.css");
const siteCss = read("assets/css/style.css");
const motion = read("assets/js/philosophy-motion.js");
const field = read("assets/js/vx-field.js");
const sitemap = read("sitemap.xml");
const profilePhoto = readFileSync(new URL("../assets/img/isshin-ando.webp", import.meta.url));

const requiredCopy = [
  "VX — Vibes Transformation",
  "変革は、熱で完成する。",
  "「やらされる変革」を、",
  "「やりたくなる変革」へ。",
  "現場に入る。",
  "まず、動かす。",
  "人が動く理由まで、設計する。",
  "仕組みとして残す。",
  "根づくまで、やり切る。",
  "求めよ！さらば与えられん。",
  "尋ねよ！さらば見出さん。",
  "扉を叩け！さらば開かれん。",
];

requiredCopy.forEach((copy) => {
  assert.ok(philosophy.includes(copy), `missing copy: ${copy}`);
});

assert.match(philosophy, /<h1[\s>]/, "Philosophy needs one h1");
assert.equal((philosophy.match(/<h1[\s>]/g) || []).length, 1, "Philosophy needs exactly one h1");
assert.ok(philosophy.includes('id="founder-title">答えは、<br>動いた先にある。</h2>'), "founder principle headline regressed");

[
  "why-vx",
  "evolution",
  "mission",
  "values",
  "method",
  "founder-principle",
  "philosophy-contact",
].forEach((id) => {
  assert.ok(philosophy.includes(`id="${id}"`), `missing section: ${id}`);
});

assert.ok(home.includes('href="/philosophy/"'), "homepage must link to Philosophy");
assert.ok(home.includes('class="profile-photo"') && home.includes('src="/assets/img/isshin-ando.webp"'), "profile photo must be rendered");
assert.ok(profilePhoto.byteLength < 100 * 1024, "profile photo must stay web-optimized");
assert.ok(sitemap.includes("https://zerotwo.tokyo/philosophy/"), "sitemap must include Philosophy");
assert.ok(css.includes("prefers-reduced-motion: reduce"), "CSS needs reduced-motion fallback");
assert.match(css, /\.vx-hero h1 span:first-child\s*\{[^}]*letter-spacing:\s*-\.025em;/s, "VIBES tracking regression");
assert.match(siteCss, /\.philosophy-node\s*\{[^}]*font-variant-numeric:tabular-nums;[^}]*letter-spacing:0;/s, "journey number centering regression");
assert.match(siteCss, /@media \(max-width: 680px\)[\s\S]*?\.profile-photo\s*\{\s*width:min\(100%,22rem\);\s*\}/, "mobile profile balance regression");
assert.ok(motion.includes("IntersectionObserver"), "motion needs viewport orchestration");
assert.ok(field.includes("1000 / 18") && field.includes("1000 / 24"), "WebGL fps budgets must be explicit");
assert.ok(Buffer.byteLength(motion) + Buffer.byteLength(field) < 30 * 1024, "Philosophy JS exceeds 30KB");

const publicExtensions = new Set([".html", ".css", ".js", ".xml", ".md"]);
const collect = (dir) => readdirSync(new URL(`../${dir}`, import.meta.url), { withFileTypes: true }).flatMap((entry) => {
  const relative = join(dir, entry.name);
  if (relative.startsWith("docs/") || relative.startsWith("tests/")) return [];
  if (entry.isDirectory()) return collect(relative);
  return publicExtensions.has(extname(entry.name)) ? [relative] : [];
});

const publicText = collect(".").map((file) => read(file)).join("\n");
assert.ok(!publicText.includes("GoatFamilia"), "ended business name found");
assert.ok(!publicText.includes("株式会社ギアーズ"), "forbidden company name found");
assert.ok(home.includes("年商2億円規模") && home.includes("¥200M"), "confirmed achievement was removed");

console.log("Philosophy contract verified.");
