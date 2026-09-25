import Link from 'next/link'
import type {ReactNode} from 'react'

import styles from './Cta.module.css'

type CtaVariant = 'gold' | 'donate' | 'secondary'
type CtaSize = 'compact' | 'regular'

interface CtaShared {
  variant?: CtaVariant
  size?: CtaSize
  className?: string
  children: ReactNode
}

interface CtaButton extends CtaShared {
  href?: undefined
  onClick?: () => void
  ariaLabel?: string
  ariaExpanded?: boolean
}

interface CtaLink extends CtaShared {
  href: string
  /** Opens in a new tab. File downloads stay on this page. */
  external?: boolean
  download?: string
  onClick?: () => void
}

type CtaProps = CtaButton | CtaLink

function isLink(props: CtaProps): props is CtaLink {
  return typeof props.href === 'string'
}

/** Gold, donate, and outline actions used in the header, landing, and dialogs. */
export function Cta(props: CtaProps) {
  const variant = props.variant ?? 'gold'
  const size = props.size ?? 'regular'
  const className = [styles.cta, styles[variant], styles[size], props.className].filter(Boolean).join(' ')

  if (isLink(props)) {
    if (props.download) {
      return (
        <a href={props.href} className={className} download={props.download}>
          {props.children}
        </a>
      )
    }
    if (props.external) {
      return (
        <a
          href={props.href}
          className={className}
          target="_blank"
          rel="noopener noreferrer"
          onClick={props.onClick}
        >
          {props.children}
        </a>
      )
    }
    return (
      <Link href={props.href} className={className} onClick={props.onClick}>
        {props.children}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={className}
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      aria-expanded={props.ariaExpanded}
    >
      {props.children}
    </button>
  )
}
