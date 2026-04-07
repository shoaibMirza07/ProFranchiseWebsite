'use client'

import { useState, useEffect, useCallback } from 'react'
import { use } from 'react'
import { ArrowLeft, Loader2, Save, Plus } from 'lucide-react'
import Link from 'next/link'
import StatusBadge from '@/components/admin/StatusBadge'

interface Lead {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  inquiryType: string
  company: string | null
  source: string | null
  message: string | null
  stage: string
  priority: string
  assignedTo: string | null
  proposalValue: number | null
  expectedCloseDate: string | null
  createdAt: string
  activities?: Activity[]
}

interface Activity {
  id: string
  type: string
  note: string
  createdAt: string
  createdBy: string | null
}

interface User {
  id: string
  name: string
  email: string
}

const STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']
const ACTIVITY_TYPES = ['NOTE', 'CALL', 'EMAIL', 'MEETING']

const activityIcons: Record<string, string> = {
  NOTE: '📝',
  CALL: '📞',
  EMAIL: '📧',
  MEETING: '🤝',
}

const sourceColors: Record<string, string> = {
  WEBSITE: 'bg-blue-100 text-blue-700',
  REFERRAL: 'bg-green-100 text-green-700',
  SOCIAL: 'bg-purple-100 text-purple-700',
  DIRECT: 'bg-gray-100 text-gray-600',
  OTHER: 'bg-orange-100 text-orange-700',
}

const inquiryColors: Record<string, string> = {
  FRANCHISE: 'bg-blue-100 text-blue-700',
  INVESTMENT: 'bg-purple-100 text-purple-700',
  PARTNERSHIP: 'bg-orange-100 text-orange-700',
  GENERAL: 'bg-gray-100 text-gray-600',
}

