'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2, Search, Building2 } from 'lucide-react'
import Modal from '@/components/admin/Modal'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactRef {
  id: string
  nameEn: string
  title: string | null
  email: string | null
  role: string
}

interface Customer {
  id: string
  nameEn: string
  nameAr: string | null
  email: string | null
  phone: string | null
  industry: string | null
  notes: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT'
  contacts: ContactRef[]
  leadsCount: number
  createdAt: string
}

type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT'

const STATUS_OPTIONS: CustomerStatus[] = ['ACTIVE', 'PROSPECT', 'INACTIVE']

const statusBadge: Record<CustomerStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PROSPECT: 'bg-yellow-100 text-yellow-700',
  INACTIVE: 'bg-gray-100 text-gray-500',
}

const emptyForm = {
  nameEn: '',
  nameAr: '',
  email: '',
  phone: '',
  industry: '',
  notes: '',
  status: 'ACTIVE' as CustomerStatus,
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchCustomers = useCallback(async (q?: string, status?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (status) params.set('status', status)
      const res = await fetch(`/api/customers?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCustomers(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load customers.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Debounced search + status filter
  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(searchInput || undefined, filterStatus || undefined), 400)
    return () => clearTimeout(t)
  }, [searchInput, filterStatus, fetchCustomers])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (c: Customer) => {
    setEditing(c)
    setForm({
      nameEn: c.nameEn,
      nameAr: c.nameAr ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      industry: c.industry ?? '',
      notes: c.notes ?? '',
      status: c.status,
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nameEn.trim()) { setFormError('Name (English) is required.'); return }
    setSaving(true)
    setFormError('')
    try {
      const url = editing ? `/api/customers/${editing.id}` : '/api/customers'
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
      fetchCustomers(searchInput || undefined, filterStatus || undefined)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (customer: Customer) => {
    const msg = customer.leadsCount > 0
      ? `This customer has ${customer.leadsCount} lead(s). Delete anyway?`
      : 'Delete this customer? This cannot be undone.'
    if (!window.confirm(msg)) return
    try {
      const res = await fetch(`/api/customers/${customer.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setCustomers(p => p.filter(c => c.id !== customer.id))
    } catch {
      setError('Failed to delete customer.')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer accounts and their contacts</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search customers…"
            className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B91]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B91] bg-white"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(searchInput || filterStatus) && (
          <button
            onClick={() => { setSearchInput(''); setFilterStatus('') }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 size={28} className="animate-spin text-[#009B91]" />
          </div>
        ) : customers.length === 0 ? (
          <p className="p-10 text-center text-gray-400 text-sm">No customers found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0B4D32] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Industry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email / Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Contacts</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Leads</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#0B4D32]/10 flex items-center justify-center flex-shrink-0">
                        <Building2 size={14} className="text-[#0B4D32]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.nameEn}</p>
                        {customer.nameAr && (
                          <p className="text-xs text-gray-400 mt-0.5" dir="rtl">{customer.nameAr}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{customer.industry || '—'}</td>
                  <td className="px-4 py-3">
                    {customer.email && (
                      <a href={`mailto:${customer.email}`} className="text-[#009B91] hover:underline text-sm block">
                        {customer.email}
                      </a>
                    )}
                    {customer.phone && <p className="text-xs text-gray-400 mt-0.5">{customer.phone}</p>}
                    {!customer.email && !customer.phone && <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${statusBadge[customer.status]}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {customer.contacts.length > 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#009B91]/10 text-[#009B91] text-xs font-semibold">
                        {customer.contacts.length}
                      </span>
                    ) : (
                      <span className="text-gray-300">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {customer.leadsCount > 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                        {customer.leadsCount}
                      </span>
                    ) : (
                      <span className="text-gray-300">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(customer)}
                        title="Edit"
                        className="p-1.5 text-gray-400 hover:text-[#009B91] hover:bg-teal-50 rounded transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        title="Delete"
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
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
        title={editing ? 'Edit Customer' : 'Add Customer'}
        size="lg"
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{formError}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                value={form.nameEn}
                onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))}
                className="input-brand w-full"
                placeholder="Customer name in English"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name (Arabic)</label>
              <input
                value={form.nameAr}
                onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))}
                className="input-brand w-full"
                dir="rtl"
                placeholder="الاسم بالعربية"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input-brand w-full"
                placeholder="contact@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="input-brand w-full"
                placeholder="+966 5x xxx xxxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
              <input
                value={form.industry}
                onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}
                className="input-brand w-full"
                placeholder="e.g. Food & Beverage, Retail…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as CustomerStatus }))}
                className="input-brand w-full"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={3}
              className="input-brand w-full resize-none"
              placeholder="Internal notes about this customer…"
            />
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
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
