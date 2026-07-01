'use client'

import { useRef, useState } from 'react'

const MAX_IMAGE_SIZE = 1 * 1024 * 1024 // 1 Mo

interface ImagePickerProps {
  onChange: (file: File | null) => void
}

export default function ImagePicker({ onChange }: ImagePickerProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_IMAGE_SIZE) {
      setError("L'image ne doit pas dépasser 1 Mo.")
      onChange(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setError(null)
    setPreview(URL.createObjectURL(file))
    onChange(file)
  }

  function handleRemoveImage() {
    setPreview(null)
    setError(null)
    onChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-2">
      {preview ? (
        <div className="relative w-fit">
          <img
            src={preview}
            alt="preview"
            className="max-h-32 rounded-lg object-cover border border-brand-border/40"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-fit text-brand-text/80 text-sm border border-brand-border/40 rounded-xl px-3 py-1.5 hover:border-brand-border transition-all"
        >
          📷 Ajouter une image
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}
