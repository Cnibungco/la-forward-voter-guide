'use client'

import {useEffect, useRef, type MouseEvent, type ReactNode} from 'react'

import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  titleId: string
  className?: string
  children: ReactNode
}

/**
 * Native `<dialog>` shell shared by the share and donate prompts.
 * Escape and focus trapping come from the browser; this only opens,
 * closes, and treats a backdrop click as a dismiss.
 */
export function Modal({open, onClose, titleId, className, children}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    try {
      if (open && !dialog.open) dialog.showModal()
      else if (!open && dialog.open) dialog.close()
    } catch {
      // A second modal can't open while another is already showing.
    }
  }, [open])

  function onBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) event.currentTarget.close()
  }

  return (
    <dialog
      ref={ref}
      className={className ? `${styles.dialog} ${className}` : styles.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={onBackdropClick}
    >
      {children}
    </dialog>
  )
}
