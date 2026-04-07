'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2, Search, X, Link as LinkIcon, Building2, Handshake } from 'lucide-react'
import Modal from '@/components/admin/Modal'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EntityRef { id: string; nameEn: string; nameAr: string; role: string }

interface Contact {
  id: string
  nameEn: string
  nameAr: string | null
  title: string | null
  email: string | null
  phone: string | null
  status: string
  notes: string | null
  brands: EntityRef[]
  partners: EntityRef[]
}

const STATUSES = ['PROSPECT', 'ACTIVE', 'INACTIVE']

const statusStyle: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PROSPECT: 'bg-yellow-100 text-yellow-700',
  INACTIVE: 'bg-gray-100 text-gray-500',
}

const emptyForm = { nameEn: '', nameAr: '', title: '', email: '', phone: '', status: 'ACTIVE', notes: '' }

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Brands + partners for assignment dropdowns
  const [brands, setBrands] = useState<EntityRef[]>([])
  const [partners, setPartners] = useState<EntityRef[]>([])

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Link management (only in edit mode)
  const [linkType, setLinkType] = useState<'brand' | 'partner'>('brand')
  const [linkId, setLinkId] = useState('')
  const [linkRole, setLinkRole] = useState('')
  const [linking, setLinking] = useState(false)
  const [unlinking, setUnlinking] = useState<string | null>(null)

  // Create assign (create mode)
  const [createLinkType, setCreateLinkType] = useState<'brand' | 'partner'>('brand')
  const [createLinkId, setCreateLinkId] = useState('')
  const [createLinkRole, setCreateLinkRole] = useState('')

  const fetchContacts = useCallback(async (q?: string, status?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (status) params.set('status', status)
      const res = await fetch(`/api/contacts?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setContacts(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load contacts.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContacts()
    fetch('/api/brands').then(r => r.json()).then(d => setBrands(Array.isArray(d) ? d.map((b: EntityRef) => ({ ...b, role: '' })) : [])).catch(() => {})
    fetch('/api/partners').then(r => r.json()).then(d => setPartners(Array.isArray(d) ? d.map((p: EntityRef) => ({ ...p, role: '' })) : [])).catch(() => {})
  }, [fetchContacts])

  useEffect(() => {
    const t = setTimeout(() => fetchContacts(searchInput || undefined, filterStatus || undefined), 400)
    return () => clearTimeout(t)
  }, [searchInput, filterStatus, fetchContacts])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setCreateLinkId('')
    setCreateLinkRole('')
    setModalOpen(true)
  }

  const openEdit = (c: Contact) => {
    setEditing(c)
    setForm({
      nameEn: c.nameEn,
      nameAr: c.nameAr ?? '',
      title: c.title ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      status: c.status,
      notes: c.notes ?? '',
    })
    setFormError('')
    setLinkId('')
    setLinkRole('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nameEn.trim()) { setFormError('Name (English) is required.'); return }
    setSaving(true)
    setFormError('')
    try {
      const url = editing ? `/api/contacts/${editing.id}` : '/api/contacts'
      const method = editing ? 'PUT' : 'POST'

      const payload: Record<string, unknown> = { ...form }
      if (!editing && createLinkId) {
        payload[createLinkType === 'brand' ? 'brandId' : 'partnerId'] = createLinkId
        payload.role = createLinkRole
      }

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Save failed') }
      setModalOpen(false)
      fetchContacts(searchInput || undefined, filterStatus || undefined)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddLink = async () => {
    if (!editing || !linkId) return
    setLinking(true)
    try {
      const apiUrl = linkType === 'brand'
        ? `/api/brands/${linkId}/contacts`
        : `/api/partners/${linkId}/contacts`
      const res = await fetch(apiUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: editing.id, role: linkRole }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Link failed') }

      const entity = (linkType === 'brand' ? brands : partners).find(e => e.id === linkId)!
      const entityWithRole = { ...entity, role: linkRole }
      setEditing(prev => {
        if (!prev) return prev
        return {
          ...prev,
          brands: linkType === 'brand' ? [...prev.brands, entityWithRole] : prev.brands,
          partners: linkType === 'partner' ? [...prev.partners, entityWithRole] : prev.partners,
        }
      })
      setLinkId('')
      setLinkRole('')
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to add link.')
    } finally {
      setLinking(false)
    }
  }

  const handleRemoveLink = async (type: 'brand' | 'partner', entityId: string) => {
    if (!editing) return
    setUnlinking(`${type}-${entityId}`)
    try {
      const apiUrl = type === 'brand'
        ? `/api/brands/${entityId}/contacts?contactId=${editing.id}`
        : `/api/partners/${entityId}/contacts?contactId=${editing.id}`
      await fetch(apiUrl, { method: 'DELETE' })

      setEditing(prev => {
        if (!prev) return prev
        return {
          ...prev,
          brands: type === 'brand' ? prev.brands.filter(b => b.id !== entityId) : prev.brands,
          partners: type === 'partner' ? prev.partners.filter(p => p.id !== entityId) : prev.partners,
        }
      })
    } catch {
      setFormError('Failed to remove link.')
    } finally {
      setUnlinking(null)
    }
  }

  const handleDelete = async (contact: Contact) => {
    const linked = contact.brands.length + contact.partners.length
    const msg = linked > 0
      ? `This contact is linked to ${linked} brand/partner(s). Delete anyway?`
      : 'Delete this contact? This cannot be undone.'
    if (!window.confirm(msg)) return
    try {
      await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' })
      setContacts(p => p.filter(c => c.id !== contact.id))
    } catch { setError('Failed to delete.') }
  }

  const availableBrands = brands.filter(b => !editing?.brands.some(eb => eb.id === b.id))
  const availablePartners = partners.filter(p => !editing?.partners.some(ep => ep.id === p.id))
  const availableForLink = linkType === 'brand' ? availableBrands : availablePartners
  const currentLinks = editing ? [
    ...editing.brands.map(b => ({ type: 'brand' as const, entity: b })),
    ...editing.partners.map(p => ({ type: 'partner' as const, entity: p })),
  ] : []

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">Master contact database — link to brands, partners or customers</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={16} /> Add Contact
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Search contacts…"
            className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B91]" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B91]">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 size={28} className="animate-spin text-[#009B91]" /></div>
        ) : contacts.length === 0 ? (
          <p className="p-10 text-center text-gray-400 text-sm">No contacts found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0B4D32] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Linked To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contacts.map(contact => (
                <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{contact.nameEn}</p>
                    {contact.nameAr && <p className="text-xs text-gray-400 mt-0.5" dir="rtl">{contact.nameAr}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{contact.title || '—'}</td>
                  <td className="px-4 py-3">
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="text-[#009B91] hover:underline text-sm block">{contact.email}</a>
                    )}
                    {contact.phone && <p className="text-xs text-gray-400 mt-0.5">{contact.phone}</p>}
                    {!contact.email && !contact.phone && <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle[contact.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.brands.map(b => (
                        <span key={b.id} className="inline-flex flex-col px-2 py-0.5 text-xs rounded-full bg-[#0B4D32]/10 text-[#0B4D32] font-medium">
                          <span className="flex items-center gap-1"><Building2 size={10} />{b.nameEn}</span>
                          {b.role && <span className="text-[9px] font-normal text-[#0B4D32]/60 mt-0.5">{b.role}</span>}
                        </span>
                      ))}
                      {contact.partners.map(p => (
                        <span key={p.id} className="inline-flex flex-col px-2 py-0.5 text-xs rounded-full bg-[#009B91]/10 text-[#009B91] font-medium">
                          <span className="flex items-center gap-1"><Handshake size={10} />{p.nameEn}</span>
                          {p.role && <span className="text-[9px] font-normal text-[#009B91]/60 mt-0.5">{p.role}</span>}
                        </span>
                      ))}
                      {contact.brands.length === 0 && contact.partners.length === 0 && (
                        <span className="text-xs text-gray-300 italic">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(contact)} title="Edit"
                        className="p-1.5 text-gray-400 hover:text-[#009B91] hover:bg-teal-50 rounded transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(contact)} title="Delete"
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Contact' : 'Add Contact'} size="lg">
        <div className="space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{formError}</div>
          )}

          {/* Contact info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name (English) <span className="text-red-500">*</span></label>
              <input value={form.nameEn} onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))}
                className="input-brand w-full" placeholder="Full name in English" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name (Arabic)</label>
              <input value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))}
                className="input-brand w-full" dir="rtl" placeholder="الاسم بالعربية" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title / Position</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="input-brand w-full" placeholder="e.g. Operations Manager" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="input-brand w-full">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input-brand w-full" placeholder="contact@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="input-brand w-full" placeholder="+966 5x xxx xxxx" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={2} className="input-brand w-full resize-none" placeholder="Internal notes about this contact…" />
          </div>

          {/* ── Assignment section ── */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <LinkIcon size={14} className="text-[#009B91]" />
              <h4 className="text-sm font-semibold text-gray-700">
                {editing ? 'Company Links' : 'Assign To (optional)'}
              </h4>
            </div>

            {/* Show current links (edit mode) */}
            {editing && currentLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {currentLinks.map(({ type, entity }) => (
                  <span key={`${type}-${entity.id}`}
                    className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs rounded-full font-medium ${
                      type === 'brand'
                        ? 'bg-[#0B4D32]/10 text-[#0B4D32] border border-[#0B4D32]/20'
                        : 'bg-[#009B91]/10 text-[#009B91] border border-[#009B91]/20'
                    }`}>
                    {type === 'brand' ? <Building2 size={10} /> : <Handshake size={10} />}
                    {entity.nameEn}
                    {entity.role && <span className="opacity-60 text-[10px]">· {entity.role}</span>}
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(type, entity.id)}
                      disabled={unlinking === `${type}-${entity.id}`}
                      className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 disabled:opacity-50 transition-colors"
                    >
                      {unlinking === `${type}-${entity.id}` ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
                    </button>
                  </span>
                ))}
              </div>
            )}

            {editing && currentLinks.length === 0 && (
              <p className="text-xs text-gray-400 italic mb-3">No links yet.</p>
            )}

            {/* Add link form */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={editing ? linkType : createLinkType}
                onChange={e => {
                  if (editing) { setLinkType(e.target.value as 'brand' | 'partner'); setLinkId('') }
                  else { setCreateLinkType(e.target.value as 'brand' | 'partner'); setCreateLinkId('') }
                }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B91]">
                <option value="brand">Brand</option>
                <option value="partner">Partner</option>
              </select>
              <select
                value={editing ? linkId : createLinkId}
                onChange={e => { if (editing) setLinkId(e.target.value); else setCreateLinkId(e.target.value) }}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B91]">
                <option value="">— select {editing ? linkType : createLinkType} —</option>
                {(editing ? availableForLink : (createLinkType === 'brand' ? brands : partners)).map(e => (
                  <option key={e.id} value={e.id}>{e.nameEn}</option>
                ))}
              </select>
              <input
                value={editing ? linkRole : createLinkRole}
                onChange={e => { if (editing) setLinkRole(e.target.value); else setCreateLinkRole(e.target.value) }}
                placeholder="Role (optional)"
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B91] w-36"
              />
              {editing && (
                <button type="button" onClick={handleAddLink}
                  disabled={!linkId || linking}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-[#009B91] text-white rounded-lg hover:bg-[#008a80] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {linking ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Link
                </button>
              )}
            </div>
            {!editing && (
              <p className="text-xs text-gray-400 mt-1.5">Optionally assign to a brand or partner. More links can be added after saving.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Create Contact')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
