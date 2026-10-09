import {PortableText as PortableTextRenderer, type PortableTextComponents} from '@portabletext/react'
import type {PortableTextBlock} from '@portabletext/types'
import type {ReactNode} from 'react'

import {safeHref} from '@/lib/safeHref'

import styles from './PortableText.module.css'

function linkHref(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || !('href' in value)) return undefined
  const href = (value as {href?: unknown}).href
  return typeof href === 'string' ? safeHref(href) : undefined
}

function LinkMark({children, value, className}: {children?: ReactNode; value?: unknown; className?: string}) {
  const href = linkHref(value)
  if (!href) return <>{children}</>
  const isInPage =
    href.startsWith('/') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')
  return (
    <a href={href} className={className} {...(isInPage ? {} : {rel: 'noreferrer noopener', target: '_blank'})}>
      {children}
    </a>
  )
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
    link: ({children, value}) => (
      <LinkMark className={styles.link} value={value}>
        {children}
      </LinkMark>
    ),
  },
}

const inlineComponents: PortableTextComponents = {
  block: {
    normal: ({children}) => <span>{children}</span>,
  },
  marks: {
    strong: ({children}) => <strong>{children}</strong>,
    link: ({children, value}) => <LinkMark value={value}>{children}</LinkMark>,
  },
}

interface PortableTextProps {
  value: PortableTextBlock[] | null
  /** Render each block as a span so a key-date row stays one line. */
  inline?: boolean
}

/**
 * Thin wrapper around @portabletext/react for the rich-text fields
 * editors fill in Studio (race context, entry reasoning, measure
 * write-ups). Renders nothing for empty/missing content rather than an
 * empty wrapper element. Bold (`strong`) and link annotations render as
 * `<strong>` and `<a href>` — not raw markup.
 */
export function PortableText({value, inline = false}: PortableTextProps) {
  if (!value || value.length === 0) return null

  return <PortableTextRenderer value={value} components={inline ? inlineComponents : components} />
}
