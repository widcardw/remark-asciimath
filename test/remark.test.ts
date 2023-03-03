import { describe, it, expect } from 'vitest'
import { removePosition } from 'unist-util-remove-position'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { remarkAsciiMath } from '../lib'

const md = `
Here is a formula

\`\`\`am
int
\`\`\`

\`$"e"$\`
`

const md1 =`
\`\`\`am
lim_(n->oo)(1+1/n)^n="e"
\`\`\``

const md2 = `\`$int_0^(+oo)"e"^-x dx$\``

describe('remark', () => {
  it('should generate ast', () => {
    expect(removePosition(
      unified()
        .use(remarkParse)
        .use(remarkAsciiMath as any, { display: false })
        .parse(md)
    )).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "position": undefined,
                "type": "text",
                "value": "Here is a formula",
              },
            ],
            "position": undefined,
            "type": "paragraph",
          },
          {
            "lang": "am",
            "meta": null,
            "position": undefined,
            "type": "code",
            "value": "int",
          },
          {
            "children": [
              {
                "position": undefined,
                "type": "inlineCode",
                "value": "$\\"e\\"$",
              },
            ],
            "position": undefined,
            "type": "paragraph",
          },
        ],
        "position": undefined,
        "type": "root",
      }
    `)
  })

  it('should generate code', () => {
    const toHtml = unified()
      .use(remarkParse)
      .use(remarkAsciiMath as any, { display: false })
      .use(remarkRehype)
      .use(rehypeStringify)

    expect(toHtml.processSync(md1).toString()).toMatchInlineSnapshot('"<div class=\\"math math-display\\">\\\\lim _{ n \\\\to \\\\infty } \\\\left( 1 + \\\\frac{ 1 }{ n } \\\\right) ^{ n } = \\\\text{e}</div>"')
    expect(toHtml.processSync(md2).toString()).toMatchInlineSnapshot('"<p><span class=\\"math math-inline\\">\\\\int _{ 0 } ^{ + \\\\infty } \\\\text{e} ^{ {-x} } {\\\\text{d}x}</span></p>"')
  })
})