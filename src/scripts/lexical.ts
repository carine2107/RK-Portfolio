/**
 * Minimal helpers to build a Lexical editor state from plain text, used by the
 * seed script. Matches the serialised shape produced by the Payload editor.
 */

type TextNode = {
  type: 'text'
  text: string
  detail: 0
  format: 0
  mode: 'normal'
  style: ''
  version: 1
}

type BlockNode = {
  type: 'paragraph' | 'heading'
  tag?: 'h2' | 'h3'
  children: TextNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
  textFormat?: 0
}

export type LexicalState = {
  root: {
    type: 'root'
    children: BlockNode[]
    direction: 'ltr'
    format: ''
    indent: 0
    version: 1
  }
}

const text = (value: string): TextNode => ({
  type: 'text',
  text: value,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

/** `## Heading` becomes an h2, everything else a paragraph. */
export function lexicalFromParagraphs(paragraphs: string[]): LexicalState {
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((paragraph) =>
        paragraph.startsWith('## ')
          ? {
              type: 'heading',
              tag: 'h2',
              children: [text(paragraph.slice(3))],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            }
          : {
              type: 'paragraph',
              children: [text(paragraph)],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
              textFormat: 0,
            },
      ),
    },
  }
}

export function lexicalFromText(value: string): LexicalState {
  return lexicalFromParagraphs([value])
}
