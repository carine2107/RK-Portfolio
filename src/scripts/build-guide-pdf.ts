/**
 * Builds the administrator guide as a PDF from docs/GUIDE_ADMIN.md:
 * cover page, clickable table of contents, PDF bookmarks, page numbers.
 *
 *   npm run guide:pdf            → docs/Guide_administrateur_RK.pdf
 *   npm run guide:pdf -- --html  → also writes the intermediate HTML (checks)
 *
 * Uses the Chromium shipped with Playwright (already used by the E2E tests).
 */
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

import { chromium } from '@playwright/test'
import { Marked, type Tokens } from 'marked'

const root = process.cwd()
const source = path.join(root, 'docs/GUIDE_ADMIN.md')
const output = path.join(root, 'docs/Guide_administrateur_RK.pdf')

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

const slug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

type Heading = { level: number; text: string; id: string }

function render(markdown: string): { title: string; intro: string; body: string; toc: Heading[] } {
  const toc: Heading[] = []
  const used = new Set<string>()
  let title = ''

  const marked = new Marked({ gfm: true })
  marked.use({
    renderer: {
      heading({ tokens, depth }: Tokens.Heading) {
        const html = this.parser.parseInline(tokens)
        const text = html.replace(/<[^>]+>/g, '')
        if (depth === 1) {
          title = text
          return ''
        }
        let id = slug(text) || 'section'
        while (used.has(id)) id += '-'
        used.add(id)
        if (depth <= 3) toc.push({ level: depth, text, id })
        return `<h${depth} id="${id}">${html}</h${depth}>`
      },
      // Section breaks are page breaks in print; the rules are not needed.
      hr() {
        return ''
      },
      link({ href, tokens }: Tokens.Link) {
        const text = this.parser.parseInline(tokens)
        // Other project documents are not in the PDF: keep their name only.
        if (!/^https?:\/\//.test(href) && !href.startsWith('#')) return text
        return `<a href="${escapeHtml(href)}">${text}</a>`
      },
    },
  })

  const html = marked.parse(markdown, { async: false })
  // Everything before the first section is the introduction of the cover page.
  const firstSection = html.indexOf('<h2')
  return {
    title,
    intro: firstSection > 0 ? html.slice(0, firstSection) : '',
    body: firstSection > 0 ? html.slice(firstSection) : html,
    toc,
  }
}

const CSS = `
@page { size: A4; margin: 18mm 16mm 20mm; }
:root { --navy: #14233a; --gold: #a8843a; --ink: #1f2933; --muted: #52606d; --line: #d9dee4; --soft: #f5f3ee; }
* { box-sizing: border-box; }
html { font-size: 10pt; }
body { margin: 0; color: var(--ink); font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; line-height: 1.5;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1, h2, h3, h4 { font-family: Georgia, "Times New Roman", serif; color: var(--navy); line-height: 1.25; break-after: avoid; }
h2 { font-size: 18pt; margin: 26pt 0 10pt; padding-bottom: 6pt; border-bottom: 2pt solid var(--gold); }
main > h2:first-child { margin-top: 0; }
/* Keep a heading with the start of its section (no orphan title at a page bottom). */
h2 + *, h3 + *, h4 + * { break-before: avoid; }
h3 { font-size: 13pt; margin: 16pt 0 6pt; }
h4 { font-size: 11pt; margin: 12pt 0 4pt; }
p { margin: 0 0 7pt; orphans: 3; widows: 3; }
ul, ol { margin: 0 0 8pt; padding-left: 16pt; }
li { margin: 2pt 0; }
a { color: var(--navy); text-decoration: underline; text-decoration-color: var(--gold); }
strong { color: var(--navy); }
code { font-family: Consolas, "Courier New", monospace; font-size: 8.6pt; background: var(--soft); border: 0.5pt solid var(--line);
  border-radius: 2pt; padding: 0 2pt; overflow-wrap: anywhere; }
pre { background: var(--soft); border: 0.5pt solid var(--line); border-radius: 3pt; padding: 7pt 9pt; white-space: pre-wrap; break-inside: avoid; }
pre code { border: 0; padding: 0; background: none; }
blockquote { margin: 8pt 0; padding: 7pt 10pt; border-left: 3pt solid var(--gold); background: var(--soft); break-inside: avoid; }
blockquote p:last-child { margin-bottom: 0; }
table { width: 100%; border-collapse: collapse; margin: 6pt 0 10pt; font-size: 8.6pt; break-inside: auto; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
th { background: var(--navy); color: #fff; text-align: left; font-weight: 600; }
th, td { padding: 4pt 6pt; border: 0.5pt solid var(--line); vertical-align: top; overflow-wrap: break-word; hyphens: manual; }
/* The first column holds short labels: never split them mid-word. */
th:first-child, td:first-child { min-width: 22mm; }
tbody tr:nth-child(even) td { background: #fafaf8; }
th strong { color: #fff; }

.cover { height: 257mm; display: flex; flex-direction: column; justify-content: space-between; break-after: page; }
.cover__band { background: var(--navy); color: #fff; margin: -18mm -16mm 0; padding: 34mm 16mm 22mm; }
.cover__mark { display: inline-flex; width: 16mm; height: 16mm; border: 1.2pt solid var(--gold); border-radius: 50%;
  align-items: center; justify-content: center; font-family: Georgia, serif; color: var(--gold); font-size: 15pt; letter-spacing: 1pt; }
.cover__eyebrow { margin: 12mm 0 3mm; color: var(--gold); text-transform: uppercase; letter-spacing: 2.5pt; font-size: 9pt; }
.cover h1 { color: #fff; font-size: 32pt; margin: 0; }
.cover__subtitle { margin: 4mm 0 0; font-size: 13pt; color: #dfe6ee; }
.cover__intro { font-size: 10.5pt; }
.cover__intro code { font-size: 10pt; }
.cover__meta { border-top: 1pt solid var(--line); padding-top: 4mm; color: var(--muted); font-size: 9pt; display: flex; justify-content: space-between; }

.toc { break-after: page; }
.toc h2 { break-before: auto; }
.toc ol { list-style: none; padding: 0; margin: 0; }
.toc li { margin: 0; }
.toc a { display: block; text-decoration: none; color: var(--ink); padding: 2.2pt 0; border-bottom: 0.5pt dotted var(--line); }
.toc .toc__h2 > a { font-weight: 600; color: var(--navy); margin-top: 5pt; }
.toc .toc__h3 > a { padding-left: 12pt; font-size: 9pt; color: var(--muted); }
`

function documentHtml(guide: ReturnType<typeof render>, version: string): string {
  const tocItems = guide.toc
    .map(
      (entry) =>
        // entry.text comes from marked: already HTML-escaped, tags removed.
        `<li class="toc__h${entry.level}"><a href="#${entry.id}">${entry.text}</a></li>`,
    )
    .join('')

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${escapeHtml(guide.title)} — Romial Kenmogne</title>
<style>${CSS}</style>
</head>
<body>
<section class="cover">
  <div class="cover__band">
    <span class="cover__mark">RK</span>
    <p class="cover__eyebrow">Site web Romial Kenmogne</p>
    <h1>Guide administrateur</h1>
    <p class="cover__subtitle">Gérer les contenus, les demandes et les ventes avec le RK CMS</p>
  </div>
  <div class="cover__intro">${guide.intro}</div>
  <div class="cover__meta"><span>Version du ${escapeHtml(version)}</span><span>© Nana-Consulting</span></div>
</section>
<nav class="toc" aria-label="Sommaire">
  <h2 id="sommaire">Sommaire</h2>
  <ol>${tocItems}</ol>
</nav>
<main>${guide.body}</main>
</body>
</html>`
}

async function main() {
  const markdown = readFileSync(source, 'utf8')
  const guide = render(markdown)
  const version = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date())
  const html = documentHtml(guide, version)

  if (process.argv.includes('--html')) {
    writeFileSync(output.replace(/\.pdf$/, '.html'), html)
  }

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.pdf({
      path: output,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      outline: true,
      tagged: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `<div style="width:100%;margin:0 16mm;font-family:Arial,sans-serif;font-size:7.5pt;color:#52606d;display:flex;justify-content:space-between;border-top:0.5pt solid #d9dee4;padding-top:2mm">
        <span>Romial Kenmogne — Guide administrateur</span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`,
    })
  } finally {
    await browser.close()
  }

  console.log(
    `Guide written to ${path.relative(root, output)} (${guide.toc.filter((h) => h.level === 2).length} sections)`,
  )
}

void main()
