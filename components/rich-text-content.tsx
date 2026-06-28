import type { ElementType } from 'react'
import { cn } from '@/lib/utils'
import { isRichTextHtml } from '@/lib/rich-text'

interface RichTextContentProps {
  html?: string | null
  className?: string
  /** Used when content is legacy plain text without HTML markup. */
  as?: ElementType
}

export function RichTextContent({ html, className, as: Tag = 'div' }: RichTextContentProps) {
  if (!html?.trim()) return null

  if (!isRichTextHtml(html)) {
    return <Tag className={className}>{html}</Tag>
  }

  return (
    <Tag
      className={cn('section-rich-text', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
