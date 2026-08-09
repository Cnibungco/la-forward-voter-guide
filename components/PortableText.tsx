import {PortableText as PortableTextRenderer, type PortableTextComponents} from '@portabletext/react'
import type {PortableTextBlock} from '@portabletext/types'

import styles from './PortableText.module.css'

const components: PortableTextComponents = {
  block: {
    normal: ({children}) => <p className={styles.paragraph}>{children}</p>,
  },
  list: {
    bullet: ({children}) => <ul className={styles.list}>{children}</ul>,
    number: ({children}) => <ol className={styles.list}>{children}</ol>,
  },
}

interface PortableTextProps {
  value: PortableTextBlock[] | null
}

/**
 * Thin wrapper around @portabletext/react for the rich-text fields
 * editors fill in Studio (race context, entry reasoning, measure
 * pros/cons). Renders nothing for empty/missing content rather than an
 * empty wrapper element.
 */
export function PortableText({value}: PortableTextProps) {
  if (!value || value.length === 0) return null

  return <PortableTextRenderer value={value} components={components} />
}
