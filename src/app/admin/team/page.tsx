'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, ChevronUp, ChevronDown, Crown } from 'lucide-react'
import Modal from '@/components/admin/Modal'
import ImageUpload from '@/components/admin/ImageUpload'

interface TeamMember {
  id: string
  nameEn: string
  nameAr: string
  titleEn: string
  titleAr: string | null
  bioEn: string | null
  bioAr: string | null
  photoUrl: string | null
  displayOnWeb: boolean
  order: number
  linkedIn: string | null
  isLeadership: boolean
  testimonialEn: string
  testimonialAr: string
  xHandle: string
}

const emptyForm = {
  nameEn: '',
  nameAr: '',
  titleEn: '',
  titleAr: '',
  bioEn: '',
  bioAr: '',
  photoUrl: '',
  displayOnWeb: true,
  order: 0,
  linkedIn: '',
  isLeadership: false,
  testimonialEn: '',
  testimonialAr: '',
  xHandle: '',
}

function MemberPhoto({ member }: { member: TeamMember }) {
  if (member.photoUrl) {
    return (
      <img
        src={member.photoUrl}
        alt={member.nameEn}
        width={50}
        height={50}
        className="h-[50px] w-[50px] object-cover rounded-full border-2 border-gray-100"
      />
    )
  }
  const initials = member.nameEn
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div className="h-[50px] w-[50px] rounded-full bg-[#0B4D32]/10 border-2 border-gray-100 flex items-center justify-center text-[#0B4D32] text-sm font-bold">
      {initials || '?'}
    </div>
  )
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/team')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a: TeamMember, b: TeamMember) => a.order - b.order
      )
      setMembers(sorted)
    } catch {
      setError('Failed to load team members.')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ ...emptyForm, order: members.length })
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (m: TeamMember) => {
    setEditing(m)
    setForm({
      nameEn: m.nameEn,
      nameAr: m.nameAr,
      titleEn: m.titleEn,
      titleAr: m.titleAr ?? '',
      bioEn: m.bioEn ?? '',
      bioAr: m.bioAr ?? '',
      photoUrl: m.photoUrl ?? '',
      displayOnWeb: m.displayOnWeb,
      order: m.order,
      linkedIn: m.linkedIn ?? '',
      isLeadership: (m as any).isLeadership ?? false,
      testimonialEn: (m as any).testimonialEn ?? '',
      testimonialAr: (m as any).testimonialAr ?? '',
      xHandle: (m as any).xHandle ?? '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.nameEn.trim() || !form.nameAr.trim() || !form.titleEn.trim()) {
      setFormError('Name (EN), Name (AR), and Title (EN) are required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const url = editing ? `/api/team/${editing.id}` : '/api/team'
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
      fetchMembers()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to save member.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this team member? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/team/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setMembers((prev) => prev.filter((m) => m.id !== id))
    } catch {
      setError('Failed to delete team member.')
    }
  }

  const moveOrder = async (member: TeamMember, direction: 'up' | 'down') => {
    const idx = members.findIndex((m) => m.id === member.id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === members.length - 1) return

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const swapMember = members[swapIdx]

    const newOrder = swapMember.order
    const swapOrder = member.order

    // Optimistic update
    const updated = members.map((m) => {
      if (m.id === member.id) return { ...m, order: newOrder }
      if (m.id === swapMember.id) return { ...m, order: swapOrder }
      return m
    }).sort((a, b) => a.order - b.order)
    setMembers(updated)

    try {
      await Promise.all([
        fetch(`/api/team/${member.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: newOrder }),
        }),
        fetch(`/api/team/${swapMember.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: swapOrder }),
        }),
      ])
    } catch {
      setError('Failed to reorder. Please refresh.')
      fetchMembers()
    }
  }

  const toggleDisplayOnWeb = async (member: TeamMember) => {
    try {
      const res = await fetch(`/api/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayOnWeb: !member.displayOnWeb }),
      })
      if (!res.ok) throw new Error('Update failed')
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, displayOnWeb: !member.displayOnWeb } : m))
      )
    } catch {
      setError('Failed to update member.')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members</p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 size={28} className="animate-spin text-[#009B91]" />
          </div>
        ) : members.length === 0 ? (
          <p className="p-10 text-center text-gray-400 text-sm">No team members found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0B4D32] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Photo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name (EN)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name (AR)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Testimonial</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">On Web</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member, idx) => {
                const testimonialPreview = ((member as any).testimonialEn || '')
                const isLeader = (member as any).isLeadership ?? false
                return (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <MemberPhoto member={member} />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-1.5">
                        {isLeader && (
                          <Crown size={13} className="text-amber-500 flex-shrink-0" aria-label="Leadership" />
                        )}
                        {member.nameEn}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600" dir="rtl">{member.nameAr}</td>
                    <td className="px-4 py-3 text-gray-600">{member.titleEn}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[160px]">
                      {testimonialPreview
                        ? <span className="italic">{testimonialPreview.slice(0, 60)}{testimonialPreview.length > 60 ? '…' : ''}</span>
                        : <span className="text-gray-200">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleDisplayOnWeb(member)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                          member.displayOnWeb ? 'bg-[#009B91]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            member.displayOnWeb ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="w-6 text-center text-gray-500">{member.order}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => moveOrder(member, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 text-gray-400 hover:text-[#009B91] disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            onClick={() => moveOrder(member, 'down')}
                            disabled={idx === members.length - 1}
                            className="p-0.5 text-gray-400 hover:text-[#009B91] disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(member)}
                          className="p-1.5 text-gray-400 hover:text-[#009B91] hover:bg-teal-50 rounded"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Team Member' : 'Add Team Member'}
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
                placeholder="Full name in English"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Name (Arabic) <span className="text-red-500">*</span>
              </label>
              <input
                value={form.nameAr}
                onChange={(e) => setForm((p) => ({ ...p, nameAr: e.target.value }))}
                className="input-brand w-full"
                dir="rtl"
                placeholder="الاسم بالعربية"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title (English) <span className="text-red-500">*</span>
              </label>
              <input
                value={form.titleEn}
                onChange={(e) => setForm((p) => ({ ...p, titleEn: e.target.value }))}
                className="input-brand w-full"
                placeholder="e.g. Operations Director"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title (Arabic)</label>
              <input
                value={form.titleAr}
                onChange={(e) => setForm((p) => ({ ...p, titleAr: e.target.value }))}
                className="input-brand w-full"
                dir="rtl"
                placeholder="المسمى الوظيفي بالعربية"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio (English)</label>
            <textarea
              value={form.bioEn}
              onChange={(e) => setForm((p) => ({ ...p, bioEn: e.target.value }))}
              rows={3}
              className="input-brand w-full resize-none"
              placeholder="Brief bio in English"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio (Arabic)</label>
            <textarea
              value={form.bioAr}
              onChange={(e) => setForm((p) => ({ ...p, bioAr: e.target.value }))}
              rows={3}
              className="input-brand w-full resize-none"
              dir="rtl"
              placeholder="نبذة مختصرة بالعربية"
            />
          </div>

          {/* Testimonial fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Testimonial
              <span className="ml-1 text-xs font-normal text-gray-400">(shown on People page)</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">English</label>
                <textarea
                  value={form.testimonialEn}
                  onChange={(e) => setForm((p) => ({ ...p, testimonialEn: e.target.value }))}
                  rows={2}
                  className="input-brand w-full resize-none text-sm"
                  placeholder="What they say about working here..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Arabic</label>
                <textarea
                  value={form.testimonialAr}
                  onChange={(e) => setForm((p) => ({ ...p, testimonialAr: e.target.value }))}
                  rows={2}
                  className="input-brand w-full resize-none text-sm"
                  dir="rtl"
                  placeholder="ما يقوله عن العمل هنا..."
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
            <ImageUpload
              value={form.photoUrl}
              onChange={(url) => setForm((p) => ({ ...p, photoUrl: url }))}
              label="Upload Photo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn URL</label>
            <input
              value={form.linkedIn}
              onChange={(e) => setForm((p) => ({ ...p, linkedIn: e.target.value }))}
              className="input-brand w-full"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              X / Twitter Handle
              <span className="ml-1 text-xs font-normal text-gray-400">e.g. @username</span>
            </label>
            <input
              value={form.xHandle}
              onChange={(e) => setForm((p) => ({ ...p, xHandle: e.target.value }))}
              className="input-brand w-full"
              placeholder="@username"
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
            <div className="flex flex-col gap-2 justify-end pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.displayOnWeb}
                  onChange={(e) => setForm((p) => ({ ...p, displayOnWeb: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                Display on Website
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isLeadership}
                  onChange={(e) => setForm((p) => ({ ...p, isLeadership: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Crown size={13} className="text-amber-500" />
                Leadership (shown on About page)
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
              {saving ? 'Saving...' : 'Save Member'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
