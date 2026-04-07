'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings, Loader2, Globe, EyeOff, Eye } from 'lucide-react'
import Link from 'next/link'
import Modal from '@/components/admin/Modal'

interface SitePage {
  id: string
  titleEn: string
  titleAr: string | null
  slug: string
  isPublished: boolean
  isDefault?: boolean
}

const DEFAULT_PAGES: Omit<SitePage, 'id'>[] = [
  { titleEn: 'Home', titleAr: 'الرئيسية', slug: 'home', isPublished: true, isDefault: true },
  { titleEn: 'About', titleAr: 'من نحن', slug: 'about', isPublished: true, isDefault: true },
  { titleEn: 'Portfolio', titleAr: 'المحفظة', slug: 'portfolio', isPublished: true, isDefault: true },
  { titleEn: 'People', titleAr: 'الفريق', slug: 'people', isPublished: true, isDefault: true },
  { titleEn: 'Contact', titleAr: 'تواصل معنا', slug: 'contact', isPublished: true, isDefault: true },
]

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const emptyForm = { titleEn: '', titleAr: '', slug: '' }

export default function PagesPage() {
  const [pages, setPages] = useState<SitePage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pages')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const dbPages: SitePage[] = Array.isArray(data) ? data : []

      if (dbPages.length === 0) {
        // Show default pages as placeholders
        setPages(
          DEFAULT_PAGES.map((p, i) => ({
            ...p,
            id: `default-${i}`,
          }))
        )
      } else {
        setPages(dbPages)
      }
    } catch {
      // Fall back to defaults on error
      setPages(
        DEFAULT_PAGES.map((p, i) => ({ ...p, id: `default-${i}` }))
      )
    } finally {
      setLoading(false)
    }
  }

  const togglePublished = async (page: SitePage) => {
    if (page.id.startsWith('default-')) {
      setError('This is a placeholder page. Save it to the database first.')
      return
    }
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !page.isPublished }),
      })
      if (!res.ok) throw new Error('Update failed')
      setPages((prev) =>
        prev.map((p) => (p.id === page.id ? { ...p, isPublished: !page.isPublished } : p))
      )
    } catch {
      setError('Failed to update page status.')
    }
  }

  const handleAddPage = async () => {
    if (!form.titleEn.trim()) {
      setFormError('Title (English) is required.')
      return
    }
    if (!form.slug.trim()) {
      setFormError('Slug is required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isPublished: true }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Save failed')
      }
      setModalOpen(false)
      setForm(emptyForm)
      fetchPages()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to create page.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage website pages and their content sections</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setFormError(''); setModalOpen(true) }}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus size={16} /> Add Custom Page
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-[#009B91]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Globe size={16} className="text-[#0B4D32]" />
                    <h2 className="font-semibold text-gray-900">{page.titleEn}</h2>
                    {page.isDefault && (
                      <span className="text-xs bg-[#0B4D32]/10 text-[#0B4D32] px-1.5 py-0.5 rounded font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  {page.titleAr && (
                    <p className="text-sm text-gray-500" dir="rtl">{page.titleAr}</p>
                  )}
                  <code className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                    /{page.slug}
                  </code>
                </div>
                <button
                  onClick={() => togglePublished(page)}
                  className={`p-2 rounded-lg transition-colors ${
                    page.isPublished
                      ? 'text-[#009B91] bg-[#009B91]/10 hover:bg-[#009B91]/20'
                      : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                  }`}
                  title={page.isPublished ? 'Published — click to unpublish' : 'Hidden — click to publish'}
                >
                  {page.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    page.isPublished
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {page.isPublished ? 'Published' : 'Hidden'}
                </span>
                {!page.id.startsWith('default-') ? (
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#009B91] hover:text-[#008075] border border-[#009B91] rounded-lg px-3 py-1.5 hover:bg-[#009B91]/5 transition-colors"
                  >
                    <Settings size={12} />
                    Edit Sections
                  </Link>
                ) : (
                  <span className="text-xs text-gray-400 italic">Not in DB yet</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Page Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Custom Page"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title (English) <span className="text-red-500">*</span>
            </label>
            <input
              value={form.titleEn}
              onChange={(e) => {
                const v = e.target.value
                setForm((p) => ({ ...p, titleEn: v, slug: slugify(v) }))
              }}
              className="input-brand w-full"
              placeholder="Page title in English"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title (Arabic)</label>
            <input
              value={form.titleAr}
              onChange={(e) => setForm((p) => ({ ...p, titleAr: e.target.value }))}
              className="input-brand w-full"
              dir="rtl"
              placeholder="عنوان الصفحة بالعربية"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#009B91]">
              <span className="px-3 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">/</span>
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
                className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                placeholder="page-slug"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPage}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Creating...' : 'Create Page'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
