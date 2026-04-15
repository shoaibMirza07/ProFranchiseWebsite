'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, Search, Eye, ExternalLink } from 'lucide-react'
import Modal from '@/components/admin/Modal'
import ImageUpload from '@/components/admin/ImageUpload'

interface Partner {
  id: string
  nameEn: string
  nameAr: string
  descriptionEn: string | null
  descriptionAr: string | null
  logoUrl: string | null
  websiteUrl: string | null
  displayOnWeb: boolean
  order: number
}

const emptyForm = {
  nameEn: '',
  nameAr: '',
  descriptionEn: '',
  descriptionAr: '',
  logoUrl: '',
  websiteUrl: '',
  displayOnWeb: true,
  order: 0,
}

function Initials({ name }: { name: string }) {
  const letters = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div className="h-[50px] w-[50px] rounded border border-gray-200 bg-[#0B4D32]/10 flex items-center justify-center text-[#0B4D32] text-xs font-bold">
      {letters || '?'}
    </div>
  )
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Partner | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [viewPartner, setViewPartner] = useState<Partner | null>(null)

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/partners')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPartners(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load partners.')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (p: Partner) => {
    setEditing(p)
    setForm({
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      descriptionEn: p.descriptionEn ?? '',
      descriptionAr: p.descriptionAr ?? '',
      logoUrl: p.logoUrl ?? '',
      websiteUrl: p.websiteUrl ?? '',
      displayOnWeb: p.displayOnWeb,
      order: p.order,
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nameEn.trim()) {
      setFormError('Name (English) is required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const url = editing ? `/api/partners/${editing.id}` : '/api/partners'
      const method = editing ? 'PUT' : 'POST'
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
      fetchPartners()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to save partner.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this partner? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/partners/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setPartners((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setError('Failed to delete partner.')
    }
  }

  const toggleDisplayOnWeb = async (partner: Partner) => {
    try {
      const res = await fetch(`/api/partners/${partner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...partner, displayOnWeb: !partner.displayOnWeb }),
      })
      if (!res.ok) throw new Error('Update failed')
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? { ...p, displayOnWeb: !partner.displayOnWeb } : p))
      )
    } catch {
      setError('Failed to update partner.')
    }
  }

  const filtered = partners.filter((p) =>
    query
      ? p.nameEn.toLowerCase().includes(query.toLowerCase()) ||
        p.nameAr.includes(query)
      : true
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage partner organisations</p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus size={16} /> Add Partner
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search partners..."
          className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B91]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 size={28} className="animate-spin text-[#009B91]" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-gray-400 text-sm">No partners found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0B4D32] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Logo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name (EN)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name (AR)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">On Web</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {partner.logoUrl ? (
                      <img
                        src={partner.logoUrl}
                        alt={partner.nameEn}
                        width={50}
                        height={50}
                        className="h-[50px] w-[50px] object-contain rounded border border-gray-100"
                      />
                    ) : (
                      <Initials name={partner.nameEn} />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{partner.nameEn}</td>
                  <td className="px-4 py-3 text-gray-600" dir="rtl">{partner.nameAr}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleDisplayOnWeb(partner)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                        partner.displayOnWeb ? 'bg-[#009B91]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          partner.displayOnWeb ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{partner.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewPartner(partner)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => openEdit(partner)}
                        className="p-1.5 text-gray-400 hover:text-[#009B91] hover:bg-teal-50 rounded"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(partner.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        title="Delete"
                      >
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

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Partner' : 'Add Partner'}
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                value={form.nameEn}
                onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))}
                className="input-brand w-full"
                placeholder="Partner name in English"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name (Arabic)</label>
              <input
                value={form.nameAr}
                onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))}
                className="input-brand w-full"
                dir="rtl"
                placeholder="اسم الشريك بالعربية"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (English)</label>
            <textarea
              value={form.descriptionEn}
              onChange={(e) => setForm((p) => ({ ...p, descriptionEn: e.target.value }))}
              rows={3}
              className="input-brand w-full resize-none"
              placeholder="Brief description in English"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Arabic)</label>
            <textarea
              value={form.descriptionAr}
              onChange={(e) => setForm((p) => ({ ...p, descriptionAr: e.target.value }))}
              rows={3}
              className="input-brand w-full resize-none"
              dir="rtl"
              placeholder="وصف مختصر بالعربية"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Website URL</label>
            <input
              value={form.websiteUrl}
              onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))}
              className="input-brand w-full"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <ImageUpload
              value={form.logoUrl}
              onChange={(url) => setForm((p) => ({ ...p, logoUrl: url }))}
              label="Upload Partner Logo"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                className="input-brand w-full"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.displayOnWeb}
                  onChange={(e) => setForm((p) => ({ ...p, displayOnWeb: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                Display on Website
              </label>
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
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving...' : 'Save Partner'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        open={!!viewPartner}
        onClose={() => setViewPartner(null)}
        title="Partner Details"
        size="lg"
      >
        {viewPartner && (
          <div className="space-y-5">
            {/* Logo & Name Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              {viewPartner.logoUrl ? (
                <img
                  src={viewPartner.logoUrl}
                  alt={viewPartner.nameEn}
                  className="h-20 w-20 object-contain rounded-lg border border-gray-200 p-1"
                />
              ) : (
                <div className="h-20 w-20 rounded-lg border border-gray-200 bg-[#0B4D32]/10 flex items-center justify-center text-[#0B4D32] text-xl font-bold">
                  {viewPartner.nameEn.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{viewPartner.nameEn}</h3>
                {viewPartner.nameAr && (
                  <p className="text-sm text-gray-500 mt-0.5" dir="rtl">{viewPartner.nameAr}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    viewPartner.displayOnWeb
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    {viewPartner.displayOnWeb ? 'Visible on Web' : 'Hidden'}
                  </span>
                  <span className="text-xs text-gray-400">Order: {viewPartner.order}</span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description (EN)</label>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 min-h-[60px]">
                  {viewPartner.descriptionEn || <span className="text-gray-300 italic">No description</span>}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description (AR)</label>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 min-h-[60px]" dir="rtl">
                  {viewPartner.descriptionAr || <span className="text-gray-300 italic">لا يوجد وصف</span>}
                </p>
              </div>
            </div>

            {/* Website URL */}
            {viewPartner.websiteUrl && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Website</label>
                <a
                  href={viewPartner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#009B91] hover:underline font-medium"
                >
                  <ExternalLink size={14} />
                  {viewPartner.websiteUrl}
                </a>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setViewPartner(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => { setViewPartner(null); openEdit(viewPartner); }}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Pencil size={14} /> Edit Partner
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
