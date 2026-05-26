'use client'

import { useEffect } from 'react'

interface ErrorBannerProps {
  message: string
  type?: 'critical' | 'warning'
  position?: 'fixed' | 'relative'
  onClose?: () => void
  autoCloseDuration?: number // Optionnel : Fermeture automatique après X millisecondes
}

export default function ErrorBanner({
  message,
  type = 'critical',
  position = 'fixed',
  onClose,
  autoCloseDuration,
}: ErrorBannerProps) {
  
  useEffect(() => {
    if (autoCloseDuration && onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDuration)
      return () => clearTimeout(timer)
    }
  }, [autoCloseDuration, onClose])

  const borderAndBg =
    type === 'critical'
      ? 'bg-red-950/80 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
      : 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'

  const positioning =
    position === 'fixed'
      ? 'fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 animate-fadeIn'
      : 'relative w-full animate-fadeIn'

  return (
    <div
      className={`border p-4 rounded-xl font-sans text-sm flex items-center justify-between gap-3 backdrop-blur-sm transition-all duration-300 ${borderAndBg} ${positioning}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base shrink-0">{type === 'critical' ? '⚠️' : '🔔'}</span>
        <p className="leading-relaxed">{message}</p>
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="text-brand-text/50 hover:text-brand-text transition-colors text-lg leading-none p-1 font-bold"
          aria-label="Fermer l'alerte"
        >
          ×
        </button>
      )}
    </div>
  )
}