interface LeadDetailPageProps {
  params: Promise<{ id: string }>
}

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = use(params)

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<User[]>([])

  // Right column form
  const [stage, setStage] = useState('')
  const [priority, setPriority] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [proposalValue, setProposalValue] = useState('')
  const [expectedCloseDate, setExpectedCloseDate] = useState('')
  const [savingDetails, setSavingDetails] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Activity
  const [activityType, setActivityType] = useState('NOTE')
  const [activityNote, setActivityNote] = useState('')
  const [loggingActivity, setLoggingActivity] = useState(false)
  const [activityError, setActivityError] = useState('')

  const fetchLead = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/pipeline/${id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data: Lead = await res.json()
      setLead(data)
      setStage(data.stage)
      setPriority(data.priority)
      setAssignedTo(data.assignedTo ?? '')
      setProposalValue(data.proposalValue?.toString() ?? '')
      setExpectedCloseDate(
        data.expectedCloseDate
          ? new Date(data.expectedCloseDate).toISOString().split('T')[0]
          : ''
      )
    } catch {
      setError('Failed to load lead details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      if (!res.ok) return
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      // non-critical
    }
  }, [])

  useEffect(() => {
    fetchLead()
    fetchUsers()
  }, [fetchLead, fetchUsers])

  const handleSaveDetails = async () => {
    setSavingDetails(true)
    setError('')
    try {
      const res = await fetch(`/api/pipeline/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          priority,
          assignedTo: assignedTo || null,
          proposalValue: proposalValue ? parseFloat(proposalValue) : null,
          expectedCloseDate: expectedCloseDate || null,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      fetchLead()
    } catch {
      setError('Failed to save details.')
    } finally {
      setSavingDetails(false)
    }
  }

  const handleLogActivity = async () => {
    if (!activityNote.trim()) {
      setActivityError('Please enter a note.')
      return
    }
    setLoggingActivity(true)
    setActivityError('')
    try {
      const res = await fetch(`/api/pipeline/${id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activityType, note: activityNote }),
      })
      if (!res.ok) throw new Error('Failed to log activity')
      setActivityNote('')
      setActivityType('NOTE')
      fetchLead()
    } catch {
      setActivityError('Failed to log activity.')
    } finally {
      setLoggingActivity(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#009B91]" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
          {error || 'Lead not found.'}
        </div>
      </div>
    )
  }

  const activities = (lead.activities ?? []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/pipeline" className="flex items-center gap-1 hover:text-[#009B91]">
          <ArrowLeft size={14} />
          Pipeline
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{lead.fullName}</span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* ===== LEFT COLUMN (2/3) ===== */}
        <div className="col-span-2 space-y-5">
          {/* Contact Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{lead.fullName}</h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      inquiryColors[lead.inquiryType] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {lead.inquiryType}
                  </span>
                  {lead.source && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        sourceColors[lead.source] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {lead.source}
                    </span>
                  )}
                  <StatusBadge status={lead.stage} type="stage" />
                  <StatusBadge status={lead.priority} type="priority" />
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(lead.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {lead.email && (
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide block mb-0.5">Email</span>
                  <a href={`mailto:${lead.email}`} className="text-[#009B91] hover:underline">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide block mb-0.5">Phone</span>
                  <a href={`tel:${lead.phone}`} className="text-gray-900">{lead.phone}</a>
                </div>
              )}
              {lead.company && (
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide block mb-0.5">Company</span>
                  <span className="text-gray-900">{lead.company}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {lead.message && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Initial Message
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {lead.message}
              </p>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Activity Timeline
            </h3>

            {/* Log new activity */}
            <div className="bg-gray-50 rounded-lg p-4 mb-5 space-y-3 border border-gray-200">
              <div className="flex items-center gap-2">
                {ACTIVITY_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActivityType(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activityType === t
                        ? 'bg-[#0B4D32] text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{activityIcons[t]}</span>
                    {t}
                  </button>
                ))}
              </div>
              {activityError && (
                <p className="text-xs text-red-500">{activityError}</p>
              )}
              <textarea
                value={activityNote}
                onChange={(e) => setActivityNote(e.target.value)}
                rows={3}
                placeholder={`Add a ${activityType.toLowerCase()} note...`}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#009B91] resize-none bg-white"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleLogActivity}
                  disabled={loggingActivity}
                  className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                >
                  {loggingActivity ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  Log Activity
                </button>
              </div>
            </div>

            {/* Timeline */}
            {activities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No activities logged yet.</p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0B4D32]/10 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                      {activityIcons[activity.type] ?? '•'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-gray-600">{activity.type}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(activity.createdAt).toLocaleString('en-GB', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.note}</p>
                      {activity.createdBy && (
                        <p className="text-xs text-gray-400 mt-0.5">by {activity.createdBy}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT COLUMN (1/3) ===== */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Lead Details
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="input-brand w-full text-sm"
              >
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input-brand w-full text-sm"
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Assigned To</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="input-brand w-full text-sm"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Proposal Value (SAR)</label>
              <input
                type="number"
                value={proposalValue}
                onChange={(e) => setProposalValue(e.target.value)}
                className="input-brand w-full text-sm"
                placeholder="0.00"
                min={0}
                step={1000}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Expected Close Date</label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="input-brand w-full text-sm"
              />
            </div>

            {saveSuccess && (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 text-center">
                Details saved successfully.
              </div>
            )}

            <button
              onClick={handleSaveDetails}
              disabled={savingDetails}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm"
            >
              {savingDetails ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {savingDetails ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Quick info card */}
          <div className="bg-[#0B4D32]/5 rounded-xl border border-[#0B4D32]/10 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-[#0B4D32] uppercase tracking-wide">Summary</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Inquiry</span>
                <span className="font-medium text-gray-900">{lead.inquiryType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Activities</span>
                <span className="font-medium text-gray-900">{activities.length}</span>
              </div>
              {lead.proposalValue && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Proposal</span>
                  <span className="font-medium text-gray-900">
                    SAR {lead.proposalValue.toLocaleString()}
                  </span>
                </div>
              )}
              {lead.expectedCloseDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Close Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(lead.expectedCloseDate).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
