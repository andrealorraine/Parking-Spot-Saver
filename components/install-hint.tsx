'use client'

import { Share, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const DISMISS_KEY = 'pss:install-hint-dismissed'

type InstallPromptEvent = Event & { prompt: () => Promise<void> }

export function InstallHint() {
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null)
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null)

  useEffect(() => {
    let dismissed = false
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === '1'
    } catch {}
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (dismissed || standalone) return

    const ua = navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/i.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
    if (isIOS) setPlatform('ios')
    else if (/Android/i.test(ua)) setPlatform('android')

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as InstallPromptEvent)
      setPlatform('android')
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const dismiss = () => {
    setPlatform(null)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {}
  }

  if (!platform) return null

  return (
    <aside
      aria-label="Install app"
      className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-md px-safe"
    >
      <div className="flex items-center gap-3 rounded-lg border-2 border-foreground bg-card p-3 text-sm shadow-lg">
        <p className="flex-1 text-pretty">
          {platform === 'ios' ? (
            <>
              Add to Home Screen: tap <Share className="inline size-4 align-text-bottom" aria-label="Share" /> then{' '}
              <strong>Add to Home Screen</strong>.
            </>
          ) : (
            <>
              Add Parking Spot Saver to your <strong>Home Screen</strong> for one-tap access.
            </>
          )}
        </p>
        {platform === 'android' && promptEvent && (
          <button
            type="button"
            onClick={async () => {
              await promptEvent.prompt().catch(() => {})
              dismiss()
            }}
            className="h-10 rounded-md bg-primary px-3 font-display text-base font-bold uppercase text-primary-foreground"
          >
            Install
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="grid size-10 place-items-center rounded-md hover:bg-muted"
          aria-label="Dismiss install hint"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}
