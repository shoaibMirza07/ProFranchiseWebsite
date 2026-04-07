'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Loader2, LayoutGrid, List, Search, ChevronUp, ChevronDown, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/admin/Modal'
import StatusBadge from '@/components/admin/StatusBadge'

interface Lead {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  inquiryType: string
  company: string | null
  message: string | null
  stage: string
  priority: string
  assignedTo: string | null
  createdAt: string
  contactId: string | null
  contact: { id: string; nameEn: string; email: string; phone: string } | null
  brandId: string | null
  brand: { id: string; nameEn: string } | null
  partnerId: string | null
  partner: { id: string; nameEn: string } | null
  customerId: string | null
  customer: { id: string; nameEn: string } | null
}

interface EntityRef { id: string; nameEn: string }
interface ContactRef { id: string; nameEn: string; email: string | null; phone: string | null }

const STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']
const INQUIRY_TYPES = ['FRANCHISE', 'INVESTMENT', 'PARTNERSHIP', 'GENERAL']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']

const inquiryColors: Record<string, string> = {
  FRANCHISE: 'bg-blue-100 text-blue-700',
  INVESTMENT: 'bg-purple-100 text-purple-700',
  PARTNERSHIP: 'bg-orange-100 text-orange-700',
  GENERAL: 'bg-gray-100 text-gray-600',
}

const priorityDot: Record<string, string> = {
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-yellow-400',
  LOW: 'bg-gray-400',
}

const stageColumnColors: Record<string, string> = {
  NEW: 'bg-gray-50 border-gray-200',
  CONTACTED: 'bg-blue-50 border-blue-200',
  QUALIFIED: 'bg-purple-50 border-purple-200',
  PROPOSAL: 'bg-orange-50 border-orange-200',
  NEGOTIATION: 'bg-yellow-50 border-yellow-200',
  WON: 'bg-green-50 border-green-200',
  LOST: 'bg-red-50 border-red-200',
}

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  inquiryType: 'GENERAL',
  company: '',
  message: '',
  stage: 'NEW',
  priority: 'MEDIUM',
  contactId: '',
  brandId: '',
  partnerId: '',
  customerId: '',
}

type SortKey = keyof Lead
type SortDir = 'asc' | 'desc'

