/**
 * Builds every project document as a PDF (docs/pdf/): cover page, clickable
 * table of contents, PDF bookmarks, page numbers. Source: the Markdown files,
 * which stay the reference — regenerate after any change.
 *
 *   npm run docs:pdf                 → all documents
 *   npm run docs:pdf -- GUIDE_ADMIN  → only the documents whose source matches
 *   npm run docs:pdf -- --html       → also writes the intermediate HTML (checks)
 *
 * Uses the Chromium shipped with Playwright (already used by the E2E tests).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

import { chromium } from '@playwright/test'
import { Marked, type Tokens } from 'marked'

type DocumentSpec = {
  source: string
  output: string
  title: string
  subtitle: string
  eyebrow: string
}

/** Reading order: the owner's documents first, then the technical ones. */
export const DOCUMENTS: DocumentSpec[] = [
  {
    source: 'docs/GUIDE_ADMIN.md',
    output: 'Guide_administrateur.pdf',
    eyebrow: 'Site web Romial Kenmogne',
    title: 'Guide administrateur',
    subtitle: 'Gérer les contenus, les demandes et les ventes avec le RK CMS',
  },
  {
    source: 'docs/ELEMENTS_A_FOURNIR.md',
    output: 'Elements_a_fournir.pdf',
    eyebrow: 'Site web Romial Kenmogne',
    title: 'Éléments à fournir',
    subtitle: 'Contenus, comptes et décisions attendus avant la mise en ligne',
  },
  {
    source: 'README.md',
    output: 'Presentation_du_projet.pdf',
    eyebrow: 'Documentation technique',
    title: 'Présentation du projet',
    subtitle: 'Stack, démarrage, structure et fonctionnalités livrées',
  },
  {
    source: 'docs/INSTALLATION.md',
    output: 'Installation.pdf',
    eyebrow: 'Documentation technique',
    title: 'Installation',
    subtitle: 'Mettre en place l’environnement de développement',
  },
  {
    source: 'docs/DEPLOIEMENT.md',
    output: 'Deploiement_et_exploitation.pdf',
    eyebrow: 'Documentation technique',
    title: 'Déploiement et exploitation',
    subtitle: 'Mise en ligne, sauvegarde, restauration et supervision',
  },
  {
    source: 'docs/CMS.md',
    output: 'Modele_de_contenu_CMS.pdf',
    eyebrow: 'Documentation technique',
    title: 'Modèle de contenu',
    subtitle: 'Référence des collections, réglages et règles d’accès du CMS',
  },
  {
    source: 'docs/DEPENDANCES.md',
    output: 'Dependances_et_couts.pdf',
    eyebrow: 'Documentation technique',
    title: 'Dépendances et coûts',
    subtitle: 'Bibliothèques, licences et coûts récurrents',
  },
  {
    source: 'docs/RAPPORT_TESTS.md',
    output: 'Rapport_de_tests.pdf',
    eyebrow: 'Recette',
    title: 'Rapport de tests',
    subtitle: 'Tests automatisés, contrôles manuels et recette visuelle',
  },
]

const root = process.cwd()
const outputDir = path.join(root, 'docs/pdf')

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

const slug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/<[^>]+>|&[^;]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

type Heading = { level: number; text: string; id: string }

