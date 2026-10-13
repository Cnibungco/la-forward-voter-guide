import type {PageTopic} from '@/lib/guideSearch'

import styles from './PageContents.module.css'

/** Jump list for the offices and measures already on this page. Hidden when there is nothing to link. */
export function PageContents({items}: {items: PageTopic[]}) {
  if (items.length === 0) return null

  return (
    <nav className={styles.contents} aria-label="On this page">
      <h2 className={styles.heading}>On this page</h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.anchor}>
            <a href={`#${item.anchor}`}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
