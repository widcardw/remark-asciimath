# remark asciimath

Transform AsciiMath codeblock and inline code (wrapped with \`\$ and \$\`) to `math-display` and `math-inline`.

## How to use

This plugin is ESM only. You can install it with package manager.

```sh
pnpm i remark-asciimath
```

Then use this plugin.

```js
unified()
  .use(remarkParse)
  .use(remarkAsciiMath as any, { display: false })
  .use(remarkRehype)
  .use(rehypeStringify)
  .processSync('.....')
```

This plugin works like [`remark-math`](https://github.com/remarkjs/remark-math/tree/main/packages/remark-math). If your markdown looks like

~~~md
```am
lim_(n->oo)(1+1/n)^n="e"
```
~~~

It yields

```html
<div class="math math-display">\lim _{ n \to \infty } \left( 1 + \frac{ 1 }{ n } \right) ^{ n } = \text{e}</div>
```

It also supports inline formula.

```
`$int_0^(+oo)"e"^-x dx$`
```

The result

```html
<p><span class="math math-inline">\int _{ 0 } ^{ + \infty } \text{e} ^{ {-x} } {\text{d}x}</span></p>
```

As a result, if you want to display math in DOM, please use [`rehype-katex`](https://www.npmjs.com/package/rehype-katex) also.

## Configuration

```ts
interface AmConfig {
  /**
   * codeblock languages
   * @default ['am', 'asciimath']
   */
  prefixes?: string | string[]
  /**
   * Leading escape of inline formula
   * @default `$
   */
  inlineOpen?: string
  /**
   * Trailing escape of inline formula
   * @default $`
   */
  inlineClose?: string
  /**
   * Whether to enable displayMode
   * @default true
   */
  display?: boolean
  /**
   * Extend const tokens
   */
  extConst?: [string, string][]
  /**
   * Replace expressions before process
   */
  replaceBeforeTokenizing?: [RegExp | string, string | ((substring: string, ...args: any[]) => string)][]
}
```

