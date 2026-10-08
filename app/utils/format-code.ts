// Lazy-loaded so js-beautify stays out of the main bundle.
async function loadBeautify() {
  const mod = await import('js-beautify')
  return mod.default ?? mod
}

export async function formatHtmlCode(source: string) {
  const { html } = await loadBeautify()
  return html(source, {
    indent_size: 2,
    wrap_line_length: 120,
    preserve_newlines: true,
    max_preserve_newlines: 1,
    indent_inner_html: true,
    extra_liners: [],
  })
}

export async function formatCssCode(source: string) {
  const { css } = await loadBeautify()
  return css(source, {
    indent_size: 2,
    newline_between_rules: true,
    preserve_newlines: true,
    max_preserve_newlines: 1,
  })
}

// Pipeline output arrives as one long line; real hand-formatted code rarely has 300+ char lines.
export function looksMinified(source: string) {
  return source.split('\n').some(line => line.length > 300)
}
