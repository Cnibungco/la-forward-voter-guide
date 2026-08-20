'use client'

import {useEffect, useState} from 'react'

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
 * Google Translate wraps text nodes in <font> tags, which React doesn't
 * know about. Without this, client navigations throw removeChild /
 * insertBefore errors and blank the page. See facebook/react#11538.
 */
function patchReactTranslateConflicts() {
  const flagged = window as Window & {__gtDomPatch?: boolean}
  if (flagged.__gtDomPatch) return
  flagged.__gtDomPatch = true

  const originalRemoveChild = Node.prototype.removeChild
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) return child
    return originalRemoveChild.call(this, child) as T
  }

  const originalInsertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) return newNode
    return originalInsertBefore.call(this, newNode, referenceNode) as T
  }
}

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
      <select
        id="site-language"
        className={styles.select}
        value={lang}
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
