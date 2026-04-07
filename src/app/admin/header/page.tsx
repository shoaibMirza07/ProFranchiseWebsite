'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, GripVertical, ExternalLink, Save, Loader2 } from 'lucide-react'
import Modal from '@/components/admin/Modal'

interface NavItem {
  id: string
  labelEn: string
  labelAr: string
  href: string
  order: number
  isActive: boolean
  isExternal: boolean
}

interface CtaConfig {
  labelEn: string
  labelAr: string
  href: string
}

const emptyNav: Omit<NavItem, 'id' | 'order'> = {
  labelEn: '',
  labelAr: '',
  href: '',
  isActive: true,
  isExternal: false,
}

export default function HeaderPage() {
  const [items, setItems] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<NavItem | null>(null)
  const [form, setForm] = useState(emptyNav)
  const [cta, setCta] = useState<CtaConfig>({ labelEn: 'Get Started', labelAr: 'ابدأ الآن', href: '/contact' })
  const [ctaSaving, setCtaSaving] = useState(false)

  useEffect(() => {
    fetchNav()
    fetchCta()
  }, [])

  const fetchNav = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/nav')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load navigation items')
    } finally {
      setLoading(false)
    }
  }

  const fetchCta = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      const general = data.general ?? {}
      setCta({
        labelEn: general.ctaLabelEn ?? 'Get Started',
        labelAr: general.ctaLabelAr ?? 'ابدأ الآن',
        href: general.ctaHref ?? '/contact',
      })
    } catch {}
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyNav)
    setModalOpen(true)
  }

  const openEdit = (item: NavItem) => {
    setEditing(item)
    setForm({
      labelEn: item.labelEn,
      labelAr: item.labelAr,
      href: item.href,
      isActive: item.isActive,
      isExternal: item.isExternal,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.labelEn || !form.href) {
      setError('Label (EN) and href are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const url = editing ? `/api/nav/${editing.id}` : '/api/nav'
      const method = editing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Save failed')
      setModalOpen(false)
      fetchNav()
    } catch {
      setError('Failed to save navigation item')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this navigation item?')) return
    try {
      const res = await fetch(`/api/nav/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch {
      setError('Failed to delete item')
    }
  }

  const saveCta = async () => {
    setCtaSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { key: 'ctaLabelEn', value: cta.labelEn, group: 'general' },
          { key: 'ctaLabelAr', value: cta.labelAr, group: 'general' },
          { key: 'ctaHref', value: cta.href, group: 'general' },
        ]),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save CTA config')
    } finally {
      setCtaSaving(false)
    }
  }

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    const idx = items.findIndex((i) => i.id === id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === items.length - 1) return
    const newItems = [...items]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]]
    const reordered = newItems.map((item, i) => ({ ...item, order: i }))
    setItems(reordered)
    try {
      await fetch('/api/nav', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reordered.map((item) => ({ id: item.id, order: item.order }))),
      })
    } catch {
      fetchNav()
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Header & Navigation</h1>
          <p className="text-sm text-gray-500 mt-1">Manage site navigation links</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Nav Item
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
      {saved && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">Saved!</div>}

      {/* Nav items table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Navigation Links</h2>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 size={24} className="animate-spin text-[#009B91]" />
          </div>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-gray-400 text-sm">No navigation items yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-8 px-4 py-3" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Label (EN)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Label (AR)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Href</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 w-8">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveItem(item.id, 'up')}
                        disabled={idx === 0}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-20"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveItem(item.id, 'down')}
                        disabled={idx === items.length - 1}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-20"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.labelEn}</td>
                  <td className="px-4 py-3 text-gray-600" dir="rtl">{item.labelAr}</td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="flex items-center gap-1">
                      {item.href}
                      {item.isExternal && <ExternalLink size={12} className="text-gray-400" />}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-[#009B91] hover:bg-teal-50 rounded">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
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

      {/* CTA Config */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">CTA Button Configuration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Label (English)</label>
            <input
              value={cta.labelEn}
              onChange={(e) => setCta((p) => ({ ...p, labelEn: e.target.value }))}
              className="input-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Label (Arabic)</label>
            <input
              value={cta.labelAr}
              onChange={(e) => setCta((p) => ({ ...p, labelAr: e.target.value }))}
              className="input-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Link (href)</label>
            <input
              value={cta.href}
              onChange={(e) => setCta((p) => ({ ...p, href: e.target.value }))}
              className="input-brand"
            />
          </div>
        </div>
        <button onClick={saveCta} disabled={ctaSaving} className="btn-primary">
          {ctaSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save CTA
        </button>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Nav Item' : 'Add Nav Item'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Label (English) *</label>
              <input value={form.labelEn} onChange={(e) => setForm((p) => ({ ...p, labelEn: e.target.value }))} className="input-brand" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Label (Arabic)</label>
              <input value={form.labelAr} onChange={(e) => setForm((p) => ({ ...p, labelAr: e.target.value }))} className="input-brand" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Link (href) *</label>
            <input value={form.href} onChange={(e) => setForm((p) => ({ ...p, href: e.target.value }))} className="input-brand" placeholder="/about" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="rounded"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isExternal}
                onChange={(e) => setForm((p) => ({ ...p, isExternal: e.target.checked }))}
                className="rounded"
              />
              External link
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary py-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
