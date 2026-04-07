'use client'

import { useState, useEffect, useRef } from 'react'
import { Trash2, Loader2, Upload, Save, Eye, EyeOff } from 'lucide-react'

interface GalleryImage {
  id: string
  url: string
  captionEn: string | null
  captionAr: string | null
  order: number
  isActive: boolean
}

interface DirtyState {
  captionEn: string
  captionAr: string
  order: number
  isActive: boolean
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [dirty, setDirty] = useState<Record<string, DirtyState>>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/gallery')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const imgs: GalleryImage[] = Array.isArray(data) ? data : []
      setImages(imgs.sort((a, b) => a.order - b.order))
      // Initialize dirty state
      const initial: Record<string, DirtyState> = {}
      imgs.forEach((img) => {
        initial[img.id] = {
          captionEn: img.captionEn ?? '',
          captionAr: img.captionAr ?? '',
          order: img.order,
          isActive: img.isActive,
        }
      })
      setDirty(initial)
    } catch {
      setError('Failed to load gallery images.')
    } finally {
      setLoading(false)
    }
  }

  const updateDirty = (id: string, field: keyof DirtyState, value: string | number | boolean) => {
    setDirty((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: form })
      if (!uploadRes.ok) throw new Error('Upload failed')
      const { url } = await uploadRes.json()

      const addRes = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          captionEn: '',
          captionAr: '',
          order: images.length,
          isActive: true,
        }),
      })
      if (!addRes.ok) throw new Error('Failed to add image to gallery')
      await fetchImages()
      setSuccessMsg('Image uploaded successfully.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ''
  }

  const handleSaveAll = async () => {
    setSaving(true)
    setError('')
    try {
      const updates = images.map((img) => {
        const d = dirty[img.id]
        if (!d) return null
        return fetch(`/api/gallery/${img.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            captionEn: d.captionEn,
            captionAr: d.captionAr,
            order: d.order,
            isActive: d.isActive,
          }),
        })
      }).filter(Boolean)

      const results = await Promise.all(updates as Promise<Response>[])
      const failed = results.filter((r) => !r.ok)
      if (failed.length > 0) throw new Error(`${failed.length} image(s) failed to save.`)
      setSuccessMsg('All changes saved.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this image? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setImages((prev) => prev.filter((img) => img.id !== id))
      setDirty((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch {
      setError('Failed to delete image.')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">Manage gallery images</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-[#009B91] text-[#009B91] rounded-lg hover:bg-[#009B91]/5 font-semibold transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving || images.length === 0}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* Upload Drop Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#009B91] hover:bg-[#009B91]/5 transition-colors"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={32} className="animate-spin text-[#009B91]" />
            <p className="text-sm text-gray-500">Uploading image...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-gray-400" />
            <p className="text-sm font-medium text-gray-600">Click to upload a new image</p>
            <p className="text-xs text-gray-400">PNG, JPG, WebP supported</p>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-[#009B91]" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">No images in gallery. Upload one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => {
            const d = dirty[img.id]
            if (!d) return null
            return (
              <div
                key={img.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={img.url}
                    alt={d.captionEn || 'Gallery image'}
                    className="w-full h-[150px] object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      onClick={() => updateDirty(img.id, 'isActive', !d.isActive)}
                      className={`p-1.5 rounded-full shadow-sm transition-colors ${
                        d.isActive
                          ? 'bg-[#009B91] text-white hover:bg-[#008075]'
                          : 'bg-white text-gray-400 hover:bg-gray-100'
                      }`}
                      title={d.isActive ? 'Active - click to hide' : 'Hidden - click to show'}
                    >
                      {d.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="p-1.5 rounded-full bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Fields */}
                <div className="p-3 space-y-2">
                  <input
                    type="text"
                    value={d.captionEn}
                    onChange={(e) => updateDirty(img.id, 'captionEn', e.target.value)}
                    placeholder="Caption (English)"
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#009B91]"
                  />
                  <input
                    type="text"
                    value={d.captionAr}
                    onChange={(e) => updateDirty(img.id, 'captionAr', e.target.value)}
                    placeholder="التسمية بالعربية"
                    dir="rtl"
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#009B91]"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 shrink-0">Order:</label>
                    <input
                      type="number"
                      value={d.order}
                      onChange={(e) => updateDirty(img.id, 'order', parseInt(e.target.value) || 0)}
                      className="w-16 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#009B91]"
                    />
                    <span
                      className={`ml-auto text-xs font-medium px-1.5 py-0.5 rounded-full ${
                        d.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {d.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {images.length > 0 && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="btn-primary flex items-center gap-2 px-6 py-2 text-sm"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      )}
    </div>
  )
}
