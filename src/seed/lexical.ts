/** Minimal helpers to build Lexical rich-text JSON for seeded content. */
type TextNode = {
  type: 'text'
  text: string
  format: number
  detail: 0
  mode: 'normal'
  style: ''
  version: 1
}

const text = (t: string, bold = false): TextNode => ({
  type: 'text',
  text: t,
  format: bold ? 1 : 0,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

type LexNode = { [k: string]: unknown; type: string; version: number }

const block = (type: string, children: LexNode[], extra: Record<string, unknown> = {}) => ({
  type,
  children,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  ...extra,
})

export type Block = { h2: string } | { h3: string } | { p: string } | { bold: string } | { ul: string[] }

export function richText(blocks: readonly Block[]) {
  const children: LexNode[] = blocks.map((b) => {
    if ('h2' in b) return block('heading', [text(b.h2)], { tag: 'h2' })
    if ('h3' in b) return block('heading', [text(b.h3)], { tag: 'h3' })
    if ('bold' in b) return block('paragraph', [text(b.bold, true)], { textFormat: 1, textStyle: '' })
    if ('ul' in b)
      return block(
        'list',
        b.ul.map((li, i) => block('listitem', [text(li)], { value: i + 1 })),
        { listType: 'bullet', start: 1, tag: 'ul' },
      )
    return block('paragraph', [text(b.p)], { textFormat: 0, textStyle: '' })
  })
  return { root: block('root', children) }
}
