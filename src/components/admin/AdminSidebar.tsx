'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Settings,
  Navigation,
  AlignJustify,
  Building2,
  Handshake,
  Users,
  Image,
  FileText,
  Kanban,
  Briefcase,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Phone,
  UserCheck,
  BookOpen,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles?: string[]
}

interface NavSection {
  title: string
  items: NavItem[]
  roles?: string[]
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    ],
  },
  {
    title: 'Website',
    roles: ['ADMIN', 'WEB_ADMIN'],
    items: [
      { href: '/admin/settings', label: 'General Settings', icon: <Settings size={16} />, roles: ['ADMIN', 'WEB_ADMIN'] },
      { href: '/admin/header', label: 'Header & Navigation', icon: <Navigation size={16} />, roles: ['ADMIN', 'WEB_ADMIN'] },
      { href: '/admin/footer', label: 'Footer', icon: <AlignJustify size={16} />, roles: ['ADMIN', 'WEB_ADMIN'] },
    ],
  },
  {
    title: 'Masters',
    roles: ['ADMIN', 'WEB_ADMIN'],
    items: [
      { href: '/admin/brands', label: 'Brands', icon: <Building2 size={16} />, roles: ['ADMIN', 'WEB_ADMIN'] },
      { href: '/admin/partners', label: 'Partners', icon: <Handshake size={16} />, roles: ['ADMIN', 'WEB_ADMIN'] },
      { href: '/admin/contacts', label: 'Contacts', icon: <Phone size={16} />, roles: ['ADMIN', 'WEB_ADMIN'] },
      { href: '/admin/customers', label: 'Customers', icon: <UserCheck size={16} />, roles: ['ADMIN', 'WEB_ADMIN'] },
      { href: '/admin/team', label: 'Team', icon: <Users size={16} />, roles: ['ADMIN', 'WEB_ADMIN'] },
      { href: '/admin/gallery', label: 'Gallery', icon: <Image size={16} />, roles: ['ADMIN', 'WEB_ADMIN'] },
    ],
  },
  {
    title: 'Pages',
    roles: ['ADMIN', 'WEB_ADMIN'],
    items: [
      { href: '/admin/pages', label: 'Page Builder', icon: <FileText size={16} />, roles: ['ADMIN', 'WEB_ADMIN'] },
    ],
  },
  {
    title: 'CRM',
    roles: ['ADMIN', 'MANAGER', 'SALES'],
    items: [
      { href: '/admin/pipeline', label: 'Pipeline', icon: <Kanban size={16} />, roles: ['ADMIN', 'MANAGER', 'SALES'] },
    ],
  },
  {
    title: 'HR',
    roles: ['ADMIN', 'MANAGER'],
    items: [
      { href: '/admin/jobs', label: 'Job Applicants', icon: <Briefcase size={16} />, roles: ['ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: 'System',
    roles: ['ADMIN'],
    items: [
      { href: '/admin/users', label: 'Users', icon: <ShieldCheck size={16} />, roles: ['ADMIN'] },
      { href: '/admin/api-reference', label: 'API Reference', icon: <BookOpen size={16} />, roles: ['ADMIN'] },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const userRole = (session?.user as { role?: string })?.role ?? 'SALES'

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const canAccess = (roles?: string[]) => {
    if (!roles) return true
    return roles.includes(userRole)
  }

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#009B91] flex items-center justify-center text-white font-bold text-sm">
            PF
          </div>
          {!collapsed && (
            <span className="text-white font-bold text-lg tracking-tight">ProFranchise</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex text-white/60 hover:text-white p-1 rounded transition-colors"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* User badge */}
      {!collapsed && session?.user && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#009B91]/30 flex items-center justify-center text-[#009B91] font-semibold text-sm">
              {session.user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-white/50 text-xs">{userRole}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navSections.map((section) => {
          if (!canAccess(section.roles)) return null
          const visibleItems = section.items.filter((item) => canAccess(item.roles))
          if (visibleItems.length === 0) return null

          const isSectionExpanded = expandedSections[section.title] !== false

          if (collapsed) {
            return (
              <div key={section.title} className="space-y-1">
                {visibleItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`flex items-center justify-center p-2.5 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-[#009B91] text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.icon}
                  </Link>
                ))}
              </div>
            )
          }

          return (
            <div key={section.title} className="mb-4">
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-white/40 text-xs font-semibold uppercase tracking-wider hover:text-white/60 transition-colors"
              >
                <span>{section.title}</span>
                {isSectionExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              {isSectionExpanded && (
                <div className="space-y-0.5 mt-1">
                  {visibleItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive(item.href)
                          ? 'bg-[#009B91] text-white font-medium'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm transition-colors"
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-[#0B4D32] text-white p-2 rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 admin-sidebar transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:flex flex-col flex-shrink-0 admin-sidebar transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent />
      </div>
    </>
  )
}
