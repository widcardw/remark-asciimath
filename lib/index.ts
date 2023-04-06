import { visit } from 'unist-util-visit'
import { is } from 'unist-util-is'
import { AsciiMath } from 'asciimath-parser'
import { Root } from 'mdast'

import type { AsciiMathConfig } from 'asciimath-parser'
import { Code } from 'mdast'
import { InlineCode } from 'mdast'
import { Plugin } from 'unified'

interface EscapeConfig {
  prefixes?: string | string[]
  inlineOpen?: string
  inlineClose?: string
}

type RestrictedEscapeConfig = Required<EscapeConfig>

type AmConfig = EscapeConfig & AsciiMathConfig

function createAsciiMathBlock(content: string, am: AsciiMath) {
  return {
    type: 'math',
    meta: null,
    value: content,
    data: {
      hName: 'div',
      hProperties: { className: ['math', 'math-display'] },
      hChildren: [{ type: 'text', value: am.toTex(content) }],
    },
  }
}

function createAsciiMathSpan(content: string, am: AsciiMath) {
  return {
    type: 'math',
    meta: null,
    value: content,
    data: {
      hName: 'span',
      hProperties: { className: ['math', 'math-inline'] },
      hChildren: [{ type: 'text', value: am.toTex(content) }],
    },
  }
}

function normalizePrefixes(prefixes?: string | string[]) {
  if (typeof prefixes === 'string')
    return [prefixes]

  else if (Array.isArray(prefixes))
    return prefixes

  return ['am', 'asciimath']
}

function visitCodeBlock(ast: Root, config: RestrictedEscapeConfig, am: AsciiMath) {
  const opening = config.inlineOpen.replace(/^\`+/, '')
  const closing = config.inlineClose.replace(/\`+$/, '')
  return visit(ast,
    (node) => {
      return (
        is(node, 'code')
        && (node as Code).lang
        && (config.prefixes.includes((node as Code).lang as string))
      )
      || (
        is(node, 'inlineCode')
        && (node as InlineCode).value.startsWith(opening)
        && (node as InlineCode).value.endsWith(closing)
      )
    },
    (node, index, parent) => {
      const { type, value } = node as Code | InlineCode
      let newNode
      if (type === 'code') {
        newNode = createAsciiMathBlock(value, am)
      }
      else if (type === 'inlineCode') {
        const v = value.slice(opening.length, -closing.length)
        newNode = createAsciiMathSpan(v, am)
      }
      if (newNode && parent && index !== null)
        parent.children.splice(index, 1, newNode as any)
    },
  )
}

export const remarkAsciiMath: Plugin<[AmConfig], Root> = (options: AmConfig = {}) => {
  const prefixes = normalizePrefixes(options.prefixes)
  const inlineOpen = options.inlineOpen || '`$'
  const inlineClose = options.inlineClose || '$`'
  const am = new AsciiMath(options)

  return function transformer(ast, vFile, next) {
    visitCodeBlock(ast, { prefixes, inlineClose, inlineOpen }, am)
    if (typeof next === 'function')
      return next(null, ast, vFile)
    return ast
  }
}
