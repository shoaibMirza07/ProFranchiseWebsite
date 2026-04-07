'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ExternalLink, Loader2, Search } from 'lucide-react'
import Modal from '@/components/admin/Modal'
import ImageUpload from '@/components/admin/ImageUpload'
import Link from 'next/link'

interface Brand {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  logoUrl: string | null
  displayOnWeb: boolean
  order: number
  _count?: { locations: number }
}

const emptyBrand = {
  nameEn: '',
  nameAr: '',
  slug: '',
  logoUrl: '',
  displayOnWeb: true,
  order: 0,
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [form, setForm] = useState(emptyBrand)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/brands')
      const data = await res.json()
      setBrands(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyBrand)
    setModalOpen(true)
  }

  const openEdit = (b: Brand) => {
    setEditing(b)
    setForm({
      nameEn: b.nameEn,
      nameAr: b.nameAr,
      slug: b.slug,
      logoUrl: b.logoUrl ?? '',
      displayOnWeb: b.displayOnWeb,
      order: b.order,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nameEn || !form.nameAr || !form.slug) {
      setError('Name (EN), Name (AR), and Slug are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const url = editing ? `/api/brands/${editing.id}` : '/api/brands'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Save failed')
      }
      setModalOpen(false)
      fetchBrands()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save brand')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this brand? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/brands/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setBrands((prev) => prev.filter((b) => b.id !== id))
    } catch {
      setError('Failed to delete brand')
    }
  }

  const toggleDisplayOnWeb = async (brand: Brand) => {
    try {
      const res = await fetch(`/api/brands/${brand.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayOnWeb: !brand.displayOnWeb }),
      })
      if (!res.ok) throw new Error('Update failed')
      setBrands((prev) =>
        prev.map((b) => (b.id === brand.id ? { ...b, displayOnWeb: !brand.displayOnWeb } : b))
      )
    } catch {
      setError('Failed to update brand')
    }
  }

  const filtered = brands.filter((b) =>
    query
      ? b.nameEn.toLowerCase().includes(query.toLowerCase()) ||
        b.nameAr.includes(query) ||
        b.slug.includes(query.toLowerCase())
      : true
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">Manage franchise brands</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Brand
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brands..."
          className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 size={24} className="animate-spin text-[#009B91]" /></div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-400 text-sm">No brands found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0B4D32] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Logo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Name (EN)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Name (AR)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Locations</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">On Web</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt={brand.nameEn} className="h-10 w-10 object-contain rounded border border-gray-100" />
                    ) : (
                      <div className="h-10 w-10 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">?</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{brand.nameEn}</td>
                  <td className="px-4 py-3 text-gray-600" dir="rtl">{brand.nameAr}</td>
                  <td className="px-4 py-3 text-gray-500">{brand._count?.locations ?? 0}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleDisplayOnWeb(brand)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${brand.displayOnWeb ? 'bg-[#009B91]' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${brand.displayOnWeb ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/brands/${brand.id}`}
                        className="p-1.5 text-gray-400 hover:text-[#009B91] hover:bg-teal-50 rounded"
                        title="Edit details"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <button onClick={() => openEdit(brand)} className="p-1.5 text-gray-400 hover:text-[#009B91] hover:bg-teal-50 rounded">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(brand.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Brand' : 'Add Brand'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name (English) *</label>
              <input
                value={form.nameEn}
                onChange={(e) => {
                  const v = e.target.value
                  setForm((p) => ({ ...p, nameEn: v, slug: editing ? p.slug : slugify(v) }))
                }}
                className="input-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name (Arabic) *</label>
              <input value={form.nameAr} onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))} className="input-brand" dir="rtl" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug *</label>
            <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: slugify(e.target.value) }))} className="input-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <ImageUpload value={form.logoUrl} onChange={(url) => setForm((p) => ({ ...p, logoUrl: url }))} label="Upload Logo" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Order</label>
              <input type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} className="input-brand" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.displayOnWeb}
                  onChange={(e) => setForm((p) => ({ ...p, displayOnWeb: e.target.checked }))}
                  className="rounded"
                />
                Display on Website
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary py-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
