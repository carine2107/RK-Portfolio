/**
 * Imports the assets supplied by the client into the CMS:
 *   - the professional photographs (hero, About page, media library);
 *   - the book cover, linked to the book entry, and the book texts;
 *   - the author biography, only while the About page still holds the
 *     placeholder text (an edited biography is never overwritten).
 *
 *   npm run import:assets -- "<folder with RK.jpeg, RK1.jpeg, RK2.jpeg>" "<cover image>"
 *
 * Client photographs are deliberately NOT stored in the Git repository: they
 * live in the CMS media library (and its backups) only.
 * Idempotent: running it twice reuses the files already uploaded.
 */
import 'dotenv/config'

import { readFile } from 'fs/promises'
import path from 'path'

import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import { starterAbout, starterBooks } from '../content/starter'
import { upsertBook } from './books'
import { lexicalFromParagraphs } from './lexical'
import { writeAboutProfileRows } from './rows'

type Locale = 'en' | 'fr' | 'de'
type Alt = Record<Locale, string>

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

/** SEO-friendly file names and alternative texts in the three languages. */
const PHOTOS: { source: string; name: string; alt: Alt }[] = [
  {
    source: 'RK.jpeg',
    name: 'romial-kenmogne-conseiller-financier.jpg',
    alt: {
      fr: 'Romial Kenmogne, en costume bleu marine et cravate rouge, dans un bureau lumineux',
      de: 'Romial Kenmogne im dunkelblauen Anzug mit roter Krawatte in einem hellen Büro',
      en: 'Romial Kenmogne in a navy suit and red tie in a bright office',
    },
  },
  {
    source: 'RK1.jpeg',
    name: 'romial-kenmogne-portrait.jpg',
    alt: {
      fr: 'Portrait de Romial Kenmogne en costume bleu',
      de: 'Porträt von Romial Kenmogne im blauen Anzug',
      en: 'Portrait of Romial Kenmogne in a blue suit',
    },
  },
  {
    source: 'RK2.jpeg',
    name: 'romial-kenmogne-business-consultant.jpg',
    alt: {
      fr: 'Romial Kenmogne en costume sombre, une tasse de café à la main',
      de: 'Romial Kenmogne im dunklen Anzug mit einer Tasse Kaffee',
      en: 'Romial Kenmogne in a dark suit holding a cup of coffee',
    },
  },
]

const COVER_ALT: Alt = {
  fr: 'Couverture du livre « Réussir son premier achat immobilier en Europe », tome 1, de Romial Kenmogne',
  de: 'Cover des Buchs „Réussir son premier achat immobilier en Europe“, Band 1, von Romial Kenmogne',
  en: 'Cover of the book “Réussir son premier achat immobilier en Europe”, volume 1, by Romial Kenmogne',
}

/** Uploads a file once; later runs find it by name and only refresh the alt texts. */
async function uploadImage(payload: Payload, filePath: string, name: string, alt: Alt) {
  const stem = path.parse(name).name
  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    where: { filename: { like: stem } },
    overrideAccess: true,
  })

  let id = existing.docs[0]?.id
  if (id === undefined) {
    const data = await readFile(filePath)
    const created = await payload.create({
      collection: 'media',
      locale: 'en',
      overrideAccess: true,
      data: { alt: alt.en },
      file: {
        data,
        name,
        size: data.length,
        mimetype: MIME[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      },
    })
    id = created.id
    console.log(`· Uploaded ${name}`)
  } else {
    console.log(`· Reusing ${name}`)
  }

  for (const locale of ['en', 'fr', 'de'] as const) {
    await payload.update({
      collection: 'media',
      id,
      locale,
      overrideAccess: true,
      data: { alt: alt[locale] },
    })
  }

  return id
}

/** True while the About page still shows the bracketed starter placeholder. */
function isPlaceholderRichText(value: unknown): boolean {
  if (!value || typeof value !== 'object') return true
  const text = JSON.stringify(value)
  return (
    text.includes('[Executive biography') ||
    text.includes('[Biographie') ||
    text.includes('[Executive Biografie')
  )
}

async function main(): Promise<void> {
  const [folderArg, coverArg] = process.argv.slice(2)
  if (!folderArg) {
    console.error('Usage: npm run import:assets -- "<photos folder>" "<cover image>"')
    process.exit(1)
  }

  const payload = await getPayload({ config })
  console.log('Importing client assets…')

  const [hero, portrait] = await Promise.all(
    PHOTOS.slice(0, 2).map((photo) =>
      uploadImage(payload, path.join(folderArg, photo.source), photo.name, photo.alt),
    ),
  )
  const extra = PHOTOS[2]
  if (extra) await uploadImage(payload, path.join(folderArg, extra.source), extra.name, extra.alt)

  await payload.updateGlobal({
    slug: 'home-page',
    overrideAccess: true,
    data: { heroPortrait: hero } as never,
  })
  console.log('· Home page hero photograph set')

  const about = await payload.findGlobal({ slug: 'about-page', locale: 'fr', overrideAccess: true })
  // Rewrites the languages/regions rows in the three languages (see rows.ts).
  await writeAboutProfileRows(payload)
  await payload.updateGlobal({
    slug: 'about-page',
    locale: 'en',
    overrideAccess: true,
    data: { portrait } as never,
  })
  console.log('· About page portrait set')

  if (isPlaceholderRichText((about as { biography?: unknown }).biography)) {
    for (const locale of ['en', 'fr', 'de'] as const) {
      await payload.updateGlobal({
        slug: 'about-page',
        locale,
        overrideAccess: true,
        data: { biography: lexicalFromParagraphs(starterAbout.biography[locale]) } as never,
      })
    }
    console.log('· Author biography written (FR / DE / EN)')
  } else {
    console.log('· Biography already edited in the CMS — left untouched')
  }

  const book = starterBooks[0]
  if (book) {
    const coverId = coverArg
      ? await uploadImage(
          payload,
          coverArg,
          'reussir-son-premier-achat-immobilier-en-europe-couverture.png',
          COVER_ALT,
        )
      : undefined
    await upsertBook(payload, book, { coverId, legacySlugs: ['understand-money'] })
    console.log(`· Book updated: ${book.title.fr}`)
  }

  console.log('Done.')
  process.exit(0)
}

main().catch((error) => {
  console.error('Import failed:', error)
  process.exit(1)
})
