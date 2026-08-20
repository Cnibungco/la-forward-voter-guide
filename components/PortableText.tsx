import {PortableText as PortableTextRenderer, type PortableTextComponents} from '@portabletext/react'
import type {PortableTextBlock} from '@portabletext/types'

import styles from './PortableText.module.css'

function linkHref(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || !('href' in value)) return undefined
  const href = (value as {href?: unknown}).href
  if (typeof href !== 'string') return undefined
  const trimmed = href.trim()
  if (!trimmed) return undefined
  const lower = trimmed.toLowerCase()
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) return undefined
  return trimmed
}

const components: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className={styles.paragraph}>{children}</p>,
  },
  list: {
    bullet: ({children}) => <ul className={styles.list}>{children}</ul>,
    number: ({children}) => <ol className={styles.list}>{children}</ol>,
  },
  marks: {
    strong: ({children}) => <strong>{children}</strong>,
    link: ({children, value}) => {
      const href = linkHref(value)
      if (!href) return <>{children}</>
      const isInPage =
        href.startsWith('/') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')
      return (
        <a
          href={href}
          className={styles.link}
          {...(isInPage ? {} : {rel: 'noreferrer noopener', target: '_blank'})}
        >
          {children}
        </a>
      )
    },
  },
}

interface PortableTextProps {
  value: PortableTextBlock[] | null
}

/**
 * Thin wrapper around @portabletext/react for the rich-text fields
 * editors fill in Studio (race context, entry reasoning, measure
 * pros/cons). Renders nothing for empty/missing content rather than an
 * empty wrapper element. Bold (`strong`) and link annotations render as
 * `<strong>` and `<a href>` — not raw markup.
 */
export function PortableText({value}: PortableTextProps) {
  if (!value || value.length === 0) return null

  return <PortableTextRenderer value={value} components={components} />
}
