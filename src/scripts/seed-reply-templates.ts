/**
 * Adds the example reply templates (src/content/reply-templates.ts) in French,
 * German and English. Only missing templates are created, matched on their
 * name: existing templates, edited or not, are never changed.
 *
 *   npm run seed:reply-templates
 */
import 'dotenv/config'

import config from '@payload-config'
import { getPayload } from 'payload'

import { replyTemplateSeeds } from '../content/reply-templates'

const payload = await getPayload({ config })
let created = 0

for (const template of replyTemplateSeeds) {
  const existing = await payload.find({
    collection: 'reply-templates',
    where: { title: { equals: template.title } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.totalDocs > 0) {
    console.info(`= ${template.title} (already there, left unchanged)`)
    continue
  }

  const doc = await payload.create({
    collection: 'reply-templates',
    locale: 'fr',
    data: {
      title: template.title,
      subject: template.subject.fr,
      body: template.body.fr,
      requestTypes: (template.requestTypes ?? []) as never,
    },
    overrideAccess: true,
  })
  for (const locale of ['de', 'en'] as const) {
    await payload.update({
      collection: 'reply-templates',
      id: doc.id,
      locale,
      data: { subject: template.subject[locale], body: template.body[locale] },
      overrideAccess: true,
    })
  }
  created += 1
  console.info(`+ ${template.title}`)
}

console.info(`${created} reply template(s) added.`)
process.exit(0)
