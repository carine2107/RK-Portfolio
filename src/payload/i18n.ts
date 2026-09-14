/**
 * Admin labels in the three interface languages.
 *
 * Payload accepts `Record<locale, string>` wherever a label, a description or
 * an option title is expected. Everything visible in the administration goes
 * through this helper so the CMS is never half French, half English.
 *
 * Argument order follows the site's own priority: French, German, English.
 */
export const tr = (fr: string, de: string, en: string): Record<string, string> => ({ fr, de, en })

/** Admin sidebar groups, shared by several collections. */
export const GROUPS = {
  content: tr('Contenus', 'Inhalte', 'Content'),
  insights: tr('RK Insights', 'RK Insights', 'RK Insights'),
  administration: tr('Administration', 'Verwaltung', 'Administration'),
  library: tr('Médiathèque', 'Medien', 'Library'),
  pages: tr('Pages', 'Seiten', 'Pages'),
  shop: tr('Boutique', 'Shop', 'Shop'),
} as const