export default function PipelinePage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<'kanban' | 'table'>('kanban')

  // Filters
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  // Add modal
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Entity dropdown data
  const [contacts, setContacts] = useState<ContactRef[]>([])
  const [brands, setBrands] = useState<EntityRef[]>([])
  const [partners, setPartners] = useState<EntityRef[]>([])
  const [customers, setCustomers] = useState<EntityRef[]>([])
  const [contactSearch, setContactSearch] = useState('')

  // Table sort
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      if (filterType) params.set('inquiryType', filterType)
      if (filterStage) params.set('stage', filterStage)
      if (filterPriority) params.set('priority', filterPriority)
      const res = await fetch(`/api/pipeline?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setLeads(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load pipeline leads.')
    } finally {
      setLoading(false)
    }
  }, [search, filterType, filterStage, filterPriority])

  useEffect(() => {
    const t = setTimeout(() => fetchLeads(), 300)
    return () => clearTimeout(t)
  }, [fetchLeads])

  // Fetch entity lists for dropdowns on mount
  useEffect(() => {
    fetch('/api/contacts').then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d : [])).catch(() => {})
    fetch('/api/brands').then(r => r.json()).then(d => setBrands(Array.isArray(d) ? d : [])).catch(() => {})
    fetch('/api/partners').then(r => r.json()).then(d => setPartners(Array.isArray(d) ? d : [])).catch(() => {})
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const handleAddLead = async () => {
    if (!form.fullName.trim()) {
      setFormError('Full name is required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const res = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Save failed')
      }
      setModalOpen(false)
      setForm(emptyForm)
      setContactSearch('')
      fetchLeads()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to add lead.')
    } finally {
      setSaving(false)
    }
  }

  const sortedLeads = [...leads].sort((a, b) => {
    const aVal = String(a[sortKey] ?? '')
    const bVal = String(b[sortKey] ?? '')
    return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="text-gray-300" />
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-white" />
    ) : (
      <ChevronDown size={12} className="text-white" />
    )
  }

  const initials = (name: string) =>
    name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')

  return (
    <div className="p-6 max-w-full mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">CRM lead management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                view === 'kanban'
                  ? 'bg-[#0B4D32] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                view === 'table'
                  ? 'bg-[#0B4D32] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List size={14} /> Table
            </button>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setFormError(''); setContactSearch(''); setModalOpen(true) }}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B91]"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B91] bg-white"
        >
          <option value="">All Types</option>
          {INQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B91] bg-white"
        >
          <option value="">All Stages</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B91] bg-white"
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {(filterType || filterStage || filterPriority || search) && (
          <button
            onClick={() => { setSearch(''); setFilterType(''); setFilterStage(''); setFilterPriority('') }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-[#009B91]" />
        </div>
      ) : view === 'kanban' ? (
        /* ===== KANBAN VIEW ===== */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage)
            return (
              <div
                key={stage}
                className={`flex-shrink-0 w-64 rounded-xl border ${stageColumnColors[stage]} flex flex-col`}
              >
                {/* Column header */}
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{stage}</span>
                  <span className="text-xs bg-white border border-gray-200 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2 p-2 flex-1 min-h-[100px]">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => router.push(`/admin/pipeline/${lead.id}`)}
                      className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{lead.fullName}</p>
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${priorityDot[lead.priority] ?? 'bg-gray-300'}`}
                          title={`Priority: ${lead.priority}`}
                        />
                      </div>
                      {lead.contact && (
                        <div className="flex items-center gap-1">
                          <User size={10} className="text-[#009B91] flex-shrink-0" />
                          <span className="text-[10px] text-[#009B91] font-medium truncate">{lead.contact.nameEn}</span>
                        </div>
                      )}
                      {lead.company && (
                        <p className="text-xs text-gray-500">{lead.company}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            inquiryColors[lead.inquiryType] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {lead.inquiryType}
                        </span>
                        {lead.assignedTo && (
                          <div className="h-6 w-6 rounded-full bg-[#0B4D32] text-white text-[10px] flex items-center justify-center font-bold">
                            {initials(lead.assignedTo)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No leads</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ===== TABLE VIEW ===== */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {sortedLeads.length === 0 ? (
            <p className="p-10 text-center text-gray-400 text-sm">No leads found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#0B4D32] text-white">
                <tr>
                  {[
                    { key: 'fullName', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'inquiryType', label: 'Type' },
                    { key: 'stage', label: 'Stage' },
                    { key: 'priority', label: 'Priority' },
                    { key: 'assignedTo', label: 'Assigned To' },
                    { key: 'createdAt', label: 'Date' },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key as SortKey)}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:bg-[#083a26]"
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        <SortIcon col={key as SortKey} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => router.push(`/admin/pipeline/${lead.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{lead.fullName}</p>
                      {lead.contact && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <User size={10} className="text-[#009B91]" />
                          <span className="text-xs text-[#009B91]">{lead.contact.nameEn}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inquiryColors[lead.inquiryType] ?? 'bg-gray-100 text-gray-600'}`}>
                        {lead.inquiryType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.stage} type="stage" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.priority} type="priority" />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.assignedTo || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Lead Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Lead"
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formError}
            </div>
          )}

          {/* Contact selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Link to Contact <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                placeholder="Search contacts to link…"
                className="pl-8 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B91]"
              />
            </div>
            {contactSearch && (
              <div className="mt-1 border border-gray-200 rounded-lg bg-white shadow-sm max-h-36 overflow-y-auto">
                {contacts
                  .filter(c =>
                    c.nameEn.toLowerCase().includes(contactSearch.toLowerCase()) ||
                    (c.email ?? '').toLowerCase().includes(contactSearch.toLowerCase())
                  )
                  .slice(0, 8)
                  .map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setForm(p => ({
                          ...p,
                          contactId: c.id,
                          fullName: p.fullName || c.nameEn,
                          email: p.email || (c.email ?? ''),
                          phone: p.phone || (c.phone ?? ''),
                        }))
                        setContactSearch(c.nameEn)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#009B91]/10 flex items-center justify-center flex-shrink-0">
                        <User size={10} className="text-[#009B91]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{c.nameEn}</p>
                        {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                      </div>
                    </button>
                  ))}
                {contacts.filter(c =>
                  c.nameEn.toLowerCase().includes(contactSearch.toLowerCase()) ||
                  (c.email ?? '').toLowerCase().includes(contactSearch.toLowerCase())
                ).length === 0 && (
                  <p className="px-3 py-2 text-sm text-gray-400 italic">No contacts found</p>
                )}
              </div>
            )}
            {form.contactId && (
              <p className="mt-1 text-xs text-[#009B91]">
                Linked: {contacts.find(c => c.id === form.contactId)?.nameEn ?? form.contactId}
                {' '}
                <button
                  type="button"
                  onClick={() => { setForm(p => ({ ...p, contactId: '' })); setContactSearch('') }}
                  className="text-gray-400 hover:text-red-500 underline ml-1"
                >
                  remove
                </button>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.fullName}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                className="input-brand w-full"
                placeholder="Contact's full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="input-brand w-full"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="input-brand w-full"
                placeholder="+966 5x xxx xxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Inquiry Type</label>
              <select
                value={form.inquiryType}
                onChange={(e) => setForm((p) => ({ ...p, inquiryType: e.target.value }))}
                className="input-brand w-full"
              >
                {INQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
              <input
                value={form.company}
                onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                className="input-brand w-full"
                placeholder="Company name (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stage</label>
              <select
                value={form.stage}
                onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))}
                className="input-brand w-full"
              >
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                className="input-brand w-full"
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message / Notes</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                rows={3}
                className="input-brand w-full resize-none"
                placeholder="Initial message or notes..."
              />
            </div>
          </div>

          {/* Entity linking */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Link to Entity (optional)</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
                <select
                  value={form.brandId}
                  onChange={e => setForm(p => ({ ...p, brandId: e.target.value }))}
                  className="input-brand w-full text-sm"
                >
                  <option value="">— none —</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.nameEn}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Partner</label>
                <select
                  value={form.partnerId}
                  onChange={e => setForm(p => ({ ...p, partnerId: e.target.value }))}
                  className="input-brand w-full text-sm"
                >
                  <option value="">— none —</option>
                  {partners.map(p => <option key={p.id} value={p.id}>{p.nameEn}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Customer</label>
                <select
                  value={form.customerId}
                  onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))}
                  className="input-brand w-full text-sm"
                >
                  <option value="">— none —</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                </select>
              </div>
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
              onClick={handleAddLead}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