function render(markdown: string): { intro: string; body: string; toc: Heading[] } {
  const toc: Heading[] = []
  const used = new Set<string>()

  const marked = new Marked({ gfm: true })
  marked.use({
    renderer: {
      heading({ tokens, depth }: Tokens.Heading) {
        const html = this.parser.parseInline(tokens)
        // The document title is on the cover page.
        if (depth === 1) return ''
        const text = html.replace(/<[^>]+>/g, '')
        let id = slug(text) || 'section'
        while (used.has(id)) id += '-'
        used.add(id)
        if (depth <= 3) toc.push({ level: depth, text, id })
        return `<h${depth} id="${id}">${html}</h${depth}>`
      },
      hr() {
        return ''
      },
      link({ href, tokens }: Tokens.Link) {
        const text = this.parser.parseInline(tokens)
        if (/^https?:\/\//.test(href) || href.startsWith('#')) {
          return `<a href="${escapeHtml(href)}">${text}</a>`
        }
        // Other project documents: name the matching PDF instead of a dead link.
        const target = DOCUMENTS.find((doc) =>
          href.replace(/^\.?\/?/, '').endsWith(path.basename(doc.source)),
        )
        return target ? `${text} <span class="ref">(${escapeHtml(target.output)})</span>` : text
      },
    },
  })

  const html = marked.parse(markdown, { async: false })
  const firstSection = html.indexOf('<h2')
  return {
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
h2 + *, h3 + *, h4 + * { break-before: avoid; }
h3 { font-size: 13pt; margin: 16pt 0 6pt; }
h4 { font-size: 11pt; margin: 12pt 0 4pt; }
p { margin: 0 0 7pt; orphans: 3; widows: 3; }
ul, ol { margin: 0 0 8pt; padding-left: 16pt; }
li { margin: 2pt 0; }
a { color: var(--navy); text-decoration: underline; text-decoration-color: var(--gold); }
.ref { color: var(--muted); font-size: 8.6pt; }
strong { color: var(--navy); }
code { font-family: Consolas, "Courier New", monospace; font-size: 8.6pt; background: var(--soft); border: 0.5pt solid var(--line);
  border-radius: 2pt; padding: 0 2pt; overflow-wrap: anywhere; }
pre { background: var(--soft); border: 0.5pt solid var(--line); border-radius: 3pt; padding: 7pt 9pt; white-space: pre-wrap;
  overflow-wrap: anywhere; break-inside: avoid; font-size: 8.4pt; line-height: 1.4; }
pre code { border: 0; padding: 0; background: none; font-size: inherit; }
blockquote { margin: 8pt 0; padding: 7pt 10pt; border-left: 3pt solid var(--gold); background: var(--soft); break-inside: avoid; }
blockquote p:last-child { margin-bottom: 0; }
table { width: 100%; border-collapse: collapse; margin: 6pt 0 10pt; font-size: 8.4pt; break-inside: auto; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
th { background: var(--navy); color: #fff; text-align: left; font-weight: 600; }
th, td { padding: 4pt 6pt; border: 0.5pt solid var(--line); vertical-align: top; overflow-wrap: break-word; hyphens: manual; }
td code { overflow-wrap: anywhere; }
th:first-child, td:first-child { min-width: 22mm; }
tbody tr:nth-child(even) td { background: #fafaf8; }
th strong, th code { color: #fff; background: none; border: 0; }

.cover { height: 257mm; display: flex; flex-direction: column; justify-content: space-between; break-after: page; }
.cover__band { background: var(--navy); color: #fff; margin: -18mm -16mm 0; padding: 34mm 16mm 22mm; }
.cover__mark { display: inline-flex; width: 16mm; height: 16mm; border: 1.2pt solid var(--gold); border-radius: 50%;
  align-items: center; justify-content: center; font-family: Georgia, serif; color: var(--gold); font-size: 15pt; letter-spacing: 1pt; }
.cover__eyebrow { margin: 12mm 0 3mm; color: var(--gold); text-transform: uppercase; letter-spacing: 2.5pt; font-size: 9pt; }
.cover h1 { color: #fff; font-size: 30pt; margin: 0; }
.cover__subtitle { margin: 4mm 0 0; font-size: 13pt; color: #dfe6ee; }
.cover__intro { font-size: 10.5pt; }
.cover__intro code { font-size: 10pt; }
.cover__meta { border-top: 1pt solid var(--line); padding-top: 4mm; color: var(--muted); font-size: 9pt; display: flex; justify-content: space-between; }

.toc { break-after: page; }
.toc ol { list-style: none; padding: 0; margin: 0; }
.toc li { margin: 0; }
.toc a { display: block; text-decoration: none; color: var(--ink); padding: 2.2pt 0; border-bottom: 0.5pt dotted var(--line); }
.toc .toc__h2 > a { font-weight: 600; color: var(--navy); margin-top: 5pt; }
.toc .toc__h3 > a { padding-left: 12pt; font-size: 9pt; color: var(--muted); }
`

function documentHtml(
  doc: DocumentSpec,
  content: ReturnType<typeof render>,
  version: string,
): string {
  // Short documents do not need a table of contents.
  const sections = content.toc.filter((entry) => entry.level === 2).length
  const tocItems = content.toc
    .map(
      (entry) => `<li class="toc__h${entry.level}"><a href="#${entry.id}">${entry.text}</a></li>`,
    )
    .join('')

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${escapeHtml(doc.title)} — Romial Kenmogne</title>
<style>${CSS}</style>
</head>
<body>
<section class="cover">
  <div class="cover__band">
    <span class="cover__mark">RK</span>
    <p class="cover__eyebrow">${escapeHtml(doc.eyebrow)}</p>
    <h1>${escapeHtml(doc.title)}</h1>
    <p class="cover__subtitle">${escapeHtml(doc.subtitle)}</p>
  </div>
  <div class="cover__intro">${content.intro}</div>
  <div class="cover__meta"><span>Version du ${escapeHtml(version)}</span><span>© Nana-Consulting</span></div>
</section>
${
  sections >= 3
    ? `<nav class="toc" aria-label="Sommaire">
  <h2 id="sommaire">Sommaire</h2>
  <ol>${tocItems}</ol>
</nav>`
    : ''
}
<main>${content.body}</main>
</body>
</html>`
}

async function main() {
  const args = process.argv.slice(2)
  const keepHtml = args.includes('--html')
  const filters = args.filter((arg) => !arg.startsWith('--'))
  const selected = filters.length
    ? DOCUMENTS.filter((doc) => filters.some((filter) => doc.source.includes(filter)))
    : DOCUMENTS
  if (selected.length === 0) throw new Error(`No document matches: ${filters.join(', ')}`)

  mkdirSync(outputDir, { recursive: true })
  const version = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date())
  const browser = await chromium.launch()

  try {
    for (const doc of selected) {
      const content = render(readFileSync(path.join(root, doc.source), 'utf8'))
      const html = documentHtml(doc, content, version)
      const output = path.join(outputDir, doc.output)
      if (keepHtml) writeFileSync(output.replace(/\.pdf$/, '.html'), html)

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
          <span>Romial Kenmogne — ${escapeHtml(doc.title)}</span>
          <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>`,
      })
      await page.close()
      console.log(`${path.relative(root, output)}  (${doc.source})`)
    }
  } finally {
    await browser.close()
  }
}

void main()
