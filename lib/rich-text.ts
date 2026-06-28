/** True when value looks like TipTap / HTML markup rather than plain text. */
export function isRichTextHtml(value: string | undefined | null): boolean {
  if (!value) return false
  return /<[a-z][\s\S]*>/i.test(value.trim())
}

/** Strip tags for previews, slugs, and metadata. */
export function stripHtml(html: string | undefined | null): string {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Collapse empty editor output to an empty string for storage. */
export function normalizeRichText(html: string): string {
  const text = stripHtml(html)
  if (!text) return ''
  return html
}
