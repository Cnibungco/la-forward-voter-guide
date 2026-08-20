'use client'

import {useEffect, useState} from 'react'

import {isLongPage} from '@/lib/contentLength'

import styles from './BackToTop.module.css'

export const GUIDE_TOP_ID = 'guide-top'

/** Native jump-to-top link. Hidden until the page is long enough to need it. */
export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function update() {
      setVisible(isLongPage(document.documentElement.scrollHeight, window.innerHeight))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(document.body)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  if (!visible) return null

  return (
    <p className={styles.wrap}>
      <a href={`#${GUIDE_TOP_ID}`} className={styles.link}>
        Back to top
      </a>
    </p>
  )
}
