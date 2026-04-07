'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2, ShieldOff } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Modal from '@/components/admin/Modal'
import StatusBadge from '@/components/admin/StatusBadge'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

const ROLES = ['ADMIN', 'MANAGER', 'SALES', 'WEB_ADMIN'] as const

const emptyAddForm = {
  name: '',
  email: '',
  password: '',
  role: 'SALES' as string,
}

interface EditForm {
  name: string
  email: string
  role: string
  isActive: boolean
  password: string
}

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Add modal
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(emptyAddForm)
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState('')

  // Edit modal
  const [editOpen, setEditOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    name: '', email: '', role: 'SALES', isActive: true, password: '',
  })
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const currentUserId = (session?.user as { id?: string })?.id
  const currentRole = (session?.user as { role?: string })?.role

  const isAdmin = currentRole === 'ADMIN'

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) fetchUsers()
  }, [isAdmin, fetchUsers])

  // Access denied for non-admins
  if (!isAdmin && session) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center">
          <ShieldOff size={40} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
          <p className="text-sm text-red-600">
            You need ADMIN role to access user management.
          </p>
        </div>
      </div>
    )
  }

  const openAdd = () => {
    setAddForm(emptyAddForm)
    setAddError('')
    setAddOpen(true)
  }

  const openEdit = (u: User) => {
    setEditTarget(u)
    setEditForm({
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      password: '',
    })
    setEditError('')
    setEditOpen(true)
  }

  const handleAdd = async () => {
    if (!addForm.name.trim()) { setAddError('Name is required.'); return }
    if (!addForm.email.trim()) { setAddError('Email is required.'); return }
    if (!addForm.password.trim()) { setAddError('Password is required.'); return }
    setAddSaving(true)
    setAddError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to create user')
      }
      setAddOpen(false)
      fetchUsers()
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : 'Failed to create user.')
    } finally {
      setAddSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!editForm.name.trim()) { setEditError('Name is required.'); return }
    if (!editForm.email.trim()) { setEditError('Email is required.'); return }
    if (!editTarget) return
    setEditSaving(true)
    setEditError('')
    try {
      const payload: Record<string, unknown> = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        isActive: editForm.isActive,
      }
      if (editForm.password.trim()) {
        payload.password = editForm.password
      }
      const res = await fetch(`/api/users/${editTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Failed to update user')
      }
      setEditOpen(false)
      fetchUsers()
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : 'Failed to update user.')
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async (user: User) => {
    if (user.id === currentUserId) {
      alert('You cannot delete your own account.')
      return
    }
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } catch {
      setError('Failed to delete user.')
    }
  }

  const toggleActive = async (user: User) => {
    if (user.id === currentUserId) {
      alert('You cannot deactivate your own account.')
      return
    }
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      if (!res.ok) throw new Error('Update failed')
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !user.isActive } : u))
      )
    } catch {
      setError('Failed to update user.')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage admin user accounts</p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus size={16} /> Add User
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
        ) : users.length === 0 ? (
          <p className="p-10 text-center text-gray-400 text-sm">No users found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#0B4D32] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Active</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isSelf = user.id === currentUserId
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#0B4D32] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {user.name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                          {isSelf && (
                            <span className="ml-2 text-xs bg-[#009B91]/10 text-[#009B91] px-1.5 py-0.5 rounded font-medium">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.role} type="role" />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(user)}
                        disabled={isSelf}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                          user.isActive ? 'bg-[#009B91]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            user.isActive ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-gray-400 hover:text-[#009B91] hover:bg-teal-50 rounded"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={isSelf}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                          title={isSelf ? 'Cannot delete yourself' : 'Delete'}
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

      {/* Add User Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add User">
        <div className="space-y-4">
          {addError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {addError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={addForm.name}
              onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
              className="input-brand w-full"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
              className="input-brand w-full"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={addForm.password}
              onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))}
              className="input-brand w-full"
              placeholder="Minimum 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select
              value={addForm.role}
              onChange={(e) => setAddForm((p) => ({ ...p, role: e.target.value }))}
              className="input-brand w-full"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setAddOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={addSaving}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
            >
              {addSaving && <Loader2 size={14} className="animate-spin" />}
              {addSaving ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit User — ${editTarget?.name ?? ''}`}
      >
        <div className="space-y-4">
          {editError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {editError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              className="input-brand w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
              className="input-brand w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
              className="input-brand w-full"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password{' '}
              <span className="text-gray-400 font-normal text-xs">(leave blank to keep current)</span>
            </label>
            <input
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
              className="input-brand w-full"
              placeholder="Enter new password or leave blank"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={editForm.isActive}
              disabled={editTarget?.id === currentUserId}
              onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">
              Account Active
              {editTarget?.id === currentUserId && (
                <span className="ml-2 text-xs text-gray-400">(cannot change your own)</span>
              )}
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={editSaving}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
            >
              {editSaving && <Loader2 size={14} className="animate-spin" />}
              {editSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
