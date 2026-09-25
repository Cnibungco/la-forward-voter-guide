'use client'

import {useEffect, useId, useState} from 'react'

import {Cta} from '@/components/Cta'
import {Modal} from '@/components/Modal'
import {
  SHARE_BODY,
  SHARE_BUTTON_LABEL,
  SHARE_CLOSE_LABEL,
  SHARE_COPIED_LABEL,
  SHARE_COPY_LABEL,
  SHARE_COPY_MANUAL,
  SHARE_DOWNLOAD_LABEL,
  SHARE_GRAPHIC_DOWNLOAD,
  SHARE_GRAPHIC_SRC,
  SHARE_HEAD,
  SHARE_HEADER_SHORT,
  SHARE_TEXT,
  SHARE_TITLE,
} from '@/lib/copy'
import {shareGuideText, shareGuideUrl} from '@/lib/shareGuide'

import styles from './ShareGuide.module.css'

export function ShareGuide() {
  const titleId = useId()
  const [open, setOpen] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const [graphicReady, setGraphicReady] = useState(true)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'manual'>('idle')

  useEffect(() => {
    setCanShare(typeof navigator.share === 'function')
  }, [])

  function onDialogClose() {
    setOpen(false)
    setCopyState('idle')
  }

  function close() {
    setOpen(false)
  }

  async function copyLink() {
    const text = shareGuideText(window.location.origin)
    try {
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
    } catch {
      setCopyState('manual')
    }
  }

  async function onShare() {
    const url = shareGuideUrl(window.location.origin)
    try {
      await navigator.share({title: SHARE_TITLE, text: SHARE_TEXT, url})
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      await copyLink()
    }
  }

  return (
    <div className={styles.wrap}>
      <Cta size="compact" ariaLabel={SHARE_HEAD} onClick={() => setOpen(true)}>
        <span className={styles.openShort}>{SHARE_HEADER_SHORT}</span>
        <span className={styles.openFull}>{SHARE_HEAD}</span>
      </Cta>
      <Modal open={open} onClose={onDialogClose} titleId={titleId} className={styles.dialog}>
        <h2 id={titleId} className={styles.head}>
          {SHARE_HEAD}
        </h2>
        <p className={styles.body}>{SHARE_BODY}</p>
        <p className={styles.line}>{SHARE_TEXT}</p>
        {graphicReady && (
          // The download link must serve this file as-is. next/image rewrites
          // the URL, and it will not render an SVG without extra config.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.graphic}
            src={SHARE_GRAPHIC_SRC}
            alt=""
            width={1200}
            height={630}
            onError={() => setGraphicReady(false)}
          />
        )}
        <div className={styles.actions}>
          {graphicReady && (
            <Cta variant="secondary" href={SHARE_GRAPHIC_SRC} download={SHARE_GRAPHIC_DOWNLOAD}>
              {SHARE_DOWNLOAD_LABEL}
            </Cta>
          )}
          {canShare && (
            <Cta onClick={onShare}>{SHARE_BUTTON_LABEL}</Cta>
          )}
          <Cta variant={canShare ? 'secondary' : 'gold'} onClick={copyLink}>
            {SHARE_COPY_LABEL}
          </Cta>
        </div>
        <p className={styles.status} role="status">
          {copyState === 'copied' ? SHARE_COPIED_LABEL : ''}
        </p>
        {copyState === 'manual' && (
          <p className={styles.manual}>
            <span>{SHARE_COPY_MANUAL}</span>{' '}
            <span className={styles.manualLink}>{shareGuideText(window.location.origin)}</span>
          </p>
        )}
        <button type="button" className={styles.dismiss} onClick={close} aria-label={SHARE_CLOSE_LABEL}>
          <span aria-hidden="true">×</span>
        </button>
      </Modal>
    </div>
  )
}
