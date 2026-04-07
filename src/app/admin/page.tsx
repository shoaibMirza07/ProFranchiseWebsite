import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  UserPlus,
  ArrowRight,
  Kanban,
  Settings,
} from 'lucide-react'

async function getDashboardStats() {
  const [
    totalLeads,
    newLeads,
    totalBrands,
    teamMembers,
    jobApplicants,
    recentLeads,
    pipelineBreakdown,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { stage: 'NEW' } }),
    prisma.brand.count(),
    prisma.teamMember.count(),
    prisma.jobApplicant.count(),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { name: true } },
      },
    }),
    prisma.lead.groupBy({
      by: ['stage'],
      _count: { stage: true },
      orderBy: { stage: 'asc' },
    }),
  ])

  return { totalLeads, newLeads, totalBrands, teamMembers, jobApplicants, recentLeads, pipelineBreakdown }
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

export default async function AdminDashboard() {
  const session = await auth()
  const stats = await getDashboardStats()
  const userName = session?.user?.name ?? 'Admin'

  const statCards = [
    {
      label: 'Total Leads',
      value: stats.totalLeads,
      icon: <TrendingUp size={20} />,
      color: 'bg-blue-500',
      href: '/admin/pipeline',
    },
    {
      label: 'New Leads',
      value: stats.newLeads,
      icon: <UserPlus size={20} />,
      color: 'bg-[#009B91]',
      href: '/admin/pipeline',
    },
    {
      label: 'Total Brands',
      value: stats.totalBrands,
      icon: <Building2 size={20} />,
      color: 'bg-[#0B4D32]',
      href: '/admin/brands',
    },
    {
      label: 'Team Members',
      value: stats.teamMembers,
      icon: <Users size={20} />,
      color: 'bg-purple-500',
      href: '/admin/team',
    },
    {
      label: 'Job Applicants',
      value: stats.jobApplicants,
      icon: <Briefcase size={20} />,
      color: 'bg-orange-500',
      href: '/admin/jobs',
    },
  ]

  const quickActions = [
    { label: 'Add Lead', href: '/admin/pipeline', icon: <UserPlus size={16} /> },
    { label: 'Manage Brands', href: '/admin/brands', icon: <Building2 size={16} /> },
    { label: 'Pipeline', href: '/admin/pipeline', icon: <Kanban size={16} /> },
    { label: 'Settings', href: '/admin/settings', icon: <Settings size={16} /> },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {userName.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with ProFranchise today.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} text-white p-2.5 rounded-lg`}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Leads</h2>
            <Link
              href="/admin/pipeline"
              className="text-sm text-[#009B91] hover:text-[#007a71] flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      No leads yet
                    </td>
                  </tr>
                ) : (
                  stats.recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <Link href={`/admin/pipeline/${lead.id}`} className="font-medium text-gray-900 hover:text-[#009B91]">
                          {lead.fullName}
                        </Link>
                        <p className="text-xs text-gray-400">{lead.email}</p>
                      </td>
                      <td className="px-6 py-3 text-gray-600">{lead.inquiryType}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${stageColors[lead.stage] ?? 'bg-gray-100 text-gray-600'}`}>
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {lead.assignedTo?.name ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pipeline Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Pipeline Breakdown</h2>
          </div>
          <div className="p-6 space-y-3">
            {stats.pipelineBreakdown.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
            ) : (
              stats.pipelineBreakdown.map((item) => (
                <div key={item.stage} className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${stageColors[item.stage] ?? 'bg-gray-100 text-gray-600'}`}>
                    {item.stage}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-[#009B91] h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (item._count.stage / stats.totalLeads) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-5 text-right">
                      {item._count.stage}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-[#009B91] hover:text-white text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200 hover:border-[#009B91]"
            >
              {action.icon}
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
