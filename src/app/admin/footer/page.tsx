'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'

interface FooterLink {
  id?: string
  labelEn: string
  labelAr: string
  href: string
  order: number
}

interface FooterSection {
  id?: string
  position: 'LEFT' | 'CENTER' | 'RIGHT'
  titleEn: string
  titleAr: string
  links: FooterLink[]
}

const emptySection = (position: 'LEFT' | 'CENTER' | 'RIGHT'): FooterSection => ({
  position,
  titleEn: '',
  titleAr: '',
  links: [],
})

const emptyLink = (): FooterLink => ({
  labelEn: '',
  labelAr: '',
  href: '',
  order: 0,
})

export default function FooterPage() {
  const [sections, setSections] = useState<FooterSection[]>([
    emptySection('LEFT'),
    emptySection('CENTER'),
    emptySection('RIGHT'),
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchFooter()
  }, [])

  const fetchFooter = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/footer')
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const mapped: FooterSection[] = (['LEFT', 'CENTER', 'RIGHT'] as const).map((pos) => {
          const existing = data.find((s: FooterSection) => s.position === pos)
          return existing ?? emptySection(pos)
        })
        setSections(mapped)
      }
    } catch {
      setError('Failed to load footer data')
    } finally {
      setLoading(false)
    }
  }

  const updateSection = (position: string, key: keyof FooterSection, value: unknown) => {
    setSections((prev) =>
      prev.map((s) => (s.position === position ? { ...s, [key]: value } : s))
    )
  }

  const addLink = (position: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.position === position
          ? { ...s, links: [...s.links, { ...emptyLink(), order: s.links.length }] }
          : s
      )
    )
  }

  const updateLink = (position: string, idx: number, key: keyof FooterLink, value: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.position === position
          ? {
              ...s,
              links: s.links.map((l, i) => (i === idx ? { ...l, [key]: value } : l)),
            }
          : s
      )
    )
  }

  const removeLink = (position: string, idx: number) => {
    setSections((prev) =>
      prev.map((s) =>
        s.position === position
          ? { ...s, links: s.links.filter((_, i) => i !== idx) }
          : s
      )
    )
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/footer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sections),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      fetchFooter()
    } catch {
      setError('Failed to save footer data')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#009B91]" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Footer</h1>
          <p className="text-sm text-gray-500 mt-1">Manage footer sections and links</p>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Footer'}
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
      {saved && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">Footer saved!</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div key={section.position} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0B4D32] text-white mb-3">
                {section.position}
              </span>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title (English)</label>
                  <input
                    value={section.titleEn}
                    onChange={(e) => updateSection(section.position, 'titleEn', e.target.value)}
                    placeholder="Quick Links"
                    className="input-brand text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title (Arabic)</label>
                  <input
                    value={section.titleAr}
                    onChange={(e) => updateSection(section.position, 'titleAr', e.target.value)}
                    placeholder="روابط سريعة"
                    className="input-brand text-sm"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Links</h3>
                <button
                  onClick={() => addLink(section.position)}
                  className="flex items-center gap-1 text-xs text-[#009B91] hover:text-[#007a71] font-medium"
                >
                  <Plus size={12} /> Add Link
                </button>
              </div>

              {section.links.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-3">No links yet</p>
              ) : (
                section.links.map((link, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Link {idx + 1}</span>
                      <button
                        onClick={() => removeLink(section.position, idx)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <input
                      value={link.labelEn}
                      onChange={(e) => updateLink(section.position, idx, 'labelEn', e.target.value)}
                      placeholder="Label (EN)"
                      className="input-brand text-xs py-1.5"
                    />
                    <input
                      value={link.labelAr}
                      onChange={(e) => updateLink(section.position, idx, 'labelAr', e.target.value)}
                      placeholder="Label (AR)"
                      className="input-brand text-xs py-1.5"
                      dir="rtl"
                    />
                    <input
                      value={link.href}
                      onChange={(e) => updateLink(section.position, idx, 'href', e.target.value)}
                      placeholder="/page"
                      className="input-brand text-xs py-1.5"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
