'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Search, Eye, ExternalLink } from 'lucide-react'
import Modal from '@/components/admin/Modal'
import StatusBadge from '@/components/admin/StatusBadge'

interface Applicant {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  nationality: string | null
  gender: string | null
  jobAppliedFor: string | null
  experience: string | null
  companies: string | null
  status: string
  cvUrl: string | null
  notes: string | null
  createdAt: string
}

const STATUSES = ['ALL', 'NEW', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED']
const GENDERS = ['ALL', 'MALE', 'FEMALE']

const statusColors: Record<string, string> = {
  NEW: 'bg-gray-100 text-gray-600',
  REVIEWED: 'bg-blue-100 text-blue-700',
  SHORTLISTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  HIRED: 'bg-teal-100 text-teal-700',
}

export default function JobsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterGender, setFilterGender] = useState('ALL')
  const [filterNationality, setFilterNationality] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Applicant | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fetchApplicants = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      if (filterGender !== 'ALL') params.set('gender', filterGender)
      if (filterNationality.trim()) params.set('nationality', filterNationality.trim())
      if (filterStatus !== 'ALL') params.set('status', filterStatus)
      const res = await fetch(`/api/jobs?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setApplicants(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load applicants.')
    } finally {
      setLoading(false)
    }
  }, [search, filterGender, filterNationality, filterStatus])

  useEffect(() => {
    fetchApplicants()
  }, [fetchApplicants])

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const openDetail = (a: Applicant) => {
    setSelected(a)
    setEditNotes(a.notes ?? '')
    setEditStatus(a.status)
    setSaveError('')
    setSaveSuccess(false)
    setDetailOpen(true)
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch(`/api/jobs/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNotes, status: editStatus }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Save failed')
      }
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === selected.id ? { ...a, notes: editNotes, status: editStatus } : a
        )
      )
      setSelected((prev) => prev ? { ...prev, notes: editNotes, status: editStatus } : prev)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Applicants</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage job applications</p>
        </div>
        <div className="text-sm text-gray-500">
          {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, job, experience..."
            className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009B91]"
          />
        </div>
        <select
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B91] bg-white"
        >
          {GENDERS.map((g) => <option key={g} value={g}>{g === 'ALL' ? 'All Genders' : g}</option>)}
        </select>
        <input
          type="text"
          value={filterNationality}
          onChange={(e) => setFilterNationality(e.target.value)}
          placeholder="Nationality..."
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B91] w-36"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#009B91] bg-white"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
        </select>
        {(search || filterGender !== 'ALL' || filterNationality || filterStatus !== 'ALL') && (
          <button
            onClick={() => {
              setSearchInput('')
              setFilterGender('ALL')
              setFilterNationality('')
              setFilterStatus('ALL')
            }}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 size={28} className="animate-spin text-[#009B91]" />
          </div>
        ) : applicants.length === 0 ? (
          <p className="p-10 text-center text-gray-400 text-sm">No applicants found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0B4D32] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Nationality</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Gender</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Applied For</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applicants.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => openDetail(a)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{a.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{a.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{a.nationality || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{a.gender || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{a.jobAppliedFor || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        statusColors[a.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openDetail(a)}
                      className="flex items-center gap-1.5 text-xs font-medium text-[#009B91] hover:text-[#008075] border border-[#009B91] rounded-lg px-2.5 py-1.5 hover:bg-[#009B91]/5"
                    >
                      <Eye size={12} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected?.fullName ?? 'Applicant Detail'}
        size="xl"
      >
        {selected && (
          <div className="space-y-5">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
              {[
                ['Email', selected.email],
                ['Phone', selected.phone],
                ['Nationality', selected.nationality],
                ['Gender', selected.gender],
                ['Job Applied For', selected.jobAppliedFor],
                ['Experience', selected.experience],
                ['Previous Companies', selected.companies],
                ['Applied On', new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{label as string}</span>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{(value as string) || '—'}</p>
                </div>
              ))}
            </div>

            {/* CV Link */}
            {selected.cvUrl && (
              <div>
                <a
                  href={selected.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#009B91] hover:text-[#008075] border border-[#009B91] rounded-lg px-4 py-2 hover:bg-[#009B91]/5"
                >
                  <ExternalLink size={14} />
                  View CV / Resume
                </a>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={4}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#009B91] resize-none"
                placeholder="Add internal notes about this applicant..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="input-brand w-full"
              >
                {STATUSES.filter((s) => s !== 'ALL').map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                Saved successfully.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => setDetailOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Saving...' : 'Save Notes & Status'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
