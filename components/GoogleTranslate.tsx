'use client'

import {useEffect, useState} from 'react'

import {TRANSLATE_NOTE} from '@/lib/copy'

import styles from './GoogleTranslate.module.css'

const ELEMENT_ID = 'google_translate_element'

/** Native names so visitors can find their language without reading English. */
const LANGUAGES = [
  {code: 'en', label: 'English'},
  {code: 'es', label: 'Español'},
  {code: 'zh-CN', label: '中文 (简体)'},
  {code: 'zh-TW', label: '中文 (繁體)'},
  {code: 'ko', label: '한국어'},
  {code: 'hy', label: 'հայերեն'},
  {code: 'tl', label: 'Tagalog'},
  {code: 'vi', label: 'Tiếng Việt'},
  {code: 'fa', label: 'فارسی'},
  {code: 'ru', label: 'Русский'},
  {code: 'ar', label: 'العربية'},
  {code: 'ja', label: '日本語'},
  {code: 'th', label: 'ไทย'},
  {code: 'km', label: 'ភាសាខ្មែរ'},
  {code: 'hi', label: 'हिन्दी'},
] as const

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: {
      translate: {
        TranslateElement: new (
          options: {pageLanguage: string; autoDisplay?: boolean},
          elementId: string,
        ) => void
      }
    }
  }
}

/**
 * Two DOM cases crash React with "Cannot read properties of null (reading
 * 'removeChild')":
 * - Google Translate wraps text in <font> tags React doesn't know about
 *   (facebook/react#11538).
 * - React 19 removes preloads and stylesheets by calling
 *   node.parentNode.removeChild(node). If that node was already detached,
 *   parentNode is null.
 * A detached link, style, or script reports a no-op parent. Real elements
 * still report null when they are not in the document.
 */
const detachedParent = {
  removeChild<T extends Node>(child: T): T {
    return child
  },
  insertBefore<T extends Node>(node: T): T {
    return node
  },
  appendChild<T extends Node>(node: T): T {
    return node
  },
}

function patchReactTranslateConflicts() {
  const flagged = window as Window & {__gtDomPatch?: number}
  if (flagged.__gtDomPatch === 2) return
  flagged.__gtDomPatch = 2

  const parentNode = Object.getOwnPropertyDescriptor(Node.prototype, 'parentNode')
  if (parentNode?.get) {
    const readParent = parentNode.get
    Object.defineProperty(Node.prototype, 'parentNode', {
      configurable: true,
      enumerable: parentNode.enumerable,
      get() {
        const parent = readParent.call(this) as ParentNode | null
        if (parent) return parent
        const name = (this as Node).nodeName
        if (name === 'LINK' || name === 'STYLE' || name === 'SCRIPT') return detachedParent
        return null
      },
    })
  }

  const originalRemoveChild = Node.prototype.removeChild
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (!(this instanceof Node) || child.parentNode !== this) return child
    return originalRemoveChild.call(this, child) as T
  }

  const originalInsertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (!(this instanceof Node) || (referenceNode && referenceNode.parentNode !== this)) return newNode
    return originalInsertBefore.call(this, newNode, referenceNode) as T
  }
}

if (typeof window !== 'undefined') patchReactTranslateConflicts()

function initTranslate() {
  const mount = document.getElementById(ELEMENT_ID)
  if (!mount || mount.childElementCount > 0) return
  if (!window.google?.translate?.TranslateElement) return

  new window.google.translate.TranslateElement(
    {pageLanguage: 'en', autoDisplay: false},
    ELEMENT_ID,
  )
}

function readGoogTrans(): string {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/)
  return match?.[1] ?? 'en'
}

function writeGoogTrans(code: string) {
  const expires =
    code === 'en' ? 'Thu, 01 Jan 1970 00:00:00 GMT' : 'Fri, 31 Dec 9999 23:59:59 GMT'
  const value = code === 'en' ? '' : `/en/${code}`
  document.cookie = `googtrans=${value};path=/;expires=${expires}`
}

function applyLanguage(code: string) {
  writeGoogTrans(code)

  const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo')
  if (combo) {
    combo.value = code
    combo.dispatchEvent(new Event('change'))
    return
  }

  window.location.reload()
}

/**
 * Visible language picker we control, plus Google's engine in a hidden
 * mount. Google's own dropdown is unreliable in React (empty iframe menu,
 * race on the init callback) — this select always has options.
 */
export function GoogleTranslate() {
  const [lang, setLang] = useState('en')

  useEffect(() => {
    setLang(readGoogTrans())
    patchReactTranslateConflicts()
    window.googleTranslateElementInit = initTranslate

    if (!document.querySelector('script[data-google-translate]')) {
      const script = document.createElement('script')
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      script.dataset.googleTranslate = 'true'
      document.body.appendChild(script)
    } else {
      initTranslate()
    }
  }, [])

  return (
    <div className={`${styles.wrap} notranslate`} translate="no">
      <label className={styles.visuallyHidden} htmlFor="site-language">
        Translate this page
      </label>
      <span id="translate-note" className={styles.visuallyHidden}>
        {TRANSLATE_NOTE}
      </span>
      <select
        id="site-language"
        className={styles.select}
        value={lang}
        title={TRANSLATE_NOTE}
        aria-describedby="translate-note"
        onChange={(event) => {
          const next = event.target.value
          setLang(next)
          applyLanguage(next)
        }}
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
      <div id={ELEMENT_ID} className={styles.engine} />
    </div>
  )
}
