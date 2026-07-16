'use client'

import { useEffect, useRef, useState } from 'react'

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    label: 'Visages',
    emojis: [
      '😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😜', '🤔', '😎',
      '😢', '😭', '😡', '😱', '🥳', '😴', '🤗', '🙄', '😇', '🤩',
    ],
  },
  {
    label: 'Gestes',
    emojis: [
      '👍', '👎', '👏', '🙌', '🙏', '💪', '👋', '🤝', '✌️', '🤞',
    ],
  },
  {
    label: 'Cœurs',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '💕',
    ],
  },
  {
    label: 'Fête & nature',
    emojis: [
      '🎉', '🎊', '🔥', '✨', '⭐', '🌟', '🌈', '☀️', '🌙', '🍀',
      '🍕', '🎂', '☕', '⚽', '🎵', '📸', '🚀', '💯', '✅', '❌',
    ],
  },
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative w-fit">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-fit text-brand-text/80 text-sm border border-brand-border/40 rounded-xl px-3 py-1.5 hover:border-brand-border transition-all"
      >
        😀 Emoji
      </button>

      {open && (
        <div className="absolute z-40 bottom-[calc(100%+8px)] left-0 bg-brand-card border border-brand-border shadow-neon rounded-2xl p-3 w-64 max-h-64 overflow-y-auto flex flex-col gap-2">
          {EMOJI_CATEGORIES.map((category) => (
            <div key={category.label} className="flex flex-col gap-1">
              <span className="text-brand-border text-xs">{category.label}</span>
              <div className="grid grid-cols-8 gap-1">
                {category.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onSelect(emoji)
                      setOpen(false)
                    }}
                    className="text-lg hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
