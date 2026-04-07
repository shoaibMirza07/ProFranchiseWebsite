'use client'

import { useRef, useState } from 'react'
import { X, Image as ImageIcon, Video } from 'lucide-react'

interface Props {
  value?: string
  onChange: (url: string) => void
  label?: string
  variant?: 'square' | 'banner'
}

export default function MediaUpload({ value, onChange, label = 'Upload Image or Video', variant = 'square' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const isVideo = value ? /\.(mp4|webm|ogg|mov)$/i.test(value) : false

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Please select an image or video file')
      return
    }
    setError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? `Upload failed (${res.status})`)
      onChange(data.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const previewCls = variant === 'banner'
    ? 'w-full h-40 object-cover rounded-lg border border-gray-200'
    : 'h-20 w-20 object-cover rounded-lg border border-gray-200'

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative">
          {isVideo ? (
            <video src={value} className={previewCls} muted controls />
          ) : (
            <img src={value} alt="Preview" className={previewCls} />
          )}
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm">
            <X size={12} />
          </button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#009B91] transition-colors text-center ${
            variant === 'banner' ? 'py-8 px-4' : 'p-4'
          }`}>
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-[#009B91] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <div className="flex gap-2">
                <ImageIcon size={18} />
                <Video size={18} />
              </div>
              <span className="text-sm font-medium text-gray-600">{label}</span>
              <span className="text-xs">Images &amp; videos accepted</span>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
    </div>
  )
}
