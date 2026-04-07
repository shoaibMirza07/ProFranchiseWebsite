'use client'

interface StatusBadgeProps {
  status: string
  type?: 'stage' | 'applicant' | 'role' | 'priority' | 'default'
}

const stageColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-purple-100 text-purple-700',
  QUALIFIED: 'bg-yellow-100 text-yellow-700',
  PROPOSAL: 'bg-orange-100 text-orange-700',
  NEGOTIATION: 'bg-pink-100 text-pink-700',
  WON: 'bg-green-100 text-green-700',
  LOST: 'bg-red-100 text-red-700',
}

const applicantColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  REVIEWED: 'bg-yellow-100 text-yellow-700',
  SHORTLISTED: 'bg-purple-100 text-purple-700',
  REJECTED: 'bg-red-100 text-red-700',
  HIRED: 'bg-green-100 text-green-700',
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-orange-100 text-orange-700',
  SALES: 'bg-teal-100 text-teal-700',
  WEB_ADMIN: 'bg-purple-100 text-purple-700',
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-red-100 text-red-700',
}

export default function StatusBadge({ status, type = 'default' }: StatusBadgeProps) {
  let colorClass = 'bg-gray-100 text-gray-600'

  if (type === 'stage') colorClass = stageColors[status] ?? colorClass
  else if (type === 'applicant') colorClass = applicantColors[status] ?? colorClass
  else if (type === 'role') colorClass = roleColors[status] ?? colorClass
  else if (type === 'priority') colorClass = priorityColors[status] ?? colorClass

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
