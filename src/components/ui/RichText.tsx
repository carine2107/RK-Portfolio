import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { createElement } from 'react'

import { slugify } from '@/payload/fields/shared'
import type { RichContent } from '@/lib/types'

type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  children?: LexicalNode[]
  root?: LexicalNode
}

function nodeText(node: LexicalNode | undefined): string {
  if (!node) return ''
  let text = typeof node.text === 'string' ? node.text : ''
  if (Array.isArray(node.children)) text += node.children.map(nodeText).join('')
  return text
}

/** Headings of an article, used to build the table of contents. */
export function extractHeadings(content: RichContent): { id: string; text: string }[] {
  if (!content) return []

  if (content.kind === 'paragraphs') {
    return content.paragraphs
      .filter((paragraph) => paragraph.startsWith('## '))
      .map((paragraph) => {
        const text = paragraph.slice(3)
        return { id: slugify(text), text }
      })
  }

  const state = content.data as { root?: LexicalNode } | undefined
  const nodes = state?.root?.children ?? []
  return nodes
    .filter((node) => node.type === 'heading' && node.tag === 'h2')
    .map((node) => {
      const text = nodeText(node)
      return { id: slugify(text), text }
    })
    .filter((heading) => heading.text.length > 0)
}

/** Adds a stable id to every heading so the table of contents can link to it. */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const text = nodeText(node as LexicalNode)
    return createElement(node.tag, { id: slugify(text) }, children)
  },
})

/**
 * Renders rich content coming either from the CMS (Lexical editor state) or
 * from the built-in starter content (plain paragraphs, where a leading `## `
 * marks a heading).
 */
export function RichText({
  content,
  className = '',
}: {
  content: RichContent
  className?: string
}) {
  if (!content) return null

  if (content.kind === 'lexical') {
    return (
      <div className={`rk-prose ${className}`}>
        <LexicalRichText data={content.data as SerializedEditorState} converters={converters} />
      </div>
    )
  }

  return (
    <div className={`rk-prose ${className}`}>
      {content.paragraphs.map((paragraph, index) =>
        paragraph.startsWith('## ') ? (
          <h2 key={index} id={slugify(paragraph.slice(3))}>
            {paragraph.slice(3)}
          </h2>
        ) : (
          <p key={index}>{paragraph}</p>
        ),
      )}
    </div>
  )
}

/** Extracts a plain-text preview, used for meta descriptions. */
export function richTextToPlainText(content: RichContent, maxLength = 300): string {
  if (!content) return ''
  if (content.kind === 'paragraphs') {
    return content.paragraphs
      .filter((paragraph) => !paragraph.startsWith('## '))
      .join(' ')
      .slice(0, maxLength)
  }

  const state = content.data as { root?: LexicalNode } | undefined
  return nodeText(state?.root).replace(/\s+/g, ' ').trim().slice(0, maxLength)
}
